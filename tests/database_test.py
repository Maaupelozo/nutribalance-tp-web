"""Apply the actual SQL migration to SQLite and test persistence constraints."""
import sqlite3,unittest
from pathlib import Path
class DatabaseTest(unittest.TestCase):
 def setUp(self):
  self.db=sqlite3.connect(':memory:')
  self.db.execute('PRAGMA foreign_keys=ON')
  for file in sorted(Path('drizzle').glob('*.sql')):self.db.executescript(file.read_text())
  self.db.execute("INSERT INTO patients(id,name,dni) VALUES(1,'Paciente ficticio','10000000')")
  self.db.commit()
 def tearDown(self):self.db.close()
 def appointment(self,id,start,status='confirmado'):
  self.db.execute("INSERT INTO appointments(id,patient_id,date,start_minutes,duration,status) VALUES(?,1,'2026-11-03',?,45,?)",(id,start,status))
 def test_foreign_key(self):
  with self.assertRaises(sqlite3.IntegrityError):self.db.execute("INSERT INTO appointments(patient_id,date,start_minutes,duration) VALUES(999,'2026-11-03',600,45)")
 def test_confirmed_overlap(self):
  self.appointment(1,600)
  with self.assertRaisesRegex(sqlite3.IntegrityError,'schedule_overlap'):self.appointment(2,620)
  self.appointment(3,645)
 def test_pending_can_be_reviewed_but_not_confirmed_over_occupied_slot(self):
  self.appointment(1,600)
  self.appointment(2,600,'pendiente')
  with self.assertRaisesRegex(sqlite3.IntegrityError,'schedule_overlap'):self.db.execute("UPDATE appointments SET status='confirmado' WHERE id=2")
 def test_block_conflicts(self):
  self.db.execute("INSERT INTO schedule_blocks(date,start_minutes,duration,reason) VALUES('2026-11-03',600,60,'No disponible')")
  with self.assertRaisesRegex(sqlite3.IntegrityError,'schedule_overlap'):self.appointment(1,610)
 def test_unique_dni(self):
  with self.assertRaises(sqlite3.IntegrityError):self.db.execute("INSERT INTO patients(name,dni) VALUES('Otro ficticio','10000000')")
 def test_completed_consultation_not_overwritten(self):
  self.db.execute("INSERT INTO consultations(id,patient_id,date,reason,notes,goal,indications,weight,height,created_by) VALUES(1,1,'2026-11-03','Control','Notas','Objetivos','Indicaciones',70,170,'test')")
  with self.assertRaisesRegex(sqlite3.IntegrityError,'consultation_immutable'):self.db.execute("UPDATE consultations SET notes='Sobrescrito' WHERE id=1")
 def test_stale_revision_rolls_back_entire_transaction(self):
  self.db.execute('INSERT INTO app_state(id,revision) VALUES(1,2)');self.db.commit()
  with self.assertRaises(sqlite3.IntegrityError):
   with self.db:
    self.db.execute("INSERT INTO patients(id,name) VALUES(2,'No debe persistir')")
    self.db.execute('UPDATE app_state SET revision=CASE WHEN revision=0 THEN revision+1 ELSE -1 END WHERE id=1')
  self.assertIsNone(self.db.execute('SELECT id FROM patients WHERE id=2').fetchone())
if __name__=='__main__':unittest.main(verbosity=2)
