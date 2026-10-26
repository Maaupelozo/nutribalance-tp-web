/** Execute the built production Worker against an isolated D1 database. */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {realpathSync,readFileSync,readdirSync} from 'node:fs';
import path from 'node:path';
const require=createRequire(realpathSync('node_modules/wrangler/package.json'));
const {Miniflare}=require('miniflare');
const root=path.resolve('dist/server');
function modules(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?modules(path.join(dir,e.name)):e.name.endsWith('.js')?[{type:'ESModule',path:path.join(dir,e.name)}]:[])}
const all=modules(root);all.sort((a,b)=>a.path===path.join(root,'index.js')?-1:b.path===path.join(root,'index.js')?1:a.path.localeCompare(b.path));
const mf=new Miniflare({modules:all,modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'nutri-isolated-tests'},bindings:{PROFESSIONAL_EMAILS:'qa@nutribalance.test'}});
try{
const db=await mf.getD1Database('DB');
for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort()){for(const statement of readFileSync('drizzle/'+file,'utf8').split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean)){await db.prepare(statement).run()}}
const auth={'oai-authenticated-user-id':'local-qa-professional','oai-authenticated-user-email':'qa@nutribalance.test'};
async function call(endpoint,method='GET',body,headers={}){const res=await mf.dispatchFetch('https://nutribalance.test'+endpoint,{method,headers:{...headers,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,redirect:'manual'});const raw=await res.text();let json;try{json=JSON.parse(raw)}catch{json={text:raw.slice(0,350)}}return {status:res.status,body:json,headers:res.headers,html:raw}}
assert.equal((await call('/api/panel')).status,401,'anonymous cannot read clinical data');
assert.equal((await call('/api/panel','GET',undefined,{'oai-authenticated-user-id':'stranger','oai-authenticated-user-email':'stranger@example.com'})).status,403,'unauthorized identity denied');
const stateResponse=await call('/api/panel','GET',undefined,auth);assert.equal(stateResponse.status,200,JSON.stringify(stateResponse.body));
const future=new Date();future.setDate(future.getDate()+7);
const request={name:'Paciente Integración',email:'test@example.com',phone:'0000000000',date:future.toISOString().slice(0,10),time:'15:00',notes:'Prueba ficticia automatizada',fictional:true,requestKey:crypto.randomUUID()};
const receipt=await call('/api/solicitudes','POST',request);assert.equal(receipt.status,201,JSON.stringify(receipt.body));assert.equal(receipt.body.status,'pendiente');assert.equal(receipt.body.date,request.date);assert.equal(receipt.body.time,request.time);
const retry=await call('/api/solicitudes','POST',{...request,time:'16:30'});assert.equal(retry.status,201);assert.equal(retry.body.code,receipt.body.code,'idempotency avoids duplicate requests');assert.equal(retry.body.time,'15:00','retry returns the saved preference, even when the edited form differs');assert.equal(retry.body.date,request.date);
let state=(await call('/api/panel','GET',undefined,auth)).body;const appointment=state.appointments.find(a=>a.requestCode===receipt.body.code);assert.ok(appointment);const patient=state.patients.find(p=>p.id===appointment.patient);assert.equal(patient.email,'test@example.com');assert.equal(state.patients.length,1);
let saved=await call('/api/panel','POST',{revision:state.revision,commands:[{entity:'appointments',action:'update',value:{...appointment,confirmed:true}}]},auth);assert.equal(saved.status,200,JSON.stringify(saved.body));state=saved.body;
const stale=await call('/api/panel','POST',{revision:state.revision-1,commands:[{entity:'patients',action:'update',value:{...patient,name:'No debe guardarse'}}]},auth);assert.equal(stale.status,409,'stale revision rejected');assert.equal(stale.headers.get('cache-control'),'no-store');
const consultation={id:Date.now()*1000,patient:patient.id,appointmentId:appointment.id,date:appointment.date,reason:'Control académico',notes:'Observación ficticia de prueba',goal:'Objetivo ficticio',indications:'Indicaciones ficticias',weight:70,height:170,fat:20,muscle:40,waist:80,hip:90,draft:false};
saved=await call('/api/panel','POST',{revision:state.revision,commands:[{entity:'visits',action:'create',value:consultation}]},auth);assert.equal(saved.status,200,JSON.stringify(saved.body));
const beforeInvalid= saved.body;const invalid={...consultation,id:consultation.id+1,indications:''};assert.equal((await call('/api/panel','POST',{revision:beforeInvalid.revision,commands:[{entity:'visits',action:'create',value:invalid}]},auth)).status,422);const reloaded=(await call('/api/panel','GET',undefined,auth)).body;assert.equal(reloaded.revision,beforeInvalid.revision,'invalid consultation does not change revision');assert.equal(reloaded.visits.length,1,'invalid consultation does not persist');assert.ok(reloaded.visits.some(v=>v.id===consultation.id&&v.indications===consultation.indications));assert.equal(reloaded.appointments.find(a=>a.id===appointment.id).status,'Atendido');assert.equal(reloaded.patients[0].name,patient.name);
const home=await call('/');assert.equal(home.status,200);assert.equal((home.html.match(/<h1[ >]/g)||[]).length,1);assert.match(home.html,/<meta[^>]+name="description"/);assert.match(home.html,/<link[^>]+rel="canonical"/);assert.match(home.html,/Mauricio Pelozo/);assert.match(home.html,/Una alimentación/);assert.match(home.html,/id="el-enfoque"/);assert.match(home.html,/id="mauricio"/);const requestPage=await call('/solicitar-turno');assert.equal(requestPage.status,200);assert.match(requestPage.html,/<fieldset/);assert.match(requestPage.html,/Horario disponible/);assert.match(requestPage.html,/datos ficticios/);const sitemap=await call('/sitemap.xml');assert.match(sitemap.html,/solicitar-turno/);assert.ok(!sitemap.html.includes('/panel'));assert.match((await call('/robots.txt')).html,/Disallow: \/panel/);
console.log('PASS Worker + D1: anonymous 401, unauthorized 403, request, idempotency, confirmation, stale-write 409, consultation + attended, reload.');
}finally{await mf.dispose()}
