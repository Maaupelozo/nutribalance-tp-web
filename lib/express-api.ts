/** NutriTurnos v1 contract: docs/api-externa/openapi.json. */
export type Session = {
  user: {id:string; email:string; displayName:string; role:'professional'};
  csrfToken:string;
  expiresAt:string;
};
export type Patient = {
  id:string; firstName:string; lastName:string; phone:string;
  documentNumber:string|null; birthDate:string|null; email:string|null;
  background:string|null; allergies:string|null; medication:string|null;
  createdAt:string; updatedAt:string;
};
export type PatientInput = Omit<Patient,'id'|'createdAt'|'updatedAt'>;
export type AppointmentStatus = 'pending'|'confirmed'|'attended'|'cancelled';
export type Appointment = {
  id:string; patientId:string|null; contactName:string; contactPhone:string;
  contactEmail:string|null; startsAt:string; endsAt:string;
  status:AppointmentStatus; createdAt:string; updatedAt:string;
};
export type ConsultationInput = {
  date:string; reason:string; instructions:string; objective:string|null;
  observations:string|null; weightKg:number|null; heightCm:number|null;
  waistCm:number|null; appointmentId?:string|null;
};
export type Consultation = ConsultationInput & {
  id:string; patientId:string; createdAt:string; updatedAt:string;
};
export type Page<T> = {data:T[];meta:{page:number;pageSize:number;total:number;totalPages:number}};
export type Slot = {startsAt:string;endsAt:string};
export type Availability = {date:string;timeZone:string;slots:Slot[]};
export type RequestInput = {contactName:string;contactPhone:string;contactEmail:string|null;startsAt:string};
export type RequestReceipt = {id:string;startsAt:string;endsAt:string;status:'pending'};

export class ExpressApiError extends Error {
  constructor(message:string,public status:number,public code:string,public details:{field:string;message:string}[]=[],public retryAfter:number|null=null){super(message);this.name='ExpressApiError'}
}

let csrfToken:string|null=null;
let csrfRequest:Promise<void>|null=null;
let retryAfterUntil=0;
const BASE='/api/v1';

async function read<T>(response:Response):Promise<T>{
  if(response.status===204)return undefined as T;
  let body:T & {error?:{code?:string;message?:string;details?:{field:string;message:string}[]}};
  try{body=await response.json() as typeof body}catch{throw new ExpressApiError('No pudimos confirmar la respuesta. Revisá los datos antes de volver a enviar.',response.status,'INVALID_RESPONSE')}
  if(!response.ok){
    const code=body?.error?.code||'REQUEST_FAILED';
    if(response.status===429)retryAfterUntil=Date.now()+(Number(response.headers.get('Retry-After'))||10)*1000;
    if(code==='CSRF_INVALID'||response.status===401)csrfToken=null;
    const messages:Record<string,string>={
      UNAUTHENTICATED:'Tu sesión venció. Volvé a ingresar para continuar.',
      INVALID_CREDENTIALS:'El correo o la contraseña no son correctos.',
      CSRF_INVALID:'Actualizamos tu acceso. Revisá el formulario y volvé a enviarlo.',
      SLOT_UNAVAILABLE:'Ese horario acaba de ocuparse. Elegí otro de los disponibles.',
      RATE_LIMITED:'Hubo varios intentos seguidos. Esperá un momento para continuar.',
    };
    throw new ExpressApiError(messages[code]||body?.error?.message||'No pudimos completar la acción.',response.status,code,Array.isArray(body?.error?.details)?body.error.details:[],Number(response.headers.get('Retry-After'))||null);
  }
  return body as T;
}

async function get<T>(path:string,signal?:AbortSignal){
  try{return await read<T>(await fetch(BASE+path,{credentials:'include',cache:'no-store',signal}))}
  catch(e){if(e instanceof ExpressApiError||(e instanceof Error&&e.name==='AbortError'))throw e;throw new ExpressApiError('No pudimos cargar la información. Volvé a intentar.',0,'NETWORK_ERROR')}
}

