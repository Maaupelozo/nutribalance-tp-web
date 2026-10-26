'use client';
import {useCallback,useEffect,useId,useRef,useState,type FormEvent,type ReactNode} from 'react';
import {ArrowLeft,ArrowUpRight,CalendarDays,Check,ChevronLeft,ChevronRight,FileText,Leaf,LayoutDashboard,LogOut,Menu,Plus,Search,Settings,Users,X} from 'lucide-react';
import * as api from '@/lib/express-api';
import Avatar from '@/components/ui/PatientAvatar';
import Badge from '@/components/ui/NutriBadge';

type Screen='Resumen'|'Pacientes'|'Agenda'|'Ficha'|'Configuración';
type ModalState={kind:'patient';patient?:api.Patient;appointment?:api.Appointment}|{kind:'consultation';appointment?:api.Appointment}|{kind:'confirm';appointment:api.Appointment;patient?:api.Patient}|{kind:'cancel';appointment:api.Appointment}|null;
type Summary={patients:api.Page<api.Patient>;today:api.Page<api.Appointment>;pending:api.Page<api.Appointment>};
const statusLabels:Record<api.AppointmentStatus,string>={pending:'Pendiente',confirmed:'Confirmado',attended:'Atendido',cancelled:'Cancelado'};
const statusBadge=(status:api.AppointmentStatus)=><Badge tone={status==='pending'?'amber':status==='cancelled'?'neutral':'green'}>{statusLabels[status]}</Badge>;
const emptyPage=<T,>():api.Page<T>=>({data:[],meta:{page:1,pageSize:20,total:0,totalPages:0}});
const message=(e:unknown)=>e instanceof Error?e.message:'No pudimos completar la acción.';

