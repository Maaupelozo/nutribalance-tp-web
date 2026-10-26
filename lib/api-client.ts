import type {CoreSnapshot,CoreData} from './types';

export class ApiError extends Error {
  constructor(message:string,public status:number){super(message);this.name='ApiError'}
}

async function result(response:Response):Promise<CoreSnapshot>{
  let body;
  try{body=await response.json() as CoreSnapshot & {error?:string}}catch{
    const message=response.status===401?'Tu sesión venció. Volvé a ingresar para continuar.':'Los cambios no se confirmaron. Intentá nuevamente.';
    throw new ApiError(message,response.status);
  }
  if(!response.ok){
    throw new ApiError(typeof body?.error==='string'?body.error:'No pudimos guardar los cambios.',response.status);
  }
  return body;
}
export async function loadCore(){return result(await fetch('/api/panel',{cache:'no-store'}))}
export async function saveCoreChange(before:CoreData,after:CoreData,revision:number){const commands:unknown[]=[];for(const entity of ['patients','appointments','visits','blocks'] as const){for(const row of after[entity]){const old=before[entity].find(x=>x.id===row.id);if(!old)commands.push({entity,action:'create',value:row});else if(JSON.stringify(old)!==JSON.stringify(row))commands.push({entity,action:'update',value:row})}for(const old of before[entity]){if(!after[entity].some(x=>x.id===old.id))commands.push({entity,action:'delete',id:old.id})}}if(!commands.length)return null;return result(await fetch('/api/panel',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision,commands})}))}
