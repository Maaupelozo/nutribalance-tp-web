import {ArrowUpRight} from 'lucide-react';
import Wordmark from './Wordmark';
export default function PublicHeader(){return <><a className="skip-link" href="#contenido">Saltar al contenido principal</a><header className="public-header"><Wordmark/><nav aria-label="Navegación principal"><a href="/#el-enfoque">El enfoque</a><a href="/#la-consulta">La consulta</a><a href="/ingresar" className="professional-access">Mi consultorio</a><a className="btn" href="/solicitar-turno">Solicitar turno <ArrowUpRight size={16}/></a></nav></header></>}
