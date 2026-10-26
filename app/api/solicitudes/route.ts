import {apiError,requestBody} from '@/lib/server/auth';
import {createPublicRequest} from '@/lib/server/repository';
export const dynamic='force-dynamic';
export async function POST(req:Request){try{return Response.json(await createPublicRequest(await requestBody(req)),{status:201,headers:{'Cache-Control':'no-store'}})}catch(e){return apiError(e)}}
