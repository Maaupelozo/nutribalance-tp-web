import type {Metadata} from 'next';
import {LockKeyhole,ArrowUpRight} from 'lucide-react';
import {chatGPTSignInPath,getChatGPTUser} from '@/app/chatgpt-auth';
import {professionalUser} from '@/lib/server/auth';
import {redirect} from 'next/navigation';
import PublicHeader from '@/components/public/Header';
import PublicFooter from '@/components/public/Footer';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Acceso profesional | NutriBalance',robots:{index:false,follow:false}};
export default async function Login(){
  const user=await getChatGPTUser();let allowed=false;
  if(user){try{await professionalUser();allowed=true}catch{}}
  if(allowed)redirect('/panel');
  return <div className="public-page"><PublicHeader/>
    <main id="contenido" className="login-main">
      <section className="login-card"><LockKeyhole size={27}/><h1>Tu consultorio,<br/>en un solo <em>lugar.</em></h1><p>Ingresá con tu cuenta autorizada para gestionar pacientes, turnos e historias de consulta.</p>
        {user&&<div className="form-error" role="alert">Esta cuenta no tiene acceso al consultorio. Ingresá con una cuenta autorizada.</div>}
        <a className="btn" href={chatGPTSignInPath('/panel')} target="_top">Ingresar al consultorio <ArrowUpRight size={18}/></a>
        <a href="/solicitar-turno" className="textbutton">¿Querés solicitar un turno?</a>
      </section>
      <aside className="login-aside"><h2>Más tiempo<br/>para <em>acompañar.</em></h2><p>Mauricio Pelozo<br/>NutriBalance</p></aside>
    </main><PublicFooter/>
  </div>;
}
