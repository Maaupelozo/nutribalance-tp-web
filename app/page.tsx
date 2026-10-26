import type {Metadata} from 'next';
import {ArrowRight,ArrowUpRight,Check} from 'lucide-react';
import PublicHeader from '@/components/public/Header';
import PublicFooter from '@/components/public/Footer';

export const metadata:Metadata={
  title:'Mauricio Pelozo · NutriBalance | Atención nutricional',
  description:'Conocé a Mauricio Pelozo y la propuesta de NutriBalance. Solicitá un turno para conversar sobre tus hábitos y organizar tu seguimiento.',
  alternates:{canonical:'/'},
  openGraph:{title:'Mauricio Pelozo · NutriBalance',description:'Una alimentación que encuentre lugar en tu vida.',url:'/'},
};
const encounters=[
  {title:'Un primer encuentro',description:'Conversamos sobre tus hábitos, tu rutina y lo que te gustaría trabajar. Ese es el punto de partida.'},
  {title:'Objetivos con contexto',description:'Registramos los objetivos y las indicaciones del encuentro para tener claro cómo continuar.'},
  {title:'Un seguimiento ordenado',description:'Retomamos lo conversado y revisamos los registros de cada consulta. Tu historia permanece en un mismo lugar.'},
];
export default function Home(){return <div className="public-page editorial-home">
  <PublicHeader/>
  <main id="contenido" className="public-main">
    <section className="editorial-hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <h1 id="hero-title">Una alimentación que encuentre lugar <em>en tu vida.</em></h1>
        <p>Un primer encuentro para conversar sobre tus hábitos, definir objetivos y construir los próximos pasos.</p>
        <div className="hero-actions"><a className="btn" href="/solicitar-turno">Solicitar un turno <ArrowUpRight size={19}/></a><a className="textbutton" href="#el-enfoque">Conocer el enfoque <ArrowRight size={17}/></a></div>
        <div className="hero-reassurance"><Check size={16}/><span>Elegís un horario disponible. Mauricio confirma el turno.</span></div>
      </div>
      <aside className="signature-panel" aria-label="Mauricio Pelozo, nutrición">
        <div className="signature-top"><span>NutriBalance</span><span>Nutrición</span></div>
        <p className="signature-thought">A tu<br/><em>ritmo.</em></p>
        <div className="signature-bottom"><span>Mauricio<br/>Pelozo</span><p>Un espacio para conversar.<br/>Un proceso para acompañar.</p></div>
      </aside>
    </section>
    <section id="el-enfoque" className="approach-section" aria-labelledby="approach-title">
      <div className="approach-title"><h2 id="approach-title">El punto de partida<br/>sos <em>vos.</em></h2></div>
      <div className="approach-copy"><p className="lead">Los hábitos tienen una historia. La consulta es un espacio para conocerla.</p><p>Qué comés, cómo son tus días y qué esperás del encuentro forman parte de la conversación. A partir de ahí, organizamos los objetivos y el seguimiento.</p><a className="textbutton" href="#mauricio">Conocé a Mauricio <ArrowRight size={17}/></a></div>
    </section>
    <section id="mauricio" className="professional-section" aria-labelledby="professional-title">
      <div className="professional-name"><span className="professional-initial" aria-hidden="true">mp.</span><h2 id="professional-title">Mauricio<br/>Pelozo</h2><p>NutriBalance · Nutrición</p></div>
      <div className="professional-copy"><h3>Una persona detrás<br/>de cada encuentro.</h3><p>La propuesta de NutriBalance reúne la consulta, los objetivos y el historial de seguimiento para darle continuidad a lo conversado.</p><p>En tu primer encuentro, el espacio es para vos: tus hábitos, tus preguntas y lo que te gustaría trabajar.</p><a className="textbutton" href="/solicitar-turno">Empezar la conversación <ArrowUpRight size={18}/></a></div>
    </section>
    <section id="la-consulta" className="encounters-section" aria-labelledby="encounters-title">
      <div className="section-introduction"><h2 id="encounters-title">Cada encuentro,<br/><em>un próximo paso.</em></h2><p>De la primera conversación al seguimiento, con un registro que ayuda a continuar.</p></div>
      <div className="encounter-list">{encounters.map(item=><article key={item.title}><h3>{item.title}</h3><p>{item.description}</p><ArrowUpRight size={21} aria-hidden="true"/></article>)}</div>
    </section>
    <section className="booking-section" aria-labelledby="booking-title">
      <div><h2 id="booking-title">Nos encontramos<br/><em>por acá.</em></h2><p>Solicitar un turno lleva tres pasos. El horario queda pendiente hasta su confirmación.</p><a className="btn" href="/solicitar-turno">Elegir una fecha <ArrowUpRight size={19}/></a></div>
      <ol className="booking-steps"><li><span>01</span><div><h3>Contanos cómo contactarte</h3><p>Completá tus datos y elegí un horario disponible.</p></div></li><li><span>02</span><div><h3>Esperá la confirmación</h3><p>Mauricio revisa la solicitud y confirma o coordina otro horario.</p></div></li><li><span>03</span><div><h3>Empezá tu seguimiento</h3><p>En consulta se registran los objetivos y las indicaciones.</p></div></li></ol>
    </section>
    <section className="public-faq" aria-labelledby="faq-title">
      <div><h2 id="faq-title">Antes de<br/><em>encontrarnos.</em></h2><p>Lo que necesitás saber para solicitar tu turno.</p></div>
      <div><details><summary>¿La solicitud confirma mi turno?</summary><p>No. El formulario registra una solicitud pendiente. Mauricio revisa la fecha y el horario antes de confirmar.</p></details><details><summary>¿Necesito una cuenta para solicitar?</summary><p>No. Podés completar el formulario sin iniciar sesión. El panel profesional tiene acceso restringido.</p></details><details><summary>¿Cómo se organiza el seguimiento?</summary><p>Los objetivos y las indicaciones se retoman en cada encuentro para darle continuidad al seguimiento.</p></details><details><summary>¿Puedo cargar mis datos reales?</summary><p>Usá únicamente nombres, contactos y datos ficticios en este sitio.</p></details></div>
    </section>
    <section className="closing-section"><h2>Tu próximo paso<br/>puede empezar <em>acá.</em></h2><a className="btn" href="/solicitar-turno">Solicitar un turno <ArrowUpRight size={19}/></a></section>
  </main>
  <PublicFooter/>
</div>}
