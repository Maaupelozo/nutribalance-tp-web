import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {InputError} from '@/lib/validation';
export async function professionalUser(){const user=await getChatGPTUser();if(!user)throw new InputError('Iniciá sesión para acceder al panel.',401);const allowed=(env.PROFESSIONAL_EMAILS||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);if(!allowed.includes(user.email.toLowerCase()))throw new InputError('Tu cuenta no está autorizada como profesional.',403);return user}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)throw new InputError('Origen de solicitud no permitido.',403)}
export async function requestBody(req:Request){sameOrigin(req);if(!req.headers.get('content-type')?.includes('application/json'))throw new InputError('Usá formato JSON.',415);const raw=await req.text();if(raw.length>100000)throw new InputError('La solicitud es demasiado grande.',413);try{return JSON.parse(raw)}catch{throw new InputError('JSON inválido.')}}
function errorResponse(message:string,status:number){return Response.json({error:message},{status,headers:{'Cache-Control':'no-store'}})}
export function apiError(error:unknown){
  if(error instanceof InputError)return errorResponse(error.message,error.status);
  const message=String(error);
  if(message.includes('revision_nonnegative'))return errorResponse('La agenda cambió en otra sesión. Actualizá los datos y volvé a guardar.',409);
  if(message.includes('schedule_overlap'))return errorResponse('El horario se superpone con un turno confirmado o un bloqueo.',409);
  if(message.includes('patients_dni_unique')||message.includes('patients.dni'))return errorResponse('Ya existe un paciente con ese DNI.',409);
  if(message.includes('FOREIGN KEY'))return errorResponse('El paciente o turno asociado ya no está disponible. Actualizá los datos.',409);
  console.error('NutriBalance API:',message);
  return errorResponse('No pudimos completar la operación. Intentá nuevamente.',500);
}
