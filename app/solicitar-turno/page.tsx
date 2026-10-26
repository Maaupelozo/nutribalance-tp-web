import type {Metadata} from 'next';
import {ArrowLeft,Check} from 'lucide-react';
import PublicHeader from '@/components/public/Header';
import PublicFooter from '@/components/public/Footer';
import RequestForm from '@/components/public/RequestForm';
export const metadata:Metadata={title:'Solicitar turno · Mauricio Pelozo | NutriBalance',description:'Elegí una fecha y hora preferidas para tu consulta con Mauricio Pelozo. El horario queda pendiente de confirmación. Demostración académica.',alternates:{canonical:'/solicitar-turno'}};
export default function RequestPage(){return <div className="public-page"><PublicHeader/><main className="request-main" id="contenido"><div className="request-intro"><a href="/" className="back-link"><ArrowLeft size={16}/> Volver al inicio</a><h1>El primer paso<br/>es <em>conversar.</em></h1><p>Dejanos tus datos y una preferencia de horario. Mauricio revisa la solicitud para coordinar el encuentro.</p><div className="request-expectations"><h2>Qué pasa después</h2><ul><li><Check size={17}/>Recibís un código de solicitud.</li><li><Check size={17}/>El turno queda pendiente de confirmación.</li><li><Check size={17}/>La fecha elegida es una preferencia.</li></ul></div><p className="academic-reminder">Proyecto académico. Completá el formulario únicamente con datos ficticios.</p></div><RequestForm/></main><PublicFooter/></div>}
