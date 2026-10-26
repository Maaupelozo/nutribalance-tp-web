import type {Metadata} from 'next';
import ExpressDashboard from './ExpressDashboard';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Panel profesional | NutriBalance',robots:{index:false,follow:false}};
export default function PanelPage(){return <ExpressDashboard/>}
