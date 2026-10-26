/** Opt-in live verification. Creates one fictional patient/consultation and cancels its test booking. */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync,readdirSync} from 'node:fs';
import path from 'node:path';

const origin='https://nutribalance-mauricio.maauri.chatgpt.site';
const input=await new Promise((resolve,reject)=>{
  let buffer='';const terminal=process.stdin.isTTY;
  function done(){process.stdin.removeListener('data',data);if(terminal)process.stdin.setRawMode(false);process.stdin.pause();try{resolve(JSON.parse(buffer.trim()))}catch{reject(new Error('Send credential JSON on stdin.'))}}
  function data(chunk){if(chunk.includes('\u0003')){reject(new Error('Cancelled'));return}buffer+=chunk;if(/[\r\n]/.test(buffer))done()}
  if(terminal){process.stdin.setRawMode(true);process.stderr.write('Ready for test credentials on stdin (input is hidden).\n')}
  process.stdin.setEncoding('utf8');process.stdin.on('data',data);process.stdin.once('end',done);process.stdin.resume();
});
let mf;
if(!process.argv.includes('--production')){
  const require=createRequire(realpathSync('node_modules/wrangler/package.json'));
  const {Miniflare}=require('miniflare');const root=path.resolve('dist/server');
  function modules(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?modules(path.join(dir,entry.name)):entry.name.endsWith('.js')?[{type:'ESModule',path:path.join(dir,entry.name)}]:[])}
  const all=modules(root);all.sort((a,b)=>a.path===path.join(root,'index.js')?-1:b.path===path.join(root,'index.js')?1:a.path.localeCompare(b.path));
  mf=new Miniflare({modules:all,modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'express-gateway-live-test'}});
}
const send=mf?(...args)=>mf.dispatchFetch(...args):(...args)=>fetch(...args);
function browser(){
  const jar=new Map();
  return async(endpoint,method='GET',body,csrf)=>{
    const res=await send(origin+'/api/v1'+endpoint,{method,headers:{Origin:origin,Cookie:[...jar].map(([key,value])=>key+'='+value).join('; '),...(body?{'Content-Type':'application/json'}:{}),...(csrf?{'X-CSRF-Token':csrf}:{})},body:body?JSON.stringify(body):undefined,redirect:'manual'});
    for(const value of res.headers.getSetCookie()){const pair=value.split(';')[0],index=pair.indexOf('=');jar.set(pair.slice(0,index),pair.slice(index+1))}
    const result=res.status===204?null:await res.json();return {status:res.status,body:result,headers:res.headers};
  };
}
const professional=browser(),visitor=browser();let csrf,bookingId,patientId,consultationId,cancelled=false;
try{
  assert.equal((await professional('/auth/me')).status,401,'anonymous session is private');
  const initial=await professional('/auth/csrf');assert.equal(initial.status,200);
  assert.match(initial.headers.get('set-cookie'),/Path=\/api\/v1/);assert.match(initial.headers.get('set-cookie'),/SameSite=Lax/);
  const login=await professional('/auth/login','POST',{email:input.email,password:input.password},initial.body.csrfToken);
  input.password='';assert.equal(login.status,200,'professional login');csrf=login.body.csrfToken;
  assert.equal(login.body.user.role,'professional');assert.equal((await professional('/auth/me')).status,200);
  if(process.argv.includes('--read-only')){
    assert.ok(input.patientId,'Supply an existing fictional patientId for read-only verification.');
    assert.equal((await professional('/patients/'+input.patientId)).status,200);
    const history=await professional('/patients/'+input.patientId+'/consultations');assert.equal(history.status,200);assert.ok(history.body.data.length);
    assert.equal((await professional('/auth/logout','POST',undefined,csrf)).status,204);
    assert.equal((await professional('/auth/me')).status,401);
    console.log(JSON.stringify({result:'PASS',target:'published site + live Express',checks:['anonymous 401','cookie scope','professional login','existing patient read','history reload','logout/session invalidation'],newRecordsCreated:0}));
  }else{
  const invalid=await professional('/patients','POST',{},csrf);assert.equal(invalid.status,400,'field validation');assert.ok(invalid.body.error.details.length);
  const suffix=new Date().toISOString().replace(/\D/g,'').slice(0,14);
  const created=await professional('/patients','POST',{firstName:'Paciente',lastName:'Prueba '+suffix,phone:'+5493624000000',email:'prueba-'+suffix+'@example.test',background:'Ficha ficticia de verificación de la integración.'},csrf);
  assert.equal(created.status,201,'create patient');patientId=created.body.id;
  assert.equal(typeof patientId,'string');assert.equal((await professional('/patients/'+patientId,'PATCH',{background:'Ficha ficticia. Verificación de edición completada.'},csrf)).status,200);
  const date=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Argentina/Buenos_Aires',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const day=new Date(date+'T12:00:00Z');day.setUTCDate(day.getUTCDate()+1);while([0,6].includes(day.getUTCDay()))day.setUTCDate(day.getUTCDate()+1);
  const bookingDate=day.toISOString().slice(0,10);
  const visitorCsrf=(await visitor('/auth/csrf')).body.csrfToken;
  const availability=await visitor('/availability?date='+bookingDate);assert.equal(availability.status,200);assert.ok(availability.body.slots.length,'available test slot');
  const selected=availability.body.slots.at(-1);
  const request={contactName:created.body.firstName+' '+created.body.lastName,contactPhone:created.body.phone,contactEmail:created.body.email,startsAt:selected.startsAt};
  assert.equal((await visitor('/appointment-requests','POST',request,'invalid-csrf')).status,403,'invalid CSRF rejected');
  const receipt=await visitor('/appointment-requests','POST',request,visitorCsrf);assert.equal(receipt.status,201,'public request');bookingId=receipt.body.id;
  const duplicate=await visitor('/appointment-requests','POST',request,visitorCsrf);assert.equal(duplicate.status,409);assert.equal(duplicate.body.error.code,'SLOT_UNAVAILABLE');
  assert.equal((await visitor('/patients')).status,401,'anonymous clinical data rejected');
  const confirmed=await professional('/appointments/'+bookingId,'PATCH',{status:'confirmed',patientId},csrf);assert.equal(confirmed.status,200);assert.equal(confirmed.body.patientId,patientId);
  assert.equal((await professional('/appointments/'+bookingId)).body.status,'confirmed','confirmed booking reload');
  const consult=await professional('/patients/'+patientId+'/consultations','POST',{date,reason:'Verificación ficticia de integración',observations:'Datos ficticios. Prueba del guardado y la recarga del historial.',objective:'Comprobar continuidad del registro.',instructions:'Registro académico de prueba.',weightKg:70,heightCm:170,waistCm:80},csrf);
  assert.equal(consult.status,201,'save consultation');consultationId=consult.body.id;
  const reloaded=await professional('/patients/'+patientId+'/consultations');assert.equal(reloaded.status,200);assert.ok(reloaded.body.data.some(row=>row.id===consultationId),'history persists on reload');
  assert.equal((await professional('/patients/'+patientId)).body.background,'Ficha ficticia. Verificación de edición completada.');
  assert.equal((await professional('/appointments/'+bookingId,'PATCH',{status:'cancelled'},csrf)).status,200);cancelled=true;
  const freed=await visitor('/availability?date='+bookingDate);assert.ok(freed.body.slots.some(slot=>slot.startsAt===selected.startsAt),'cancelling restores slot');
  assert.equal((await professional('/auth/logout','POST',undefined,csrf)).status,204);assert.equal((await professional('/auth/me')).status,401,'logout invalidates session');
  console.log(JSON.stringify({result:'PASS',target:mf?'built Worker + live Express':'published site + live Express',checks:['anonymous 401','CSRF 403','login','patient creation/edit/reload','public booking','slot conflict 409','patient link/confirmation','consultation/history reload','cancellation/releases slot','logout 204/session 401'],patientId,consultationId,bookingId,testBookingCancelled:cancelled,linkedConsultation:'not executed: future booking has not started'}));
  }
}finally{
  if(bookingId&&!cancelled&&csrf){try{const cleanup=await professional('/appointments/'+bookingId,'PATCH',{status:'cancelled'},csrf);console.log(JSON.stringify({testBookingCleanup:cleanup.status}))}catch{console.log('Test booking could not be cancelled.')}}
  if(csrf){try{await professional('/auth/logout','POST',undefined,csrf)}catch{}}
  if(mf)await mf.dispose();
}
