'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {ArrowUpRight} from 'lucide-react';
import {ExpressApiError,getSession,login} from '@/lib/express-api';

export default function LoginForm(){
  const [busy,setBusy]=useState(false),[checking,setChecking]=useState(true),[error,setError]=useState('');
  const [waitUntil,setWaitUntil]=useState(0);
  const submitting=useRef(false),errorRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{let active=true;getSession().then(()=>{if(active)window.location.replace('/panel')}).catch(e=>{if(active){if(!(e instanceof ExpressApiError&&e.status===401))setError(e.message);setChecking(false)}});return()=>{active=false}},[]);
  useEffect(()=>{if(error)errorRef.current?.focus()},[error]);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(submitting.current)return;
    if(Date.now()<waitUntil){setError('Esperá un momento antes de volver a ingresar.');return}
    submitting.current=true;setBusy(true);setError('');
    const form=event.currentTarget,fields=new FormData(form);
    try{await login(String(fields.get('email')).trim(),String(fields.get('password')));form.reset();window.location.replace('/panel')}
    catch(e){setError(e instanceof Error?e.message:'No pudimos iniciar sesión.');if(e instanceof ExpressApiError&&e.retryAfter)setWaitUntil(Date.now()+e.retryAfter*1000);submitting.current=false;setBusy(false)}
  }
  if(checking)return <p role="status">Revisando tu acceso…</p>;
  return <form onSubmit={submit} className="professional-login" aria-busy={busy}>
    <label>Correo electrónico<input name="email" type="email" autoComplete="username" maxLength={254} required/></label>
    <label>Contraseña<input name="password" type="password" autoComplete="current-password" maxLength={256} required/></label>
    {error&&<div ref={errorRef} tabIndex={-1} className="form-error" role="alert">{error}</div>}
    <button className="btn" disabled={busy} type="submit">{busy?'Ingresando…':'Ingresar al consultorio'}<ArrowUpRight size={18}/></button>
  </form>;
}
