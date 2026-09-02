"use client";

import { useMemo, useState, type FormEvent } from "react";
import { addDays, addWeeks, format, isSameDay, parseISO, startOfWeek } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, LayoutDashboard, Plus, Search, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import "./views.css";

type View = "overview" | "calendar" | "customers" | "services" | "settings";
type Appointment = { id:number; customerName:string; customerEmail:string; customerPhone:string; service:string; staffName:string; appointmentDate:string; startTime:string; durationMins:number; status:string; notes:string; price:number };

const seed: Appointment[] = [
  {id:1,customerName:"Maya Chen",customerEmail:"maya@example.com",customerPhone:"+359 88 410 2281",service:"Consultation",staffName:"Dimitar",appointmentDate:"2026-09-01",startTime:"09:30",durationMins:60,status:"confirmed",notes:"First consultation",price:75},
  {id:2,customerName:"Daniel Reed",customerEmail:"daniel@example.com",customerPhone:"+359 88 512 4430",service:"Follow-up",staffName:"Dimitar",appointmentDate:"2026-09-02",startTime:"10:30",durationMins:45,status:"confirmed",notes:"Review progress",price:45},
  {id:3,customerName:"Sofia Patel",customerEmail:"sofia@example.com",customerPhone:"+359 88 622 8190",service:"Strategy session",staffName:"Elena",appointmentDate:"2026-09-04",startTime:"10:00",durationMins:90,status:"confirmed",notes:"Quarterly planning",price:120},
  {id:4,customerName:"Lucas Martin",customerEmail:"lucas@example.com",customerPhone:"+359 88 701 9921",service:"Quick check-in",staffName:"Dimitar",appointmentDate:"2026-09-01",startTime:"12:00",durationMins:30,status:"completed",notes:"",price:30},
  {id:5,customerName:"Amelia Stone",customerEmail:"amelia@example.com",customerPhone:"+359 88 392 0074",service:"Consultation",staffName:"Elena",appointmentDate:"2026-09-03",startTime:"13:00",durationMins:60,status:"confirmed",notes:"",price:75},
  {id:6,customerName:"Noah Wilson",customerEmail:"noah@example.com",customerPhone:"+359 88 833 2501",service:"Follow-up",staffName:"Dimitar",appointmentDate:"2026-09-05",startTime:"12:30",durationMins:45,status:"confirmed",notes:"",price:45},
  {id:7,customerName:"Eva Brooks",customerEmail:"eva@example.com",customerPhone:"+359 88 412 8070",service:"Consultation",staffName:"Elena",appointmentDate:"2026-09-09",startTime:"11:00",durationMins:60,status:"confirmed",notes:"Product planning",price:75},
  {id:8,customerName:"Nikolai Ivanov",customerEmail:"nikolai@example.com",customerPhone:"+359 88 945 6112",service:"Strategy session",staffName:"Dimitar",appointmentDate:"2026-09-11",startTime:"14:00",durationMins:90,status:"confirmed",notes:"",price:120},
];

const services = [
  {name:"Consultation",duration:60,price:75,description:"A focused session to understand the problem and define the best next step."},
  {name:"Follow-up",duration:45,price:45,description:"Review progress, answer questions, and remove any new blockers."},
  {name:"Strategy session",duration:90,price:120,description:"A deeper planning workshop for complex workflows or larger projects."},
  {name:"Quick check-in",duration:30,price:30,description:"A short session for decisions, updates, or a specific issue."},
];