export default function ExpressDashboard(){
  const today=api.localDate();
  const [session,setSession]=useState<api.Session|null>(null),[checking,setChecking]=useState(true),[accessError,setAccessError]=useState('');
  const [screen,setScreen]=useState<Screen>('Resumen'),[mobile,setMobile]=useState(false),[version,setVersion]=useState(0);
  const [summary,setSummary]=useState<Summary|null>(null),[patients,setPatients]=useState(apiEmptyPatients),[appointments,setAppointments]=useState(()=>emptyPage<api.Appointment>());
  const [search,setSearch]=useState(''),[patientPage,setPatientPage]=useState(1),[appointmentPage,setAppointmentPage]=useState(1),[status,setStatus]=useState('');
  const [from,setFrom]=useState(today),[to,setTo]=useState(api.addDays(today,6));
  const [patient,setPatient]=useState<api.Patient|null>(null),[history,setHistory]=useState(()=>emptyPage<api.Consultation>()),[historyPage,setHistoryPage]=useState(1);
  const [loading,setLoading]=useState(false),[loadError,setLoadError]=useState(''),[modal,setModal]=useState<ModalState>(null);
  const [saving,setSaving]=useState(false),[formError,setFormError]=useState<unknown>(null),[toast,setToast]=useState('');
  const busy=useRef(false),requestSequence=useRef(0),detailSequence=useRef(0);
  const refresh=()=>setVersion(value=>value+1);

  const checkSession=useCallback(async()=>{
    setChecking(true);setAccessError('');
    try{const value=await api.getSession();if(value.user.role!=='professional')throw new Error('Esta cuenta no tiene acceso al consultorio.');setSession(value)}
    catch(e){if(e instanceof api.ExpressApiError&&e.status===401)window.location.replace('/ingresar');else setAccessError(message(e))}
    finally{setChecking(false)}
  },[]);
  useEffect(()=>{void checkSession()},[checkSession]);
  useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),5000);return()=>clearTimeout(timer)},[toast]);
  useEffect(()=>{setFormError(null)},[modal]);

  useEffect(()=>{
    if(!session)return;
    const sequence=++requestSequence.current,controller=new AbortController();
    setLoading(true);setLoadError('');
    const run=async()=>{
      try{
        if(screen==='Resumen'){
          const [people,day,pending]=await Promise.all([api.listPatients('',1,controller.signal),api.listAppointments(today,today,1,'',controller.signal),api.listAppointments(today,api.addDays(today,30),1,'pending',controller.signal)]);
          if(sequence===requestSequence.current)setSummary({patients:people,today:day,pending});
        }else if(screen==='Pacientes'){
          const result=await api.listPatients(search,patientPage,controller.signal);if(sequence===requestSequence.current)setPatients(result);
        }else if(screen==='Agenda'){
          if(!from||!to||from>to||to>api.addDays(from,30))throw new Error('Elegí un período de hasta 31 días, con la fecha final después de la inicial.');
          const result=await api.listAppointments(from,to,appointmentPage,status,controller.signal);if(sequence===requestSequence.current)setAppointments(result);
        }else if(screen==='Ficha'&&patient){
          const result=await api.listConsultations(patient.id,historyPage);if(sequence===requestSequence.current)setHistory(result);
        }
      }catch(e){if(sequence===requestSequence.current&&!controller.signal.aborted)setLoadError(message(e))}
      finally{if(sequence===requestSequence.current&&!controller.signal.aborted)setLoading(false)}
    };
    const timer=setTimeout(()=>void run(),screen==='Pacientes'?250:0);
    return()=>{controller.abort();clearTimeout(timer)};
  },[session,screen,search,patientPage,from,to,appointmentPage,status,patient?.id,historyPage,version,today]);

  function navigate(next:Screen){detailSequence.current++;setScreen(next);setMobile(false);setLoadError('')}
  async function openPatient(patientId:string){
    const sequence=++detailSequence.current;setScreen('Ficha');setMobile(false);setPatient(null);setHistory(emptyPage());setHistoryPage(1);setLoadError('');setLoading(true);
    try{const result=await api.getPatient(patientId);if(sequence===detailSequence.current){setPatient(result);refresh()}}
    catch(e){if(sequence===detailSequence.current){setLoadError(message(e));setLoading(false)}}
  }
  function openModal(value:ModalState){setFormError(null);setModal(value)}
  async function save(action:()=>Promise<void>,success:string){
    if(busy.current)return;busy.current=true;setSaving(true);setFormError(null);
    try{await action();setModal(null);setToast(success);refresh();return true}
    catch(e){setFormError(e);return false}finally{busy.current=false;setSaving(false)}
  }
  async function signOut(){
    if(busy.current)return;busy.current=true;setSaving(true);setLoadError('');
    try{await api.logout();setSession(null);setPatient(null);setSummary(null);setPatients(apiEmptyPatients());setAppointments(emptyPage());setHistory(emptyPage());window.location.replace('/ingresar')}
    catch(e){if(e instanceof api.ExpressApiError&&e.status===401)window.location.replace('/ingresar');else setLoadError(message(e));busy.current=false;setSaving(false)}
  }
  async function savePatient(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(modal?.kind!=='patient')return;
    const fields=new FormData(event.currentTarget),text=(name:string)=>String(fields.get(name)||'').trim(),optional=(name:string)=>text(name)||null;
    const input:api.PatientInput={firstName:text('firstName'),lastName:text('lastName'),phone:text('phone'),documentNumber:optional('documentNumber'),birthDate:optional('birthDate'),email:optional('email'),background:optional('background'),allergies:optional('allergies'),medication:optional('medication')};
    const current=modal.patient,appointment=modal.appointment;let savedPatient:api.Patient|undefined;
    const ok=await save(async()=>{const saved=current?await api.editPatient(current.id,input):await api.createPatient(input);savedPatient=saved;detailSequence.current++;setPatient(saved);setHistoryPage(1);setHistory(emptyPage());setScreen('Ficha')},current?'Ficha actualizada':'Paciente registrado');
    if(ok&&appointment&&savedPatient)openModal({kind:'confirm',appointment,patient:savedPatient});
  }
  async function saveConsultation(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(!patient||modal?.kind!=='consultation')return;
    const fields=new FormData(event.currentTarget),text=(name:string)=>String(fields.get(name)||'').trim(),optional=(name:string)=>text(name)||null,numeric=(name:string)=>text(name)?Number(text(name)):null;
    const input:api.ConsultationInput={date:text('date'),reason:text('reason'),instructions:text('instructions'),objective:optional('objective'),observations:optional('observations'),weightKg:numeric('weightKg'),heightCm:numeric('heightCm'),waistCm:numeric('waistCm'),appointmentId:modal.appointment?.id??null};
    await save(async()=>{await api.createConsultation(patient.id,input);setHistoryPage(1)},'Consulta guardada en el historial');
  }
  async function registerFromAppointment(appointment:api.Appointment){
    if(!appointment.patientId)return;
    try{const selected=await api.getPatient(appointment.patientId);detailSequence.current++;setPatient(selected);setHistoryPage(1);setHistory(emptyPage());setScreen('Ficha');openModal({kind:'consultation',appointment})}
    catch(e){setLoadError(message(e))}
  }

  if(checking)return <div className="connection-screen" role="status"><Leaf size={32}/><h1>Cargando tu consultorio</h1><p>Preparando tu espacio de trabajo…</p></div>;
  if(accessError)return <div className="connection-screen" role="alert"><h1>No pudimos abrir el consultorio</h1><p>{accessError}</p><button className="btn" onClick={()=>void checkSession()}>Volver a intentar</button><a href="/ingresar">Volver al acceso</a></div>;
  if(!session)return <div className="connection-screen" role="status">Abriendo el acceso profesional…</div>;
  const nav=[{label:'Resumen',icon:LayoutDashboard},{label:'Pacientes',icon:Users},{label:'Agenda',icon:CalendarDays},{label:'Configuración',icon:Settings}] as const;
  const title=screen==='Resumen'?'Hoy en el consultorio':screen==='Ficha'?(patient?api.fullName(patient):'Ficha del paciente'):screen==='Configuración'?'Tu consultorio':screen;
  const empty=(text:string)=><div className="empty"><FileText size={28}/><p>{text}</p></div>;
  const appointmentList=(list:api.Appointment[])=>list.length?<div className="express-appointments">{list.map(appointment=><article className="appointment-row" key={appointment.id}>
    <div className="time"><strong>{api.localTime(appointment.startsAt)}</strong><small>{api.dateText(api.localDate(new Date(appointment.startsAt)))}</small></div>
    <Avatar name={appointment.contactName}/><div className="grow"><strong>{appointment.contactName}</strong><small>{appointment.contactPhone}</small>{appointment.contactEmail&&<small>{appointment.contactEmail}</small>}</div>{statusBadge(appointment.status)}
    <div className="express-row-actions">
      {appointment.patientId&&<button className="textbutton" onClick={()=>void openPatient(appointment.patientId!)}>Abrir ficha <ArrowUpRight size={16}/></button>}
      {appointment.status==='pending'&&<button className="btn secondary" onClick={()=>openModal({kind:'confirm',appointment})}>Confirmar</button>}
      {appointment.status==='confirmed'&&appointment.patientId&&<button className="btn" disabled={new Date(appointment.startsAt)>new Date()} title={new Date(appointment.startsAt)>new Date()?'Disponible cuando comience el turno':undefined} onClick={()=>void registerFromAppointment(appointment)}>Registrar consulta</button>}
      {['pending','confirmed'].includes(appointment.status)&&<button className="textbutton cancel-action" onClick={()=>openModal({kind:'cancel',appointment})}>Cancelar turno</button>}
    </div>
  </article>)}</div>:empty('No hay turnos en este período.');

  return <div className="app express-workspace"><a className="skip-link" href="#panel-contenido">Saltar al contenido principal</a>
    <aside id="consultorio-navigation" className={mobile?'sidebar open':'sidebar'}>
      <button className="brand brand-button" onClick={()=>navigate('Resumen')}>nutri<em>balance</em><span className="brand-dot">.</span></button>
      <div className="workspace"><span className="workspace-logo">MP</span><div><strong>NutriBalance</strong><small>Espacio profesional</small></div></div><small className="nav-label">CONSULTORIO</small>
      <nav aria-label="Consultorio">{nav.map(({label,icon:Icon})=><button key={label} className={screen===label||screen==='Ficha'&&label==='Pacientes'?'nav-item selected':'nav-item'} onClick={()=>navigate(label)}><Icon size={19}/>{label}</button>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item" disabled={saving} onClick={()=>void signOut()}><LogOut size={17}/>Cerrar sesión</button><div className="help-card"><Leaf size={20}/><strong>Menos tareas. Más cuidado.</strong><p>Todo lo importante, en un mismo lugar.</p></div><div className="profile"><Avatar name="Mauricio Pelozo"/><div><strong>Mauricio Pelozo</strong><small>Nutricionista</small></div></div></div>
    </aside>
    <div className="main"><header className="topbar"><button className="iconbtn mobile-menu" aria-label={mobile?'Cerrar menú':'Abrir menú'} aria-expanded={mobile} aria-controls="consultorio-navigation" onClick={()=>setMobile(!mobile)}><Menu/></button><div className="breadcrumb"><a href="/">NutriBalance</a><ChevronRight size={14}/><strong>{screen==='Ficha'?'Pacientes / Ficha':screen}</strong></div><div className="top-actions"><button className="textbutton" disabled={saving||loading} onClick={refresh}>Actualizar</button><Avatar name="Mauricio Pelozo"/></div></header>
      <main id="panel-contenido"><div className="page-heading"><div><h1>{title}</h1><p className="page-date">{api.dateText(today)}</p><p>{screen==='Resumen'?'Buen día, Mauricio. Tu agenda y tus seguimientos, a mano.':screen==='Pacientes'?'Cada persona, su historia. Todo a un clic.':screen==='Ficha'?'Historia clínica y seguimiento personalizado.':'Organizá tu atención con claridad.'}</p></div><div className="heading-actions">{screen==='Ficha'&&patient?<button className="btn" onClick={()=>openModal({kind:'consultation'})}><Plus size={17}/>Registrar consulta</button>:screen==='Agenda'?<a className="btn" href="/solicitar-turno">Solicitar un turno <ArrowUpRight size={17}/></a>:screen!=='Configuración'&&<button className="btn" onClick={()=>openModal({kind:'patient'})}><Plus size={17}/>Nuevo paciente</button>}</div></div>
        {loadError&&<div className="form-error" role="alert">{loadError}<div className="express-inline-actions"><button className="textbutton" onClick={refresh}>Volver a intentar</button><a href="/ingresar" target="_blank" rel="noopener noreferrer">Volver a ingresar</a></div></div>}
        {loading&&<div className="express-loading" role="status">Cargando información…</div>}
        {!loading&&!loadError&&screen==='Resumen'&&summary&&<>
          <section className="day-hero"><div className="day-hero-main"><span className="hero-kicker">TU DÍA, CON CLARIDAD</span><h2>Más tiempo para acompañar.</h2><p>Prepará cada encuentro con la ficha y el historial a mano.</p><button className="btn on-dark primary" onClick={()=>{setFrom(today);setTo(today);setAppointmentPage(1);setStatus('');navigate('Agenda')}}>Ver agenda de hoy <ArrowUpRight size={17}/></button></div><div className="day-hero-side"><button onClick={()=>{setFrom(today);setTo(api.addDays(today,30));setStatus('pending');setAppointmentPage(1);navigate('Agenda')}}><CalendarDays size={20}/><span><strong>{summary.pending.meta.total} solicitudes pendientes</strong><small>En los próximos 31 días</small></span><ChevronRight size={18}/></button><button onClick={()=>navigate('Pacientes')}><Users size={20}/><span><strong>{summary.patients.meta.total} pacientes</strong><small>Fichas e historial de consultas</small></span><ChevronRight size={18}/></button></div></section>
          <div className="overview-strip"><span><CalendarDays size={18}/><strong>{summary.today.meta.total}</strong> turnos hoy</span><span><Users size={18}/><strong>{summary.patients.meta.total}</strong> fichas de pacientes</span></div>
          <div className="dashboard-grid premium-grid"><section className="card appointments-card"><div className="section-head"><div><h3>Agenda de hoy</h3><p>El orden de los próximos encuentros.</p></div><button className="textbutton" onClick={()=>{setFrom(today);setTo(today);setStatus('');setAppointmentPage(1);navigate('Agenda')}}>Ver agenda <ArrowUpRight size={17}/></button></div>{appointmentList(summary.today.data)}</section><section className="card quick-card"><h3>Tu espacio de trabajo</h3><p>Las acciones de cada consulta.</p><button className="quick-action" onClick={()=>navigate('Pacientes')}><span><Search size={20}/></span><div><strong>Buscar un paciente</strong><small>Abrir su ficha e historial</small></div><ChevronRight size={18}/></button><button className="quick-action" onClick={()=>openModal({kind:'patient'})}><span><Plus size={20}/></span><div><strong>Crear una ficha</strong><small>Comenzar un nuevo seguimiento</small></div><ChevronRight size={18}/></button></section><section className="card"><div className="section-head"><h3>Pacientes a mano</h3><button className="textbutton" onClick={()=>navigate('Pacientes')}>Ver todos</button></div>{summary.patients.data.length?summary.patients.data.slice(0,3).map(value=><button className="recent-patient" key={value.id} onClick={()=>void openPatient(value.id)}><Avatar name={api.fullName(value)}/><div className="grow"><strong>{api.fullName(value)}</strong><small>{value.phone}</small></div><ArrowUpRight size={16}/></button>):empty('Registrá la primera ficha para comenzar el seguimiento.')}</section><section className="card attention-card"><h3>Antes de encontrarse</h3><p>Una revisión breve para darle continuidad a cada consulta.</p><div className="attention-list"><span><Check size={16}/>Motivo del encuentro anterior</span><span><Check size={16}/>Objetivos acordados</span><span><Check size={16}/>Indicaciones de seguimiento</span></div></section></div>
        </>}
        {screen==='Pacientes'&&<section className="card"><div className="toolbar"><label className="searchbox"><Search size={18}/><input aria-label="Buscar pacientes" placeholder="Buscar por nombre, apellido o DNI" value={search} onChange={event=>{setSearch(event.target.value);setPatientPage(1)}}/></label><Badge tone="neutral">{patients.meta.total} pacientes</Badge></div>{!loading&&!loadError&&<><div className="table-wrap"><table><thead><tr><th scope="col">Paciente</th><th scope="col">Documento</th><th scope="col">Contacto</th><th scope="col">Ficha</th></tr></thead><tbody>{patients.data.map(value=><tr key={value.id}><td><div className="person-cell"><Avatar name={api.fullName(value)}/><strong>{api.fullName(value)}</strong></div></td><td>{value.documentNumber||'Sin registrar'}</td><td>{value.phone}<small>{value.email}</small></td><td><button className="textbutton" onClick={()=>void openPatient(value.id)}>Abrir ficha <ArrowUpRight size={16}/></button></td></tr>)}</tbody></table></div>{!patients.data.length&&empty(search?'No encontramos pacientes con esa búsqueda.':'Todavía no hay pacientes registrados.')}<Pagination meta={patients.meta} onChange={setPatientPage}/></>}</section>}
        {screen==='Agenda'&&<section className="card"><div className="toolbar express-agenda-filters"><label>Desde<input type="date" value={from} onChange={event=>{const start=event.target.value;setFrom(start);if(to<start||to>api.addDays(start,30))setTo(api.addDays(start,6));setAppointmentPage(1)}} required/></label><label>Hasta<input type="date" value={to} min={from} max={api.addDays(from,30)} onChange={event=>{setTo(event.target.value);setAppointmentPage(1)}} required/></label><label>Estado<select value={status} onChange={event=>{setStatus(event.target.value);setAppointmentPage(1)}}><option value="">Todos</option>{Object.entries(statusLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label></div>{!loading&&!loadError&&<>{appointmentList(appointments.data)}<Pagination meta={appointments.meta} onChange={setAppointmentPage}/></>}</section>}
        {screen==='Ficha'&&patient&&<><button className="back-link" onClick={()=>navigate('Pacientes')}><ArrowLeft size={16}/>Volver a pacientes</button><section className="patient-banner"><Avatar name={api.fullName(patient)} size="large"/><div className="grow"><h2>{api.fullName(patient)}</h2><p>{patient.documentNumber?'DNI '+patient.documentNumber:'Documento sin registrar'}{patient.birthDate?' · Nació el '+api.dateText(patient.birthDate):''}</p><small>{patient.phone}{patient.email?' · '+patient.email:''}</small></div><button className="btn secondary" onClick={()=>openModal({kind:'patient',patient})}>Editar paciente</button></section><div className="two-col"><section className="card"><span className="overline">HISTORIA CLÍNICA</span><h3>Lo que conviene tener presente</h3><ClinicalText title="Antecedentes" text={patient.background}/><ClinicalText title="Alergias" text={patient.allergies}/><ClinicalText title="Medicación" text={patient.medication}/></section><section className="card objective-card"><span className="overline">SEGUIMIENTO</span><h3>El próximo paso</h3><p>Revisá los encuentros anteriores y registrá lo conversado en la consulta.</p><button className="btn secondary" onClick={()=>openModal({kind:'consultation'})}>Registrar consulta <Plus size={17}/></button></section></div><section className="card express-history"><div className="section-head"><div><h3>Historial de consultas</h3><p>El recorrido, encuentro a encuentro.</p></div><Badge tone="neutral">{history.meta.total} consultas</Badge></div>{!loading&&!loadError&&<>{history.data.length?history.data.map(visit=><article className="express-visit" key={visit.id}><span className="overline">{api.dateText(visit.date)}</span><h3>{visit.reason}</h3><div className="express-measurements">{visit.weightKg!==null&&<span>Peso <strong>{visit.weightKg} kg</strong></span>}{visit.heightCm!==null&&<span>Talla <strong>{visit.heightCm} cm</strong></span>}{visit.waistCm!==null&&<span>Cintura <strong>{visit.waistCm} cm</strong></span>}</div><ClinicalText title="Observaciones" text={visit.observations}/><ClinicalText title="Objetivos" text={visit.objective}/><ClinicalText title="Indicaciones" text={visit.instructions}/></article>):empty('La primera consulta va a aparecer acá cuando la registres.')}<Pagination meta={history.meta} onChange={setHistoryPage}/></>}</section></>}
        {screen==='Configuración'&&<section className="card settings-card"><span className="workspace-logo big">MP</span><h2>NutriBalance</h2><p>Mauricio Pelozo · Nutricionista</p><div className="express-account"><small>Cuenta profesional</small><strong>{session.user.email}</strong></div><a className="btn secondary" href="/">Ver página pública <ArrowUpRight size={17}/></a></section>}
        <footer className="footer"><span>NutriBalance · Mauricio Pelozo</span><span>Solo datos ficticios.</span></footer>
      </main>
    </div>
    {modal&&<Dialog title={modal.kind==='patient'?(modal.patient?'Editar paciente':'Nuevo paciente'):modal.kind==='consultation'?'Registrar consulta':modal.kind==='confirm'?'Confirmar turno':'Cancelar turno'} busy={saving} onClose={()=>setModal(null)}>
      {modal.kind==='patient'&&<form onSubmit={savePatient}><fieldset disabled={saving}><div className="form-grid"><Field label="Nombre *" name="firstName" value={modal.patient?.firstName} maxLength={80} required error={formError}/><Field label="Apellido *" name="lastName" value={modal.patient?.lastName} maxLength={80} required error={formError}/><Field label="Teléfono *" name="phone" type="tel" value={modal.patient?.phone} minLength={6} maxLength={30} required error={formError}/><Field label="DNI" name="documentNumber" value={modal.patient?.documentNumber} pattern="[0-9]{7,9}" maxLength={9} error={formError}/><Field label="Fecha de nacimiento" name="birthDate" type="date" max={today} value={modal.patient?.birthDate} error={formError}/><Field label="Correo" name="email" type="email" maxLength={254} value={modal.patient?.email} error={formError}/></div><TextField label="Antecedentes" name="background" value={modal.patient?.background} maxLength={4000} error={formError}/><TextField label="Alergias" name="allergies" value={modal.patient?.allergies} maxLength={2000} error={formError}/><TextField label="Medicación" name="medication" value={modal.patient?.medication} maxLength={2000} error={formError}/></fieldset><FormError error={formError}/><FormActions busy={saving} label="Guardar ficha" onCancel={()=>setModal(null)}/></form>}
      {modal.kind==='consultation'&&patient&&<form onSubmit={saveConsultation}><div className="person-cell"><Avatar name={api.fullName(patient)}/><strong>{api.fullName(patient)}</strong></div>{modal.appointment&&<p>Turno del {api.dateText(api.localDate(new Date(modal.appointment.startsAt)))} a las {api.localTime(modal.appointment.startsAt)}. Al guardar, queda marcado como atendido.</p>}<fieldset disabled={saving}><div className="form-grid"><Field label="Fecha de consulta *" name="date" type="date" value={modal.appointment?api.localDate(new Date(modal.appointment.startsAt)):today} max={today} required error={formError}/><Field label="Peso (kg)" name="weightKg" type="number" min="0.01" max="500" step="0.01" error={formError}/><Field label="Talla (cm)" name="heightCm" type="number" min="0.01" max="250" step="0.01" error={formError}/><Field label="Cintura (cm)" name="waistCm" type="number" min="0.01" max="300" step="0.01" error={formError}/></div><TextField label="Motivo de consulta *" name="reason" maxLength={500} required error={formError}/><TextField label="Observaciones" name="observations" maxLength={4000} error={formError}/><TextField label="Objetivos" name="objective" maxLength={1000} error={formError}/><TextField label="Indicaciones *" name="instructions" maxLength={4000} required error={formError}/></fieldset><FormError error={formError}/><FormActions busy={saving} label="Guardar consulta" onCancel={()=>setModal(null)}/></form>}
      {modal.kind==='confirm'&&<ConfirmAppointment appointment={modal.appointment} initialPatient={modal.patient} busy={saving} error={formError} onConfirm={patientId=>void save(async()=>{await api.changeAppointment(modal.appointment.id,'confirmed',patientId)},'Turno confirmado')} onNewPatient={()=>openModal({kind:'patient',appointment:modal.appointment})} onCancel={()=>setModal(null)}/>}
      {modal.kind==='cancel'&&<><p>Vas a cancelar el turno de <strong>{modal.appointment.contactName}</strong> del {api.dateText(api.localDate(new Date(modal.appointment.startsAt)))} a las {api.localTime(modal.appointment.startsAt)}.</p><p>El horario vuelve a quedar disponible. Para reprogramar, solicitá un nuevo turno después de cancelar.</p><FormError error={formError}/><div className="modal-footer"><button className="btn secondary" disabled={saving} onClick={()=>setModal(null)}>Conservar turno</button><button className="btn" disabled={saving} onClick={()=>void save(async()=>{await api.changeAppointment(modal.appointment.id,'cancelled')},'Turno cancelado')}>{saving?'Cancelando…':'Confirmar cancelación'}</button></div></>}
    </Dialog>}
    {toast&&<div className="toast" role="status"><Check size={18}/>{toast}</div>}
  </div>;
}

function apiEmptyPatients(){return emptyPage<api.Patient>()}
function ClinicalText({title,text}:{title:string;text?:string|null}){return <div className="express-clinical-text"><h4>{title}</h4><p>{text||'Sin registrar.'}</p></div>}
function Pagination({meta,onChange}:{meta:api.Page<unknown>['meta'];onChange:(page:number)=>void}){return meta.totalPages>1?<nav className="express-pagination" aria-label="Páginas del listado"><button type="button" className="btn secondary" disabled={meta.page<=1} onClick={()=>onChange(meta.page-1)}><ChevronLeft size={16}/>Anterior</button><span>Página {meta.page} de {meta.totalPages}</span><button type="button" className="btn secondary" disabled={meta.page>=meta.totalPages} onClick={()=>onChange(meta.page+1)}>Siguiente<ChevronRight size={16}/></button></nav>:null}
function Dialog({title,busy,onClose,children}:{title:string;busy:boolean;onClose:()=>void;children:ReactNode}){
  const ref=useRef<HTMLDialogElement>(null),id=useId();
  useEffect(()=>{const dialog=ref.current;dialog?.showModal();return()=>dialog?.close()},[]);
  return <dialog ref={ref} className="modal express-dialog" aria-labelledby={id} aria-busy={busy} onCancel={event=>{event.preventDefault();if(!busy)onClose()}}><div className="section-head"><div><small className="eyebrow">NUTRIBALANCE</small><h2 id={id}>{title}</h2></div><button className="iconbtn" disabled={busy} aria-label="Cerrar formulario" onClick={onClose}><X/></button></div>{children}</dialog>;
}
function Field({label,name,value,error,...props}:{label:string;name:string;value?:string|number|null;error?:unknown}&Omit<React.InputHTMLAttributes<HTMLInputElement>,'value'|'name'>){
  const fieldError=error instanceof api.ExpressApiError?error.details.find(item=>item.field===name)?.message:undefined;
  return <label>{label}<input {...props} name={name} defaultValue={value??''} aria-invalid={!!fieldError} aria-describedby={fieldError?name+'-error':undefined}/>{fieldError&&<span className="field-error" id={name+'-error'}>{fieldError}</span>}</label>;
}
function TextField({label,name,value,error,...props}:{label:string;name:string;value?:string|null;error?:unknown}&Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>,'value'|'name'>){
  const fieldError=error instanceof api.ExpressApiError?error.details.find(item=>item.field===name)?.message:undefined;
  return <label>{label}<textarea {...props} name={name} defaultValue={value??''} aria-invalid={!!fieldError} aria-describedby={fieldError?name+'-error':undefined}/>{fieldError&&<span className="field-error" id={name+'-error'}>{fieldError}</span>}</label>;
}
function FormError({error}:{error:unknown}){const ref=useRef<HTMLDivElement>(null);useEffect(()=>{if(error)ref.current?.focus()},[error]);return error?<div ref={ref} tabIndex={-1} className="form-error" role="alert">{message(error)}{error instanceof api.ExpressApiError&&error.status===401&&<p><a href="/ingresar" target="_blank" rel="noopener noreferrer">Volver a ingresar en otra pestaña</a>. Tu formulario sigue abierto acá.</p>}</div>:null}
function FormActions({busy,label,onCancel}:{busy:boolean;label:string;onCancel:()=>void}){return <div className="modal-footer"><button className="btn secondary" disabled={busy} type="button" onClick={onCancel}>Cancelar</button><button className="btn" disabled={busy} type="submit"><Check size={17}/>{busy?'Guardando…':label}</button></div>}
function ConfirmAppointment({appointment,initialPatient,busy,error,onConfirm,onNewPatient,onCancel}:{appointment:api.Appointment;initialPatient?:api.Patient;busy:boolean;error:unknown;onConfirm:(id:string)=>void;onNewPatient:()=>void;onCancel:()=>void}){
  const [search,setSearch]=useState(''),[page,setPage]=useState(1),[result,setResult]=useState(()=>emptyPage<api.Patient>()),[selected,setSelected]=useState<api.Patient|null>(initialPatient??null),[loading,setLoading]=useState(false),[loadError,setLoadError]=useState('');
  useEffect(()=>{const controller=new AbortController();setLoading(true);setLoadError('');const timer=setTimeout(()=>{api.listPatients(search,page,controller.signal).then(value=>{if(!controller.signal.aborted)setResult(value)}).catch(e=>{if(!controller.signal.aborted)setLoadError(message(e))}).finally(()=>{if(!controller.signal.aborted)setLoading(false)})},250);return()=>{controller.abort();clearTimeout(timer)}},[search,page]);
  return <form onSubmit={event=>{event.preventDefault();if(selected)onConfirm(selected.id)}}><p>Solicitud de <strong>{appointment.contactName}</strong> · {appointment.contactPhone}</p><p>Elegí la ficha que corresponde a esta persona para confirmar el turno.</p><label>Buscar ficha<input value={search} disabled={busy} placeholder="Nombre, apellido o DNI" onChange={event=>{setSearch(event.target.value);setPage(1)}}/></label>{loading?<p role="status">Buscando pacientes…</p>:loadError?<p role="alert">{loadError}</p>:<><div className="express-patient-picker">{result.data.map(patient=><button type="button" key={patient.id} disabled={busy} className={selected?.id===patient.id?'express-choice selected':'express-choice'} aria-pressed={selected?.id===patient.id} onClick={()=>setSelected(patient)}><Avatar name={api.fullName(patient)}/><span><strong>{api.fullName(patient)}</strong><small>{patient.documentNumber||'Sin DNI'} · {patient.phone}</small></span>{selected?.id===patient.id&&<Check size={18}/>}</button>)}</div>{!result.data.length&&<p>No hay fichas para esta búsqueda.</p>}<Pagination meta={result.meta} onChange={setPage}/></>}{selected&&<p className="notice">Ficha elegida: <strong>{api.fullName(selected)}</strong></p>}<button type="button" className="textbutton" disabled={busy} onClick={onNewPatient}>Crear una ficha nueva <Plus size={16}/></button><FormError error={error}/><div className="modal-footer"><button className="btn secondary" disabled={busy} type="button" onClick={onCancel}>Volver</button><button className="btn" disabled={busy||!selected} type="submit">{busy?'Confirmando…':'Confirmar turno'}</button></div></form>;
}
