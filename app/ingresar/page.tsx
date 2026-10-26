import type {Metadata} from 'next';
import {LockKeyhole} from 'lucide-react';
import LoginForm from '@/components/public/LoginForm';
import PublicHeader from '@/components/public/Header';
import PublicFooter from '@/components/public/Footer';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Acceso profesional | NutriBalance',robots:{index:false,follow:false}};
export default function Login(){
  return <div className="public-page"><PublicHeader/>
    <main id="contenido" className="login-main">
      <section className="login-card"><LockKeyhole size={27}/><h1>Tu consultorio,<br/>en un solo <em>lugar.</em></h1><p>Ingresá con tu cuenta autorizada para gestionar pacientes, turnos e historias de consulta.</p>
        <LoginForm/>
        <a href="/solicitar-turno" className="textbutton">¿Querés solicitar un turno?</a>
      </section>
      <aside className="login-aside"><h2>Más tiempo<br/>para <em>acompañar.</em></h2><p>Mauricio Pelozo<br/>NutriBalance</p></aside>
    </main><PublicFooter/>
  </div>;
}