export default function BookingBoardNext(){
  const [view,setView]=useState<View>("overview");
  const [appointments,setAppointments]=useState(seed);
  const [weekStart,setWeekStart]=useState(startOfWeek(new Date(2026,8,2),{weekStartsOn:1}));
  const [bookingOpen,setBookingOpen]=useState(false);
  const [selected,setSelected]=useState<Appointment|null>(null);
  const [query,setQuery]=useState("");
  const [notice,setNotice]=useState("");
  const days=useMemo(()=>Array.from({length:7},(_,i)=>addDays(weekStart,i)),[weekStart]);
  const weekAppointments=appointments.filter(a=>days.some(d=>isSameDay(parseISO(a.appointmentDate),d)) && matches(a,query));
  const customers=useMemo(()=>Array.from(new Map(appointments.map(a=>[a.customerEmail,a])).values()).filter(a=>matches(a,query)),[appointments,query]);
  const weekTitle=`${format(days[0],"MMM d")} – ${format(days[6],"MMM d, yyyy")}`;

  function navigate(next:View){setView(next);setQuery("");}
  function moveWeek(amount:number){setWeekStart(current=>addWeeks(current,amount));}
  function flash(message:string){setNotice(message);window.setTimeout(()=>setNotice(""),2600);}
  function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault(); const form=new FormData(event.currentTarget);
    const value=(name:string)=>String(form.get(name)??"");
    const candidate:Appointment={id:Date.now(),customerName:value("customerName"),customerEmail:value("customerEmail"),customerPhone:value("customerPhone"),service:value("service"),staffName:value("staffName"),appointmentDate:value("appointmentDate"),startTime:value("startTime"),durationMins:Number(value("durationMins")),status:"confirmed",notes:value("notes"),price:Number(value("price"))};
    const start=toMinutes(candidate.startTime),end=start+candidate.durationMins;
    const conflict=appointments.some(a=>a.status!=="cancelled"&&a.staffName===candidate.staffName&&a.appointmentDate===candidate.appointmentDate&&start<toMinutes(a.startTime)+a.durationMins&&end>toMinutes(a.startTime));
    if(conflict){flash(`${candidate.staffName} already has a booking at that time.`);return;}
    setAppointments(current=>[...current,candidate]); setBookingOpen(false); setWeekStart(startOfWeek(parseISO(candidate.appointmentDate),{weekStartsOn:1})); flash("Booking created successfully.");
  }
  function updateStatus(status:string){if(!selected)return;setAppointments(current=>current.map(a=>a.id===selected.id?{...a,status}:a));setSelected(null);flash(`Booking marked ${status}.`);}

  return <main className="board-shell">
    <aside className="board-sidebar">
      <div className="board-logo"><span>A</span><div>Arbor<small>BOOKINGS</small></div></div>
      <nav aria-label="Main navigation">
        <Nav active={view==="overview"} onClick={()=>navigate("overview")} icon={<LayoutDashboard/>}>Overview</Nav>
        <Nav active={view==="calendar"} onClick={()=>navigate("calendar")} icon={<CalendarDays/>}>Calendar</Nav>
        <Nav active={view==="customers"} onClick={()=>navigate("customers")} icon={<Users/>}>Customers</Nav>
        <Nav active={view==="services"} onClick={()=>navigate("services")} icon={<Clock3/>}>Services</Nav>
      </nav>
      <div className="board-side-bottom"><Nav active={view==="settings"} onClick={()=>navigate("settings")} icon={<Settings/>}>Settings</Nav><div className="board-profile"><b>DS</b><span>Dimitar Shopov<small>Administrator</small></span></div></div>
    </aside>
    <section className="board-main">
      <header className="board-header"><div><p>{format(new Date(2026,8,2),"EEEE, MMMM d")}</p><h1>{titles[view]}</h1></div><div className="board-actions"><label className="board-search"><Search/><Input aria-label="Search" placeholder="Search…" value={query} onChange={e=>setQuery(e.target.value)}/></label><Button onClick={()=>setBookingOpen(true)}><Plus/> New booking</Button></div></header>
      {notice&&<output className="board-notice">{notice}</output>}
      {view==="overview"&&<Overview appointments={appointments} weekAppointments={weekAppointments} days={days} title={weekTitle} moveWeek={moveWeek} resetWeek={()=>setWeekStart(startOfWeek(new Date(2026,8,2),{weekStartsOn:1}))} select={setSelected}/>} 
      {view==="calendar"&&<CalendarView appointments={weekAppointments} days={days} title={weekTitle} moveWeek={moveWeek} resetWeek={()=>setWeekStart(startOfWeek(new Date(2026,8,2),{weekStartsOn:1}))} select={setSelected}/>} 
      {view==="customers"&&<CustomersView customers={customers} appointments={appointments} select={setSelected}/>} 
      {view==="services"&&<ServicesView appointments={appointments} book={(name)=>{setBookingOpen(true);window.setTimeout(()=>{const el=document.querySelector<HTMLSelectElement>('select[name="service"]');if(el)el.value=name;},0);}}/>}
      {view==="settings"&&<SettingsView/>}
    </section>
    <BookingDialog open={bookingOpen} onOpenChange={setBookingOpen} onSubmit={submit}/>
    <Dialog open={!!selected} onOpenChange={open=>!open&&setSelected(null)}><DialogContent className="details-dialog"><DialogHeader><DialogTitle>{selected?.customerName}</DialogTitle><DialogDescription>{selected?.service} with {selected?.staffName}</DialogDescription></DialogHeader>{selected&&<div className="details"><p><span>Date</span><b>{format(parseISO(selected.appointmentDate),"EEEE, MMMM d")}</b></p><p><span>Time</span><b>{selected.startTime} · {selected.durationMins} min</b></p><p><span>Status</span><b className={`status ${selected.status}`}>{selected.status}</b></p><p><span>Contact</span><b>{selected.customerEmail||selected.customerPhone}</b></p><p><span>Notes</span><b>{selected.notes||"No notes"}</b></p><div className="status-actions"><Button onClick={()=>updateStatus("completed")}>Mark completed</Button><Button variant="outline" onClick={()=>updateStatus("cancelled")}>Cancel booking</Button></div></div>}</DialogContent></Dialog>
  </main>;
}

