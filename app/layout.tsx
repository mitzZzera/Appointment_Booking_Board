import type { Metadata } from 'next';
import { DM_Sans, Manrope } from 'next/font/google';
import './globals.css';
import './booking.css';
const body=DM_Sans({variable:'--font-body',subsets:['latin']});const display=Manrope({variable:'--font-display',subsets:['latin']});
export const metadata:Metadata={title:'Arbor — Appointment Booking Board',description:'A calm scheduling workspace for small service businesses.',openGraph:{title:'Arbor — Appointment Booking Board',description:'Clear schedules. Calm workdays.',images:['/og.png']},twitter:{card:'summary_large_image',title:'Arbor — Appointment Booking Board',description:'Clear schedules. Calm workdays.',images:['/og.png']}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body className={`${body.variable} ${display.variable}`}>{children}</body></html>}
