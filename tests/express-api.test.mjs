import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';

async function moduleAt(path){
  const source=await readFile(new URL(path,import.meta.url),'utf8');
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
  return import('data:text/javascript;base64,'+Buffer.from(code).toString('base64')+'#'+crypto.randomUUID());
}
const session={user:{id:'11111111-1111-4111-8111-111111111111',email:'professional@example.test',role:'professional'},csrfToken:'rotated-token',expiresAt:'2026-10-27T00:00:00Z'};

test('login uses the anonymous CSRF, then rotated CSRF; logout handles 204 and clears it',async t=>{
  const api=await moduleAt('../lib/express-api.ts'),calls=[];
  t.mock.method(globalThis,'fetch',async(path,options)=>{
    calls.push({path,...options});
    if(path.endsWith('/auth/csrf'))return Response.json({csrfToken:'anonymous-token'});
    if(path.endsWith('/auth/login'))return Response.json(session);
    if(path.endsWith('/auth/logout'))return new Response(null,{status:204});
    return Response.json({id:'patient-id'},{status:201});
  });
  await api.login('professional@example.test','test-password-only');
  await api.createPatient({firstName:'Ana',lastName:'Ejemplo',phone:'0000000000'});
  assert.equal(calls[1].headers['X-CSRF-Token'],'anonymous-token');
  assert.equal(calls[2].headers['X-CSRF-Token'],'rotated-token');
  assert.ok(calls.every(call=>call.credentials==='include'&&call.cache==='no-store'));
  await api.logout();
  await api.requestAppointment({contactName:'Ana Ejemplo',contactPhone:'0000000000',contactEmail:null,startsAt:'2026-10-27T12:00:00Z'});
  assert.equal(calls.filter(call=>call.path.endsWith('/auth/csrf')).length,2);
});

test('a CSRF failure refreshes the token without repeating a creation',async t=>{
  const api=await moduleAt('../lib/express-api.ts');let writes=0,tokens=0;
  t.mock.method(globalThis,'fetch',async path=>{
    if(path.endsWith('/auth/csrf')){tokens++;return Response.json({csrfToken:'token-'+tokens})}
    writes++;return Response.json({error:{code:'CSRF_INVALID',message:'csrf',details:[]}},{status:403});
  });
  await assert.rejects(api.requestAppointment({}),e=>e.code==='CSRF_INVALID');
  assert.equal(writes,1);assert.equal(tokens,2);
});

test('slot conflicts, field errors and rate limits retain structured recovery information',async t=>{
  const api=await moduleAt('../lib/express-api.ts');
  t.mock.method(globalThis,'fetch',async()=>Response.json({error:{code:'SLOT_UNAVAILABLE',message:'occupied',details:[{field:'startsAt',message:'Elegí otro horario.'}]}},{status:409,headers:{'Retry-After':'15'}}));
  await assert.rejects(api.availability('2026-10-27'),e=>e.status===409&&e.code==='SLOT_UNAVAILABLE'&&e.details[0].field==='startsAt'&&e.retryAfter===15);
  assert.equal(api.localTime('2026-10-27T12:00:00.000Z'),'09:00');
  assert.equal(api.addDays('2026-12-31',1),'2027-01-01');
});

test('a rate limit prevents another write until Retry-After has elapsed',async t=>{
  const api=await moduleAt('../lib/express-api.ts');let writes=0;
  t.mock.method(globalThis,'fetch',async path=>{
    if(path.endsWith('/auth/csrf'))return Response.json({csrfToken:'test-token'});
    writes++;return Response.json({error:{code:'RATE_LIMITED',details:[]}},{status:429,headers:{'Retry-After':'60'}});
  });
  await assert.rejects(api.createPatient({}),e=>e.status===429);
  await assert.rejects(api.createPatient({}),e=>e.status===429&&e.retryAfter>0);
  assert.equal(writes,1);
});

test('the gateway rejects foreign origins, unknown paths and unsupported methods before forwarding',async t=>{
  const {forwardExpress}=await moduleAt('../lib/server/express-gateway.ts');let calls=0;
  t.mock.method(globalThis,'fetch',async()=>{calls++;throw new Error('must not fetch')});
  assert.equal((await forwardExpress(new Request('https://nutri.test/api/v1/auth/login',{method:'POST',headers:{Origin:'https://other.test'}}))).status,403);
  assert.equal((await forwardExpress(new Request('https://nutri.test/api/v1/admin'))).status,404);
  assert.equal((await forwardExpress(new Request('https://nutri.test/api/v1/patients',{method:'DELETE'}))).status,405);
  assert.equal(calls,0);
});

test('the gateway forwards only backend session and CSRF, scopes cookies and never follows redirects',async t=>{
  const {forwardExpress}=await moduleAt('../lib/server/express-gateway.ts');let received;
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    received={url,...options};
    return Response.json(session,{headers:{'Set-Cookie':'nutri.sid=backend-session; Domain=api.neadev.com; Path=/; HttpOnly; Secure; SameSite=None'}});
  });
  const response=await forwardExpress(new Request('https://nutri.test/api/v1/auth/login',{method:'POST',headers:{Origin:'https://nutri.test',Cookie:'platform-secret=private; nutri.sid=backend-session; other=value','X-CSRF-Token':'test-csrf','Content-Type':'application/json','oai-authenticated-user-email':'private@example.test'},body:'{}'}));
  assert.equal(received.url,'https://api.neadev.com/api/v1/auth/login');
  assert.equal(received.headers.get('Cookie'),'nutri.sid=backend-session');
  assert.equal(received.headers.get('oai-authenticated-user-email'),null);
  assert.equal(received.headers.get('X-CSRF-Token'),'test-csrf');
  assert.equal(received.redirect,'manual');
  const cookie=response.headers.get('set-cookie');
  assert.match(cookie,/HttpOnly/);assert.match(cookie,/Secure/);assert.match(cookie,/SameSite=Lax/);assert.match(cookie,/Path=\/api\/v1/);assert.doesNotMatch(cookie,/Domain=/);
  assert.equal(response.headers.get('Cache-Control'),'no-store');
});

test('the gateway preserves 204 logout and turns unavailable upstream responses into recoverable errors',async t=>{
  const {forwardExpress}=await moduleAt('../lib/server/express-gateway.ts');
  t.mock.method(globalThis,'fetch',async()=>new Response(null,{status:204,headers:{'Set-Cookie':'nutri.sid=; Path=/; Max-Age=0; HttpOnly; Secure'}}));
  const out=await forwardExpress(new Request('https://nutri.test/api/v1/auth/logout',{method:'POST',headers:{Origin:'https://nutri.test'}}));
  assert.equal(out.status,204);assert.equal(await out.text(),'');assert.match(out.headers.get('set-cookie'),/Max-Age=0/);
  globalThis.fetch.mock.mockImplementation(async()=>new Response('cloudflare error',{status:530}));
  const unavailable=await forwardExpress(new Request('https://nutri.test/api/v1/auth/csrf'));
  assert.equal(unavailable.status,502);assert.equal((await unavailable.json()).error.code,'UPSTREAM_UNAVAILABLE');
});
