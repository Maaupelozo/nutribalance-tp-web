export const money=(n:number)=>new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(n);
export const dateLabel=(s:string)=>new Date(s+'T12:00:00').toLocaleDateString('es-AR',{day:'numeric',month:'short'});
export const initials=(s:string)=>s.split(' ').slice(0,2).map(x=>x[0]).join('');
export const minutes=(s:string)=>Number(s.split(':')[0])*60+Number(s.split(':')[1]);
