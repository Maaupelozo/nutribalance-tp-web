import type {Metadata} from 'next';
import './globals.css';
const origin='https://nutribalance-mauricio.fancy-chime-9205.chatgpt.site';
export const metadata:Metadata={metadataBase:new URL(origin),title:{default:'NutriBalance · Nutrición y seguimiento',template:'%s'},description:'Atención nutricional y gestión de turnos. Proyecto académico con datos ficticios.',robots:{index:true,follow:true},openGraph:{locale:'es_AR',type:'website',siteName:'NutriBalance'},icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es-AR"><body>{children}</body></html>}
