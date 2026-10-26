import {professionalUser,apiError,requestBody} from '@/lib/server/auth';
import {readCore,saveCommands} from '@/lib/server/repository';
export const dynamic='force-dynamic';
export async function GET(){try{await professionalUser();return Response.json(await readCore(),{headers:{'Cache-Control':'no-store'}})}catch(e){return apiError(e)}}
export async function POST(req:Request){try{const user=await professionalUser();return Response.json(await saveCommands(await requestBody(req),user.userId),{headers:{'Cache-Control':'no-store'}})}catch(e){return apiError(e)}}
