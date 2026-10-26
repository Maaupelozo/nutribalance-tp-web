import type {Metadata} from 'next';
import Dashboard from '@/app/panel/Dashboard';
export const metadata:Metadata={title:'Demo visual profesional | NutriBalance',robots:{index:false,follow:false}};
export default function ProfessionalDemo(){return <Dashboard/>}
