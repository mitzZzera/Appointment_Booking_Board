import { and, desc, eq } from 'drizzle-orm';
import { getDb } from '../../../db';
import { appointments } from '../../../db/schema';
import { getChatGPTUser } from '../../chatgpt-auth';

type NewAppointment = { customerName?:string; customerEmail?:string; customerPhone?:string; service?:string; staffName?:string; appointmentDate?:string; startTime?:string; durationMins?:number; notes?:string; price?:number };

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error:'Sign in required' }, { status:401 });
  try { const rows = await getDb().select().from(appointments).where(eq(appointments.ownerId,user.userId)).orderBy(desc(appointments.appointmentDate),desc(appointments.startTime)).limit(100); return Response.json({ appointments:rows }); }
  catch { return Response.json({ appointments:[] }); }
}

export async function POST(request:Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error:'Sign in required' }, { status:401 });
  try {
    const data=(await request.json()) as NewAppointment;
    const customerName=data.customerName?.trim()??'',service=data.service?.trim()??'',staffName=data.staffName?.trim()??'',appointmentDate=data.appointmentDate??'',startTime=data.startTime??'',durationMins=Number(data.durationMins);
    if(!customerName||!service||!staffName||!/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)||!/^\d{2}:\d{2}$/.test(startTime)||!Number.isInteger(durationMins)||durationMins<15||durationMins>240)return Response.json({error:'Please complete all required booking details.'},{status:400});
    const sameDay=await getDb().select().from(appointments).where(and(eq(appointments.ownerId,user.userId),eq(appointments.appointmentDate,appointmentDate),eq(appointments.staffName,staffName))).limit(50);
    const start=toMinutes(startTime),end=start+durationMins;const conflict=sameDay.some(a=>a.status!=='cancelled'&&start<toMinutes(a.startTime)+a.durationMins&&end>toMinutes(a.startTime));
    if(conflict)return Response.json({error:`${staffName} already has a booking during that time.`},{status:409});
    const [saved]=await getDb().insert(appointments).values({ownerId:user.userId,customerName,customerEmail:data.customerEmail?.trim()??'',customerPhone:data.customerPhone?.trim()??'',service,staffName,appointmentDate,startTime,durationMins,notes:data.notes?.trim()??'',price:Math.max(0,Number(data.price)||0)}).returning();
    return Response.json({appointment:saved},{status:201});
  } catch { return Response.json({error:'The booking could not be saved.'},{status:500}); }
}

export async function PATCH(request:Request) {
  const user=await getChatGPTUser();if(!user)return Response.json({error:'Sign in required'},{status:401});
  try{const data=(await request.json()) as {id?:number;status?:string};if(!data.id||!['confirmed','completed','cancelled','no-show'].includes(data.status??''))return Response.json({error:'Invalid status update.'},{status:400});const [updated]=await getDb().update(appointments).set({status:data.status}).where(and(eq(appointments.id,data.id),eq(appointments.ownerId,user.userId))).returning();if(!updated)return Response.json({error:'Booking not found.'},{status:404});return Response.json({appointment:updated});}catch{return Response.json({error:'The booking could not be updated.'},{status:500});}
}

function toMinutes(value:string){const [hours,minutes]=value.split(':').map(Number);return hours*60+minutes;}
