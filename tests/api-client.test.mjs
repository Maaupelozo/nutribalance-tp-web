import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';

const source=await readFile(new URL('../lib/api-client.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const api=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const empty={patients:[],appointments:[],visits:[],blocks:[]};

test('conserva el estado 401 y no reintenta una creación automáticamente',async t=>{
  let calls=0;
  t.mock.method(globalThis,'fetch',async()=>{calls++;return Response.json({error:'Iniciá sesión para acceder al panel.'},{status:401})});
  const after={...empty,patients:[{id:1,name:'Paciente Ficticio'}]};
  await assert.rejects(api.saveCoreChange(empty,after,3),e=>e instanceof api.ApiError&&e.status===401);
  assert.equal(calls,1);
  assert.equal(after.patients[0].name,'Paciente Ficticio');
});

test('un error HTML de sesión conserva 401 para permitir recuperación',async t=>{
  t.mock.method(globalThis,'fetch',async()=>new Response('<html>Acceso requerido</html>',{status:401}));
  await assert.rejects(api.loadCore(),e=>e.status===401&&e.message.includes('sesión'));
});

test('un conflicto conserva su mensaje y un fallo de JSON no se presenta como éxito',async t=>{
  t.mock.method(globalThis,'fetch',async()=>Response.json({error:'La agenda cambió en otra sesión.'},{status:409}));
  await assert.rejects(api.loadCore(),e=>e.status===409&&e.message.includes('agenda cambió'));
  globalThis.fetch.mock.mockImplementation(async()=>new Response('Servidor no disponible',{status:502}));
  await assert.rejects(api.loadCore(),e=>e.status===502&&e.message.includes('no se confirmaron'));
});