async function ensureCsrf(){
  if(csrfToken)return;
  if(!csrfRequest)csrfRequest=get<{csrfToken:string}>('/auth/csrf').then(body=>{csrfToken=body.csrfToken}).finally(()=>{csrfRequest=null});
  await csrfRequest;
}

async function mutate<T>(path:string,method:'POST'|'PATCH',body?:unknown):Promise<T>{
  if(Date.now()<retryAfterUntil)throw new ExpressApiError('Esperá un momento antes de volver a guardar.',429,'RATE_LIMITED',[],Math.ceil((retryAfterUntil-Date.now())/1000));
  await ensureCsrf();
  try{
    return await read<T>(await fetch(BASE+path,{method,credentials:'include',cache:'no-store',headers:{'Content-Type':'application/json','X-CSRF-Token':csrfToken!},body:body===undefined?undefined:JSON.stringify(body)}));
  }catch(e){
    if(e instanceof ExpressApiError){
      // Refresh access, but never repeat a reservation or clinical creation automatically.
      if(e.code==='CSRF_INVALID'){try{await ensureCsrf()}catch{}}
      throw e;
    }
    throw new ExpressApiError('No pudimos confirmar el envío. Actualizá la información antes de volver a guardar para evitar duplicados.',0,'NETWORK_ERROR');
  }
}

const query=(values:Record<string,string|number|undefined>)=>new URLSearchParams(Object.entries(values).filter(([,v])=>v!==undefined&&v!=='').map(([k,v])=>[k,String(v)])).toString();
const id=(value:string)=>encodeURIComponent(value);
export async function getSession(){const session=await get<Session>('/auth/me');csrfToken=session.csrfToken;return session}
export async function login(email:string,password:string){const session=await mutate<Session>('/auth/login','POST',{email,password});csrfToken=session.csrfToken;return session}
export async function logout(){await mutate<void>('/auth/logout','POST');csrfToken=null}
export const availability=(date:string,signal?:AbortSignal)=>get<Availability>('/availability?'+query({date}),signal);
export const requestAppointment=(input:RequestInput)=>mutate<RequestReceipt>('/appointment-requests','POST',input);
export const listPatients=(q='',page=1,signal?:AbortSignal)=>get<Page<Patient>>('/patients?'+query({q,page,pageSize:20}),signal);
export const getPatient=(patientId:string)=>get<Patient>('/patients/'+id(patientId));
export const createPatient=(input:PatientInput)=>mutate<Patient>('/patients','POST',input);
export const editPatient=(patientId:string,input:PatientInput)=>mutate<Patient>('/patients/'+id(patientId),'PATCH',input);
export const listAppointments=(from:string,to:string,page=1,status='',signal?:AbortSignal)=>get<Page<Appointment>>('/appointments?'+query({from,to,page,pageSize:20,status}),signal);
export const changeAppointment=(appointmentId:string,status:AppointmentStatus,patientId?:string)=>mutate<Appointment>('/appointments/'+id(appointmentId),'PATCH',{status,...(patientId?{patientId}:{})});
export const listConsultations=(patientId:string,page=1)=>get<Page<Consultation>>('/patients/'+id(patientId)+'/consultations?'+query({page,pageSize:20}));
export const createConsultation=(patientId:string,input:ConsultationInput)=>mutate<Consultation>('/patients/'+id(patientId)+'/consultations','POST',input);

export const fullName=(patient:Patient)=>patient.firstName+' '+patient.lastName;
export const localDate=(instant=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Argentina/Buenos_Aires',year:'numeric',month:'2-digit',day:'2-digit'}).format(instant);
export const localTime=(instant:string)=>new Intl.DateTimeFormat('es-AR',{timeZone:'America/Argentina/Buenos_Aires',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(instant));
export const dateText=(date:string)=>new Intl.DateTimeFormat('es-AR',{day:'numeric',month:'long',year:'numeric'}).format(new Date(date+'T12:00:00'));
export function addDays(date:string,days:number){if(!date)return '';const value=new Date(date+'T12:00:00Z');value.setUTCDate(value.getUTCDate()+days);return value.toISOString().slice(0,10)}
