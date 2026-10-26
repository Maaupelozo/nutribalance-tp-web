import type {Metadata} from 'next';
import './globals.css';
import {SITE_ORIGIN} from '@/lib/site-config';
export const metadata:Metadata={metadataBase:new URL(SITE_ORIGIN),title:{default:'NutriBalance · Nutrición y seguimiento',template:'%s'},description:'Atención nutricional con Mauricio Pelozo. Solicitá tu turno y organizá tu seguimiento.',robots:{index:true,follow:true},openGraph:{locale:'es_AR',type:'website',siteName:'NutriBalance'},icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es-AR"><head><link rel="preload" href="/fonts/manrope-normal-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/><link rel="preload" href="/fonts/source-serif-4-normal-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/></head><body>{children}</body></html>}
