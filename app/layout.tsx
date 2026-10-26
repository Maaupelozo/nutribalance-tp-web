import type {Metadata} from 'next';
import './globals.css';
import {SITE_ORIGIN} from '@/lib/site-config';
export const metadata:Metadata={metadataBase:new URL(SITE_ORIGIN),title:{default:'NutriBalance · Nutrición y seguimiento',template:'%s'},description:'Atención nutricional y gestión de turnos. Proyecto académico con datos ficticios.',robots:{index:true,follow:true},openGraph:{locale:'es_AR',type:'website',siteName:'NutriBalance'},icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es-AR"><body>{children}</body></html>}
