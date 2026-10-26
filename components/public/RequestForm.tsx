'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {ArrowUpRight,CheckCircle2,ShieldCheck} from 'lucide-react';

type Receipt={code:string;date:string;time:string};
export default function RequestForm(){
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[receipt,setReceipt]=useState<Receipt|null>(null);
  const [chosenDate,setChosenDate]=useState(''),[chosenTime,setChosenTime]=useState('');
  const [fieldErrors,setFieldErrors]=useState<Record<string,string>>({});
  const requestKey=useRef(''),submitting=useRef(false);
  const successRef=useRef<HTMLElement>(null),errorRef=useRef<HTMLDivElement>(null);
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Argentina/Buenos_Aires',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const dateLabel=(value:string)=>new Intl.DateTimeFormat('es-AR',{day:'numeric',month:'long',year:'numeric'}).format(new Date(value+'T12:00:00'));
  useEffect(()=>{if(receipt)successRef.current?.focus();else if(error)errorRef.current?.focus()},[receipt,error]);
  const fieldError=(name:string)=>fieldErrors[name]?<span className="field-error" id={name+'-error'}>{fieldErrors[name]}</span>:null;
  const errorProps=(name:string)=>({'aria-invalid':!!fieldErrors[name],'aria-describedby':fieldErrors[name]?name+'-error':undefined});

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(submitting.current)return;
    submitting.current=true;setBusy(true);setError('');
    const fields=new FormData(event.currentTarget);
    if(!requestKey.current)requestKey.current=Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
    const payload={name:fields.get('name'),email:fields.get('email'),phone:fields.get('phone'),date:fields.get('date'),time:fields.get('time'),notes:fields.get('notes'),website:fields.get('website'),fictional:fields.get('fictional')==='on',requestKey:requestKey.current};
    try{
      const response=await fetch('/api/solicitudes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      let body;
      try{body=await response.json() as {error?:string;code?:string;date?:string;time?:string}}catch{throw new Error('El servidor no respondió correctamente. Tus datos siguen en el formulario; podés reintentar.')}
      if(!response.ok)throw new Error(body?.error||'No se pudo registrar la solicitud. Tus datos siguen en el formulario.');
      if(!body||typeof body.code!=='string'||typeof body.date!=='string'||typeof body.time!=='string')throw new Error('No pudimos verificar el comprobante. Reintentá el envío para recuperar tu solicitud.');
      setReceipt({code:body.code,date:body.date,time:body.time});
      window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    }catch(reason){setError(reason instanceof Error?reason.message:'No pudimos conectar. Tus datos siguen en el formulario.')}
    finally{submitting.current=false;setBusy(false)}
  }

  if(receipt)return <section ref={successRef} tabIndex={-1} className="request-success" aria-live="polite">
    <span className="success-symbol"><CheckCircle2 size={31}/></span>
    <h2>Tu solicitud<br/>ya está registrada.</h2>
    <p>Guardá este comprobante. Mauricio debe revisar y confirmar el horario antes del encuentro.</p>
    <dl><div><dt>Código de solicitud</dt><dd>{receipt.code}</dd></div><div><dt>Fecha preferida</dt><dd>{dateLabel(receipt.date)}</dd></div><div><dt>Horario preferido</dt><dd>{receipt.time} · Argentina</dd></div><div><dt>Estado</dt><dd><span className="badge amber">Pendiente de confirmación</span></dd></div></dl>
    <a className="btn" href="/">Volver al inicio <ArrowUpRight size={17}/></a>
    <p className="login-note">Demostración académica. No se envió un correo ni un WhatsApp automático.</p>
  </section>;

  return <form onSubmit={submit} className="request-form" aria-busy={busy}
    onInvalid={event=>{const field=event.target as HTMLInputElement;const message=field.validity.valueMissing?(field.type==='checkbox'?'Confirmá el uso de datos ficticios.':'Completá este campo.'):field.type==='email'?'Ingresá un correo válido.':field.name==='date'?'Elegí una fecha dentro del período indicado.':'Revisá el valor ingresado.';setFieldErrors(previous=>({...previous,[field.name]:message}))}}
    onInput={event=>{const field=event.target as HTMLInputElement;setFieldErrors(previous=>{if(!previous[field.name])return previous;const next={...previous};delete next[field.name];return next})}}>
    <fieldset><legend>Datos para contactarte</legend><p className="field-section-note">Los campos con * son obligatorios. Usá datos ficticios.</p>
      <label>Nombre y apellido *<input autoComplete="off" name="name" maxLength={100} required placeholder="Ana Ejemplo" {...errorProps('name')}/>{fieldError('name')}</label>
      <div className="form-grid"><label>Correo electrónico *<input autoComplete="off" name="email" type="email" maxLength={160} required placeholder="ana@example.test" {...errorProps('email')}/>{fieldError('email')}</label><label>Teléfono *<input autoComplete="off" name="phone" type="tel" maxLength={40} required placeholder="000 000 0000" {...errorProps('phone')}/>{fieldError('phone')}</label></div>
    </fieldset>
    <fieldset><legend>Tu preferencia de turno</legend><p className="field-section-note">El horario definitivo se coordina después de la solicitud.</p>
      <div className="form-grid"><label>Fecha preferida *<input type="date" name="date" value={chosenDate} onChange={event=>setChosenDate(event.target.value)} min={today} max={`${Number(today.slice(0,4))+1}-12-31`} required {...errorProps('date')}/>{fieldError('date')}</label><label>Horario preferido *<select name="time" value={chosenTime} onChange={event=>setChosenTime(event.target.value)} required {...errorProps('time')}><option value="" disabled>Elegí un horario</option>{Array.from({length:21},(_,i)=>{const time=`${String(8+Math.floor(i/2)).padStart(2,'0')}:${i%2?'30':'00'}`;return <option key={time}>{time}</option>})}</select>{fieldError('time')}</label></div>
      <label>Comentarios <span className="optional-label">Opcional</span><textarea name="notes" maxLength={1000} placeholder="Preferencias para coordinar. No incluyas información clínica."/></label>
    </fieldset>
    <label className="honeypot" aria-hidden="true">Sitio web<input name="website" tabIndex={-1} autoComplete="off"/></label>
    {chosenDate&&chosenTime&&<div className="request-summary" aria-live="polite"><strong>{dateLabel(chosenDate)} · {chosenTime}</strong><p>Hora de Argentina. Es una preferencia; queda pendiente de confirmación.</p></div>}
    <label className="checkbox request-consent"><input type="checkbox" name="fictional" required {...errorProps('fictional')}/><span>Confirmo que uso datos ficticios para esta demostración académica. *{fieldError('fictional')}</span></label>
    {error&&<div ref={errorRef} tabIndex={-1} id="request-error" className="form-error" role="alert">{error}</div>}
    <button className="btn request-submit" type="submit" disabled={busy}>{busy?'Registrando solicitud…':'Enviar solicitud'}<ArrowUpRight size={18}/></button>
    <p className="login-note"><ShieldCheck size={16}/>El envío guarda tu solicitud. No confirma una reserva.</p>
  </form>;
}
