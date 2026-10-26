import type {Metadata} from 'next';
import {chatGPTSignOutPath} from '@/app/chatgpt-auth';
import {redirect} from 'next/navigation';
import {professionalUser} from '@/lib/server/auth';
import Dashboard from './Dashboard';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Panel profesional | NutriBalance',robots:{index:false,follow:false}};
export default async function PanelPage(){try{await professionalUser()}catch{redirect('/ingresar')}return <Dashboard persisted signOutUrl={chatGPTSignOutPath('/')} />}
