import {env} from 'cloudflare:workers';
import type {CoreSnapshot,Patient,Appointment,Visit,Block} from '@/lib/types';
import {InputError,record,id,patientInput,appointmentInput,visitInput,blockInput,publicRequestInput} from '@/lib/validation';
function database(){if(!env.DB)throw new InputError('La base de datos no está configurada.',503);return env.DB}
const hhmm=(n:number)=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
export async function readCore():Promise<CoreSnapshot>{const db=database();const res=await db.batch<Record<string,unknown>>([db.prepare('SELECT * FROM patients ORDER BY name COLLATE NOCASE'),db.prepare('SELECT * FROM appointments ORDER BY date,start_minutes'),db.prepare('SELECT * FROM consultations ORDER BY date,id'),db.prepare('SELECT * FROM schedule_blocks ORDER BY date,start_minutes'),db.prepare('SELECT revision FROM app_state WHERE id=1')]);
const patients=res[0].results.map((r):Patient=>({id:Number(r.id),name:String(r.name),age:Number(r.age),dni:String(r.dni),email:String(r.email),phone:String(r.phone),goal:String(r.goal),os:String(r.insurance),active:!!r.active,allergies:String(r.allergies),notes:String(r.notes)}));
const appointments=res[1].results.map((r):Appointment=>({id:Number(r.id),patient:Number(r.patient_id),date:String(r.date),time:hhmm(Number(r.start_minutes)),duration:Number(r.duration),type:String(r.type),mode:String(r.mode),confirmed:['confirmado','atendido'].includes(String(r.status)),status:r.status==='atendido'?'Atendido':r.status==='cancelado'?'Cancelado':r.status==='ausente'?'No asistió':'Programado',source:String(r.source),requestCode:r.request_code?String(r.request_code):undefined,requestNotes:String(r.request_notes||'')}));
const visits=res[2].results.map((r):Visit=>({id:Number(r.id),patient:Number(r.patient_id),appointmentId:r.appointment_id?Number(r.appointment_id):undefined,date:String(r.date),reason:String(r.reason),notes:String(r.notes),goal:String(r.goal),indications:String(r.indications),weight:Number(r.weight),height:Number(r.height),fat:Number(r.fat),muscle:Number(r.muscle),waist:Number(r.waist),hip:Number(r.hip),custom:JSON.parse(String(r.custom_json)),draft:!!r.draft}));
const blocks=res[3].results.map((r):Block=>({id:Number(r.id),date:String(r.date),time:hhmm(Number(r.start_minutes)),duration:Number(r.duration),reason:String(r.reason)}));return {patients,appointments,visits,blocks,revision:Number(res[4].results[0]?.revision||0)}}
export async function saveCommands(body:unknown,actor:string){const x=record(body);const revision=Number(x.revision);if(!Number.isInteger(revision)||revision<0)throw new InputError('Versión de datos inválida.');if(!Array.isArray(x.commands)||x.commands.length<1||x.commands.length>30)throw new InputError('Operación inválida.');const db=database();const statements:D1PreparedStatement[]=[db.prepare('INSERT OR IGNORE INTO app_state(id,revision) VALUES(1,0)'),db.prepare('UPDATE app_state SET revision=CASE WHEN revision=? THEN revision+1 ELSE -1 END WHERE id=1').bind(revision)];
for(const raw of x.commands){const c=record(raw);if(!['create','update','delete'].includes(String(c.action)))throw new InputError('Acción inválida.');const creating=c.action==='create';
if(c.entity==='patients'){if(c.action==='delete')throw new InputError('Los pacientes se desactivan; su historia se conserva.');const v=patientInput(c.value);if(!creating&&!await db.prepare('SELECT id FROM patients WHERE id=?').bind(v.id).first())throw new InputError('Paciente no encontrado.',404);statements.push(creating?db.prepare('INSERT INTO patients(id,name,age,dni,email,phone,goal,insurance,active,allergies,notes) VALUES(?,?,?,?,?,?,?,?,?,?,?)').bind(v.id,v.name,v.age,v.dni,v.email,v.phone,v.goal,v.os,+v.active,v.allergies,v.notes):db.prepare('UPDATE patients SET name=?,age=?,dni=?,email=?,phone=?,goal=?,insurance=?,active=?,allergies=?,notes=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(v.name,v.age,v.dni,v.email,v.phone,v.goal,v.os,+v.active,v.allergies,v.notes,v.id));}
else if(c.entity==='appointments'){if(c.action==='delete')throw new InputError('Los turnos se cancelan; no se eliminan.');const v=appointmentInput(c.value);const old=!creating?await db.prepare('SELECT id FROM appointments WHERE id=?').bind(v.id).first():null;if(!creating&&!old)throw new InputError('Turno no encontrado.',404);const params=[v.patient,v.date,v.start,v.duration,v.type,v.mode,v.status];statements.push(creating?db.prepare('INSERT INTO appointments(patient_id,date,start_minutes,duration,type,mode,status,id) VALUES(?,?,?,?,?,?,?,?)').bind(...params,v.id):db.prepare('UPDATE appointments SET patient_id=?,date=?,start_minutes=?,duration=?,type=?,mode=?,status=? WHERE id=?').bind(...params,v.id));}
else if(c.entity==='visits'){
  if(c.action!=='create')throw new InputError('Las consultas guardadas conservan su registro original.');
  const v=visitInput(c.value);
  if(v.appointmentId){
    const appointment=await db.prepare('SELECT patient_id,status FROM appointments WHERE id=?').bind(v.appointmentId).first();
    if(!appointment||Number(appointment.patient_id)!==v.patient||appointment.status==='cancelado')throw new InputError('El turno no corresponde al paciente o está cancelado.');
  }
  statements.push(db.prepare('INSERT INTO consultations(id,patient_id,appointment_id,date,reason,notes,goal,indications,weight,height,fat,muscle,waist,hip,custom_json,draft,created_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(v.id,v.patient,v.appointmentId,v.date,v.reason,v.notes,v.goal,v.indications,v.weight,v.height,v.fat,v.muscle,v.waist,v.hip,v.custom,+v.draft,actor));
  if(v.appointmentId&&!v.draft){
    statements.push(db.prepare("UPDATE appointments SET status='atendido' WHERE id=?").bind(v.appointmentId));
  }
}
else if(c.entity==='blocks'){if(c.action==='delete'){statements.push(db.prepare('DELETE FROM schedule_blocks WHERE id=?').bind(id(c.id)));continue}if(!creating)throw new InputError('Quitá el bloqueo y creá uno nuevo.');const v=blockInput(c.value);statements.push(db.prepare('INSERT INTO schedule_blocks(id,date,start_minutes,duration,reason) VALUES(?,?,?,?,?)').bind(v.id,v.date,v.start,v.duration,v.reason));}
else throw new InputError('Tipo de registro inválido.');}
await db.batch(statements);return readCore();}
function randomId(){const nums=crypto.getRandomValues(new Uint32Array(2));return (nums[0]&0xfffff)*4294967296+nums[1]}

export async function createPublicRequest(body:unknown){
  const v=publicRequestInput(body);
  const db=database();
  const findReceipt=()=>db.prepare('SELECT request_code,date,start_minutes FROM appointments WHERE request_key=?').bind(v.requestKey).first();
  const receipt=(row:Record<string,unknown>)=>({code:String(row.request_code),status:'pendiente',date:String(row.date),time:hhmm(Number(row.start_minutes))});
  const previous=await findReceipt();
  if(previous)return receipt(previous);
  const patient=randomId(),appointment=randomId(),code='NT-'+crypto.randomUUID().replaceAll('-','').slice(0,10).toUpperCase();
  try{
    await db.batch([
      db.prepare('INSERT OR IGNORE INTO app_state(id,revision) VALUES(1,0)'),
      db.prepare('UPDATE app_state SET revision=revision+1 WHERE id=1'),
      db.prepare('INSERT INTO patients(id,name,email,phone,goal) VALUES(?,?,?,?,?)').bind(patient,v.name,v.email,v.phone,'Primera consulta'),
      db.prepare("INSERT INTO appointments(id,patient_id,date,start_minutes,duration,type,mode,status,source,request_key,request_code,request_notes) VALUES(?,?,?,?,45,'Primera consulta','Presencial','pendiente','public',?,?,?)").bind(appointment,patient,v.date,v.start,v.requestKey,code,v.notes),
    ]);
  }catch(error){
    // A concurrent retry can win the unique request_key; return its stored receipt.
    const existing=await findReceipt();
    if(existing)return receipt(existing);
    throw error;
  }
  return {code,status:'pendiente',date:v.date,time:hhmm(v.start)};
}
