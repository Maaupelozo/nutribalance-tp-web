const UPSTREAM='https://api.neadev.com';
const PREFIX='/api/v1';
const UUID='[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';
const routes:[RegExp,string[]][]=[
  [/^\/auth\/(csrf|me)$/,['GET']],
  [/^\/auth\/(login|logout)$/,['POST']],
  [/^\/availability$/,['GET']],
  [/^\/appointment-requests$/,['POST']],
  [/^\/patients$/,['GET','POST']],
  [new RegExp('^/patients/'+UUID+'$'),['GET','PATCH']],
  [new RegExp('^/patients/'+UUID+'/consultations$'),['GET','POST']],
  [/^\/appointments$/,['GET']],
  [new RegExp('^/appointments/'+UUID+'$'),['GET','PATCH']],
];
const error=(status:number,code:string,message:string)=>Response.json({error:{code,message,details:[]}},{status,headers:{'Cache-Control':'no-store'}});

/** Fixed backend gateway. Only NutriTurnos routes and its own session cookie cross this boundary. */
export async function forwardExpress(request:Request){
  const url=new URL(request.url);
  const path=url.pathname.slice(PREFIX.length);
  const allowed=routes.find(([pattern])=>pattern.test(path));
  if(!allowed)return error(404,'NOT_FOUND','No se encontró el recurso.');
  if(!allowed[1].includes(request.method))return error(405,'METHOD_NOT_ALLOWED','Esta acción no está disponible.');
  if(request.method!=='GET'&&request.headers.get('Origin')!==url.origin)return error(403,'ORIGIN_INVALID','Volvé a abrir el formulario desde NutriBalance.');
  // Browser origin is checked above; Express separately allowlists this server hop.
  const upstreamOrigin=process.env.EXPRESS_ALLOWED_ORIGIN
    ? new URL(process.env.EXPRESS_ALLOWED_ORIGIN).origin
    : url.origin;
  const headers=new Headers({Accept:'application/json',Origin:upstreamOrigin});
  const cookie=request.headers.get('Cookie')?.split(';').map(value=>value.trim()).find(value=>value.startsWith('nutri.sid='));
  if(cookie)headers.set('Cookie',cookie);
  const csrf=request.headers.get('X-CSRF-Token');
  if(csrf)headers.set('X-CSRF-Token',csrf);
  let body:string|undefined;
  if(request.method!=='GET'){
    if(Number(request.headers.get('Content-Length'))>65536)return error(413,'PAYLOAD_TOO_LARGE','El formulario supera el tamaño permitido.');
    body=await request.text();
    if(new TextEncoder().encode(body).length>65536)return error(413,'PAYLOAD_TOO_LARGE','El formulario supera el tamaño permitido.');
    if(body){if(!request.headers.get('Content-Type')?.includes('application/json'))return error(415,'INVALID_CONTENT_TYPE','El formulario no tiene un formato válido.');headers.set('Content-Type','application/json')}
  }
  try{
    const upstream=await fetch(UPSTREAM+PREFIX+path+url.search,{method:request.method,headers,body,redirect:'manual',signal:AbortSignal.timeout(15000)});
    if(upstream.status>=300&&upstream.status<400)return error(502,'UPSTREAM_UNAVAILABLE','No pudimos completar la acción. Volvé a intentar.');
    if(upstream.status!==204&&!upstream.headers.get('Content-Type')?.includes('application/json'))return error(502,'UPSTREAM_UNAVAILABLE','No pudimos completar la acción. Volvé a intentar.');
    const output=new Headers({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    if(upstream.status!==204)output.set('Content-Type','application/json; charset=utf-8');
    const retry=upstream.headers.get('Retry-After');if(retry)output.set('Retry-After',retry);
    for(const value of upstream.headers.getSetCookie()){
      if(!value.startsWith('nutri.sid='))continue;
      // Scope the backend session to this site's API; never relay platform cookies upstream.
      output.append('Set-Cookie',value.replace(/;\s*Domain=[^;]*/gi,'').replace(/;\s*Path=[^;]*/gi,'').replace(/;\s*SameSite=[^;]*/gi,'')+'; Path=/api/v1; SameSite=Lax');
    }
    return new Response(upstream.status===204?null:upstream.body,{status:upstream.status,headers:output});
  }catch{return error(502,'UPSTREAM_UNAVAILABLE','No pudimos completar la acción. Volvé a intentar.')}
}
