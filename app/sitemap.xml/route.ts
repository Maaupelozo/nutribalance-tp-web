import {SITE_ORIGIN} from '@/lib/site-config';
export function GET(){const origin=SITE_ORIGIN;return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+['/','/solicitar-turno'].map(path=>'<url><loc>'+origin+path+'</loc></url>').join('')+'</urlset>',{headers:{'Content-Type':'application/xml'}})}
