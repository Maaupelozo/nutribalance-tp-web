import type {Metadata} from 'next';
import Dashboard from '@/app/panel/Dashboard';
export const metadata:Metadata={title:'Portal de paciente · Demostración | NutriBalance',robots:{index:false,follow:false}};
export default function PatientDemo(){return <Dashboard initialRole="patient"/>}
