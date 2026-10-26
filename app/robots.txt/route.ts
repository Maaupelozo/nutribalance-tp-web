import {SITE_ORIGIN} from '@/lib/site-config';
export function GET(){return new Response('User-agent: *\nAllow: /\nDisallow: /panel\nDisallow: /api/\nDisallow: /ingresar\nDisallow: /demo-paciente\nDisallow: /demo-profesional\nSitemap: '+SITE_ORIGIN+'/sitemap.xml\n',{headers:{'Content-Type':'text/plain'}})}
