import {directRoutes,flightSearch,winterReferenceApplies} from './transport-data.mjs';
export {flightSearch};
const t=(key,values=[])=>globalThis.window?.Locale?.t(key,values)??key.replace(/\{(\d+)\}/g,(_,i)=>values[i]??'');
export function referenceFor(origin,airport,date){
  if(airport==='NAV')return t('No regular European nonstop route to NAV was verified. Compare connections at IST or SAW.');
  const route=directRoutes.find(r=>r.code===origin);
  if(!route)return t('Compare a complete itinerary to ASR or NAV. Check the Istanbul airport code on both legs.');
  if(!route.days)return t('{0}–ASR appears in the summer 2026 reference. Check seasonal operation and your exact dates with the airline.',[route.city]);
  if(!winterReferenceApplies(date))return t('Your date is outside the October 2026–March 2027 published reference. Check the airline for the relevant season.');
  const day=(new Date(date+'T12:00:00Z').getUTCDay()+6)%7;
  return t(route.days.includes(day)?'This weekday appears in the published SunExpress winter reference. Search live flights to confirm the date, time and seats.':'This weekday is not marked in the published SunExpress winter reference. Other airlines or connections may be available; search live flights.');
}
const icsEscape=s=>String(s||'').replaceAll('\\','\\\\').replaceAll('\r','').replaceAll('\n','\\n').replaceAll(',','\\,').replaceAll(';','\\;');
export function arrivalCalendar(plan){
  const events=[{date:plan.arrival,flight:plan.flight,label:t('Arrival at {0}',[plan.airport]),detail:t('Arrival flight: {0}. Hotel: {1}. Send these details to your transfer provider and confirm pickup. This is a planning note, not a reservation.',[plan.flight,plan.hotel])}];
  if(plan.departure)events.push({date:plan.departure,flight:plan.returnFlight||'not provided',label:t('Departure from {0}',[plan.returnAirport||plan.airport]),detail:t('Return flight: {0}. Confirm hotel pickup with your provider; this all-day reminder is not a pickup time.',[plan.returnFlight||t('not yet booked')])});
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//CappadociaBlog//Travel Checklist//EN','CALSCALE:GREGORIAN',...events.flatMap((e,i)=>['BEGIN:VEVENT',`UID:${e.date.replaceAll('-','')}-${i}-${crypto.randomUUID()}@cappadociablog.com`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z')}`,`DTSTART;VALUE=DATE:${e.date.replaceAll('-','')}`,`SUMMARY:${icsEscape(e.label)}`,`DESCRIPTION:${icsEscape(e.detail)}`,'END:VEVENT']),'END:VCALENDAR',''].join('\r\n');
}
export function monthGrid(year,month){
  const start=(new Date(Date.UTC(year,month,1)).getUTCDay()+6)%7;
  const days=new Date(Date.UTC(year,month+1,0)).getUTCDate();
  return Array.from({length:Math.ceil((start+days)/7)*7},(_,i)=>i>=start&&i<start+days?`${year}-${String(month+1).padStart(2,'0')}-${String(i-start+1).padStart(2,'0')}`:null);
}
export function initialiseTravelPlanner(){
  const form=document.querySelector('#flight-planner');if(!form)return;
  const fields=form.elements,calendar=document.querySelector('#arrival-calendar'),status=document.querySelector('#route-reference'),label=document.querySelector('#calendar-label');
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(p=>[p.type,p.value]));
  const today=`${parts.year}-${parts.month}-${parts.day}`;
  fields.arrival.min=today;fields.departure.min=today;fields.arrival.value=today;
  let year=Number(today.slice(0,4)),month=Number(today.slice(5,7))-1,currentPlan;
  const transfer=document.querySelector('#transfer-checklist');transfer.elements.arrival.min=today;transfer.elements.departure.min=today;
  function sync(){
    fields.departure.min=fields.arrival.value||today;
    fields.departure.setCustomValidity(fields.departure.value&&fields.departure.value<fields.arrival.value?t('Return date must be on or after arrival.'):'');
    const origin=fields.origin.value==='custom'?fields.customOrigin.value:fields.origin.value;
    document.querySelector('#flight-search-link').href=flightSearch(origin||'your departure airport',fields.airport.value,fields.arrival.value,fields.departure.value);
    document.querySelector('#custom-origin-field').hidden=fields.origin.value!=='custom';fields.customOrigin.required=fields.origin.value==='custom';
    status.textContent=referenceFor(fields.origin.value,fields.airport.value,fields.arrival.value);
    transfer.elements.arrival.value=fields.arrival.value;transfer.elements.departure.value=fields.departure.value;transfer.elements.airport.value=fields.airport.value;
    transfer.elements.departure.min=fields.arrival.value;transfer.elements.returnAirport.value=fields.airport.value;currentPlan=null;document.querySelector('#download-travel-calendar').hidden=true;document.querySelector('#transfer-summary').textContent='';
    label.textContent=new Intl.DateTimeFormat(document.documentElement.lang||'en',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(year,month,1)));
    calendar.replaceChildren();
    for(let index=0;index<7;index++){const cell=document.createElement('span');cell.className='calendar-weekday';cell.textContent=new Intl.DateTimeFormat(document.documentElement.lang||'en',{weekday:'short',timeZone:'UTC'}).format(new Date(Date.UTC(2026,9,19+index)));calendar.append(cell);}
    for(const date of monthGrid(year,month)){
      if(!date){calendar.append(document.createElement('span'));continue;}
      const button=document.createElement('button');button.type='button';button.className='calendar-day';button.textContent=Number(date.slice(-2));button.disabled=date<today;button.setAttribute('aria-label',date);
      if(date===fields.arrival.value){button.classList.add('selected');button.setAttribute('aria-pressed','true');}else button.setAttribute('aria-pressed','false');
      if(date===fields.departure.value)button.classList.add('departure');
      const route=directRoutes.find(r=>r.code===fields.origin.value),weekday=(new Date(date+'T12:00:00Z').getUTCDay()+6)%7;
      if(fields.airport.value==='ASR'&&route?.days?.includes(weekday)&&winterReferenceApplies(date)){button.classList.add('reference-day');button.title=t('Weekday in the published winter reference; live confirmation required');}
      button.addEventListener('click',()=>{fields.arrival.value=date;sync();});calendar.append(button);
    }
  }
  form.addEventListener('input',()=>{if(fields.arrival.value){year=Number(fields.arrival.value.slice(0,4));month=Number(fields.arrival.value.slice(5,7))-1;}sync();});
  form.addEventListener('submit',event=>{event.preventDefault();if(form.reportValidity())window.open(document.querySelector('#flight-search-link').href,'_blank','noopener');});
  document.querySelectorAll('[data-calendar-move]').forEach(button=>button.addEventListener('click',()=>{const next=new Date(Date.UTC(year,month+Number(button.dataset.calendarMove),1));year=next.getUTCFullYear();month=next.getUTCMonth();sync();}));
  const output=document.querySelector('#transfer-summary');
  transfer.addEventListener('input',()=>{currentPlan=null;document.querySelector('#download-travel-calendar').hidden=true;output.textContent='';transfer.elements.departure.setCustomValidity(transfer.elements.departure.value&&transfer.elements.departure.value<transfer.elements.arrival.value?t('Return date must be on or after arrival.'):'');transfer.elements.returnFlight.required=Boolean(transfer.elements.returnBooked.checked);transfer.elements.departure.required=Boolean(transfer.elements.returnBooked.checked);});
  transfer.addEventListener('submit',event=>{event.preventDefault();if(!transfer.reportValidity())return;currentPlan=Object.fromEntries(new FormData(transfer));output.textContent=t('Arrival: {0}, {1}, flight {2}. Hotel: {3}.',[currentPlan.arrival,currentPlan.airport,currentPlan.flight,currentPlan.hotel])+(currentPlan.departure?t(' Return: {0}, {1}, flight {2}.',[currentPlan.departure,currentPlan.returnAirport,currentPlan.returnFlight||t('not yet booked')]):'')+t(' Send this information to the provider when you book. Your pickup is not reserved by this checklist.');document.querySelector('#download-travel-calendar').hidden=false;});
  document.querySelector('#download-travel-calendar').addEventListener('click',()=>{if(!currentPlan)return;const url=URL.createObjectURL(new Blob([arrivalCalendar(currentPlan)],{type:'text/calendar;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='cappadocia-arrival-checklist.ics';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  sync();
}