function Nav({active,onClick,icon,children}:{active:boolean;onClick:()=>void;icon:React.ReactNode;children:React.ReactNode}){return <button type="button" className={active?"active":""} onClick={onClick}>{icon}{children}</button>}
function WeekControls({title,moveWeek,resetWeek}:{title:string;moveWeek:(n:number)=>void;resetWeek:()=>void}){return <div className="week-controls"><div><h2>{title}</h2><p>Weekly schedule</p></div><div><Button variant="outline" size="icon" aria-label="Previous week" onClick={()=>moveWeek(-1)}><ChevronLeft/></Button><Button variant="outline" onClick={resetWeek}>Today</Button><Button variant="outline" size="icon" aria-label="Next week" onClick={()=>moveWeek(1)}><ChevronRight/></Button></div></div>}
function Overview({appointments,weekAppointments,days,title,moveWeek,resetWeek,select}:{appointments:Appointment[];weekAppointments:Appointment[];days:Date[];title:string;moveWeek:(n:number)=>void;resetWeek:()=>void;select:(a:Appointment)=>void}){const revenue=appointments.filter(a=>a.status!=="cancelled").reduce((s,a)=>s+a.price,0);return <><div className="board-stats"><article><p>This week</p><strong>{weekAppointments.length}</strong><span>scheduled bookings</span></article><article><p>Total customers</p><strong>{new Set(appointments.map(a=>a.customerEmail)).size}</strong><span>active contacts</span></article><article><p>Expected revenue</p><strong>€{revenue}</strong><span>all confirmed work</span></article><article><p>Open slots</p><strong>{Math.max(0,35-weekAppointments.length)}</strong><span>across the week</span></article></div><section className="board-card"><WeekControls {...{title,moveWeek,resetWeek}}/><WeekList appointments={weekAppointments} days={days} select={select}/></section></>}
function CalendarView({appointments,days,title,moveWeek,resetWeek,select}:{appointments:Appointment[];days:Date[];title:string;moveWeek:(n:number)=>void;resetWeek:()=>void;select:(a:Appointment)=>void}){return <section className="board-card calendar-view"><WeekControls {...{title,moveWeek,resetWeek}}/><WeekList appointments={appointments} days={days} select={select}/></section>}
function WeekList({appointments,days,select}:{appointments:Appointment[];days:Date[];select:(a:Appointment)=>void}){return <div className="week-list">{days.map(day=>{const items=appointments.filter(a=>isSameDay(parseISO(a.appointmentDate),day)).sort((a,b)=>a.startTime.localeCompare(b.startTime));return <article key={day.toISOString()} className={isSameDay(day,new Date(2026,8,2))?"current":""}><header><span>{format(day,"EEE")}</span><b>{format(day,"d")}</b></header><div>{items.length?items.map(a=><button key={a.id} onClick={()=>select(a)} className={a.status}><time>{a.startTime}</time><span><b>{a.customerName}</b><small>{a.service} · {a.staffName}</small></span></button>):<p>No bookings</p>}</div></article>})}</div>}
function CustomersView({customers,appointments,select}:{customers:Appointment[];appointments:Appointment[];select:(a:Appointment)=>void}){return <section className="board-card data-view"><div className="section-copy"><h2>Customers</h2><p>Every customer and their latest booking information.</p></div><div className="customer-table"><div className="table-head"><span>Customer</span><span>Contact</span><span>Bookings</span><span>Latest service</span></div>{customers.map(customer=><button key={customer.customerEmail} onClick={()=>select(customer)}><span className="person"><b>{initials(customer.customerName)}</b><span><strong>{customer.customerName}</strong><small>{customer.status}</small></span></span><span>{customer.customerEmail}<small>{customer.customerPhone}</small></span><span>{appointments.filter(a=>a.customerEmail===customer.customerEmail).length}</span><span>{customer.service}</span></button>)}</div></section>}
function ServicesView({appointments,book}:{appointments:Appointment[];book:(name:string)=>void}){return <div className="services-grid">{services.map(service=><article key={service.name}><div className="service-icon"><Clock3/></div><h2>{service.name}</h2><p>{service.description}</p><div><span>{service.duration} minutes</span><strong>€{service.price}</strong></div><small>{appointments.filter(a=>a.service===service.name).length} bookings</small><Button variant="outline" onClick={()=>book(service.name)}>Book service</Button></article>)}</div>}
function SettingsView(){return <section className="board-card settings-view"><div className="section-copy"><h2>Business settings</h2><p>Basic scheduling preferences for Arbor Bookings.</p></div><label>Business name<Input defaultValue="Arbor Bookings"/></label><label>Time zone<select defaultValue="Europe/Sofia"><option>Europe/Sofia</option><option>Europe/London</option><option>America/New_York</option></select></label><label>Working hours<div className="settings-row"><Input type="time" defaultValue="09:00"/><span>to</span><Input type="time" defaultValue="17:00"/></div></label><Button onClick={()=>alert("Settings saved")}>Save settings</Button></section>}
function BookingDialog({open,onOpenChange,onSubmit}:{open:boolean;onOpenChange:(open:boolean)=>void;onSubmit:(e:FormEvent<HTMLFormElement>)=>void}){return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="booking-dialog"><DialogHeader><DialogTitle>New booking</DialogTitle><DialogDescription>Add an appointment. Scheduling conflicts are blocked automatically.</DialogDescription></DialogHeader><form onSubmit={onSubmit} className="booking-form"><label>Customer name<Input name="customerName" required placeholder="Full name"/></label><div className="form-row"><label>Email<Input name="customerEmail" type="email" required placeholder="customer@email.com"/></label><label>Phone<Input name="customerPhone" placeholder="+359…"/></label></div><div className="form-row"><label>Service<select name="service" defaultValue="Consultation">{services.map(s=><option key={s.name}>{s.name}</option>)}</select></label><label>Team member<select name="staffName"><option>Dimitar</option><option>Elena</option></select></label></div><div className="form-row three"><label>Date<Input name="appointmentDate" type="date" defaultValue="2026-09-03" required/></label><label>Start<Input name="startTime" type="time" defaultValue="11:00" required/></label><label>Duration<select name="durationMins"><option value="30">30 min</option><option value="45">45 min</option><option value="60" selected>60 min</option><option value="90">90 min</option></select></label></div><label>Price (€)<Input name="price" type="number" min="0" defaultValue="75"/></label><label>Notes<Textarea name="notes" placeholder="Anything the team should know…"/></label><Button type="submit">Create booking</Button></form></DialogContent></Dialog>}
const titles:Record<View,string>={overview:"Good morning, Dimitar",calendar:"Calendar",customers:"Customers",services:"Services",settings:"Settings"};
function matches(a:Appointment,q:string){return `${a.customerName} ${a.customerEmail} ${a.service} ${a.staffName}`.toLowerCase().includes(q.toLowerCase())}
function toMinutes(value:string){const [h,m]=value.split(":").map(Number);return h*60+m}
function initials(name:string){return name.split(" ").map(part=>part[0]).join("").slice(0,2)}
