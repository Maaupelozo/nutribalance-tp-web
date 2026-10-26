import {initials} from '@/lib/format';
export default function Avatar({name,size=''}:{name:string;size?:string}){return <span className={'avatar '+size}>{initials(name)}</span>}
