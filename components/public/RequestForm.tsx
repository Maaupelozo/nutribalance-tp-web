'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {ArrowUpRight,CheckCircle2} from 'lucide-react';
import {availability,requestAppointment,ExpressApiError,localDate,localTime,dateText,addDays,type Slot,type RequestReceipt} from '@/lib/express-api';

export default function RequestForm(){
  const today=localDate(),[chosenDate,setChosenDate]=useState(''),[chosenSlot,setChosenSlot]=useState('');
  const [slots,setSlots]=useState<Slot[]>([]),[loading,setLoading]=useState(false),[slotError,setSlotError]=useState(''),[refresh,setRefresh]=useState(0);
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[receipt,setReceipt]=useState<RequestReceipt|null>(null);
  const [fieldErrors,setFieldErrors]=useState<Record<string,string>>({}),[waitUntil,setWaitUntil]=useState(0);
  const submitting=useRef(false),successRef=useRef<HTMLElement>(null),errorRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    setChosenSlot('');setSlots([]);setSlotError('');
    if(!chosenDate){setLoading(false);return}
    const controller=new AbortController();setLoading(true);
    availability(chosenDate,controller.signal).then(result=>{if(!controller.signal.aborted)setSlots(result.slots)}).catch(e=>{if(!controller.signal.aborted)setSlotError(e.message)}).finally(()=>{if(!controller.signal.aborted)setLoading(false)});
    return()=>controller.abort();
  },[chosenDate,refresh]);
  useEffect(()=>{if(receipt)successRef.current?.focus();else if(error)errorRef.current?.focus()},[receipt,error]);
  const fieldError=(name:string)=>fieldErrors[name]?<span className="field-error" id={name+'-error'}>{fieldErrors[name]}</span>:null;
  const errorProps=(name:string)=>({'aria-invalid':!!fieldErrors[name],'aria-describedby':fieldErrors[name]?name+'-error':undefined});
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(submitting.current)return;
    if(Date.now()<waitUntil){setError('Esperá un momento antes de volver a enviar.');return}
    const fields=new FormData(event.currentTarget);
    if(fields.get('website'))return;
    if(!slots.some(slot=>slot.startsAt===chosenSlot)){setError('Elegí un horario disponible.');return}
    submitting.current=true;setBusy(true);setError('');setFieldErrors({});
    try{
      const result=await requestAppointment({contactName:String(fields.get('contactName')).trim(),contactPhone:String(fields.get('contactPhone')).trim(),contactEmail:String(fields.get('contactEmail')||'').trim()||null,startsAt:chosenSlot});
      setReceipt(result);
      window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    }catch(e){
      setError(e instanceof Error?e.message:'No pudimos confirmar el envío.');
      if(e instanceof ExpressApiError){setFieldErrors(Object.fromEntries(e.details.map(item=>[item.field,item.message])));if(e.code==='SLOT_UNAVAILABLE')setRefresh(value=>value+1);if(e.retryAfter)setWaitUntil(Date.now()+e.retryAfter*1000)}
    }finally{submitting.current=false;setBusy(false)}
  }
  if(receipt)return <section ref={successRef} tabIndex={-1} className="request-success" aria-live="polite">
    <span className="success-symbol"><CheckCircle2 size={31}/></span><h2>Tu solicitud<br/>ya está registrada.</h2>
    <p>Guardá este comprobante. Mauricio debe revisar y confirmar el turno antes del encuentro.</p>
    <dl><div><dt>Código de solicitud</dt><dd className="receipt-code">{receipt.id}</dd></div><div><dt>Fecha solicitada</dt><dd>{dateText(localDate(new Date(receipt.startsAt)))}</dd></div><div><dt>Horario solicitado</dt><dd>{localTime(receipt.startsAt)} · Argentina</dd></div><div><dt>Estado</dt><dd><span className="badge amber">Pendiente de confirmación</span></dd></div></dl>
    <a className="btn" href="/">Volver al inicio <ArrowUpRight size={17}/></a>
  </section>;
  return <form onSubmit={submit} className="request-form" aria-busy={busy}
    onInvalid={event=>{const field=event.target as HTMLInputElement;setFieldErrors(previous=>({...previous,[field.name]:field.validity.valueMissing?(field.type==='checkbox'?'Confirmá el uso de datos ficticios.':'Completá este campo.'):'Revisá el valor ingresado.'}))}}
    onInput={event=>{const field=event.target as HTMLInputElement;setFieldErrors(previous=>{const next={...previous};delete next[field.name];return next})}}>
    <fieldset disabled={busy}><legend>Datos para contactarte</legend><p className="field-section-note">Los campos con * son obligatorios.</p>
      <label>Nombre y apellido *<input name="contactName" autoComplete="off" maxLength={160} required placeholder="Ana Ejemplo" {...errorProps('contactName')}/>{fieldError('contactName')}</label>
      <div className="form-grid"><label>Teléfono *<input name="contactPhone" type="tel" autoComplete="off" minLength={6} maxLength={30} required placeholder="000 000 0000" {...errorProps('contactPhone')}/>{fieldError('contactPhone')}</label><label>Correo electrónico <span className="optional-label">Opcional</span><input name="contactEmail" type="email" autoComplete="off" maxLength={254} placeholder="ana@example.test" {...errorProps('contactEmail')}/>{fieldError('contactEmail')}</label></div>
    </fieldset>
    <fieldset disabled={busy}><legend>Elegí tu próximo encuentro</legend><p className="field-section-note">Consultas de 30 minutos. Todos los horarios son de Argentina.</p>
      <div className="form-grid"><label>Fecha *<input type="date" name="date" value={chosenDate} onChange={event=>setChosenDate(event.target.value)} min={today} max={addDays(today,60)} required {...errorProps('date')}/>{fieldError('date')}</label>
        <label>Horario disponible *<select name="startsAt" value={chosenSlot} onChange={event=>setChosenSlot(event.target.value)} disabled={!chosenDate||loading||!slots.length} required {...errorProps('startsAt')}><option value="">{loading?'Buscando horarios…':'Elegí un horario'}</option>{slots.map(slot=><option key={slot.startsAt} value={slot.startsAt}>{localTime(slot.startsAt)}</option>)}</select>{fieldError('startsAt')}</label></div>
      {chosenDate&&!loading&&!slotError&&!slots.length&&<p role="status">No hay horarios disponibles para esa fecha. Probá con otro día.</p>}
      {slotError&&<div className="form-error" role="alert">{slotError} <button className="textbutton" type="button" onClick={()=>setRefresh(value=>value+1)}>Volver a buscar</button></div>}
    </fieldset>
    <label className="honeypot" aria-hidden="true">Sitio web<input name="website" tabIndex={-1} autoComplete="off"/></label>
    {chosenDate&&chosenSlot&&<div className="request-summary" aria-live="polite"><strong>{dateText(chosenDate)} · {localTime(chosenSlot)}</strong><p>Tu solicitud queda pendiente de confirmación.</p></div>}
    <label className="checkbox request-consent"><input disabled={busy} name="fictional" type="checkbox" required {...errorProps('fictional')}/><span>Confirmo que los datos ingresados son ficticios. *{fieldError('fictional')}</span></label>
    {error&&<div ref={errorRef} tabIndex={-1} className="form-error" role="alert">{error}</div>}
    <button className="btn request-submit" type="submit" disabled={busy||loading||!chosenSlot}>{busy?'Registrando solicitud…':'Enviar solicitud'}<ArrowUpRight size={18}/></button>
  </form>;
}
