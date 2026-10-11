import {directRoutes,flightSearch,winterReferenceApplies} from './transport-data.mjs';
export {flightSearch};
export function referenceFor(origin,airport,date){
  if(airport==='NAV')return 'No regular European nonstop route to NAV was verified. Compare connections at IST or SAW.';
  const route=directRoutes.find(r=>r.code===origin);
  if(!route)return 'Compare a complete itinerary to ASR or NAV. Check the Istanbul airport code on both legs.';
  if(!route.days)return `${route.city}–ASR appears in the summer 2026 reference. Check seasonal operation and your exact dates with the airline.`;
  if(!winterReferenceApplies(date))return 'Your date is outside the October 2026–March 2027 published reference. Check the airline for the relevant season.';
  const day=(new Date(date+'T12:00:00Z').getUTCDay()+6)%7;
  return route.days.includes(day)?'This weekday appears in the published SunExpress winter reference. Search live flights to confirm the date, time and seats.':'This weekday is not marked in the published SunExpress winter reference. Other airlines or connections may be available; search live flights.';
}
const icsEscape=s=>String(s||'').replaceAll('\\','\\\\').replaceAll('\r','').replaceAll('\n','\\n').replaceAll(',','\\,').replaceAll(';','\\;');
export function arrivalCalendar(plan){
  const events=[{date:plan.arrival,flight:plan.flight,label:`Arrival at ${plan.airport}`,detail:`Arrival flight: ${plan.flight}. Hotel: ${plan.hotel}. Send these details to your transfer provider and confirm pickup. This is a planning note, not a reservation.`}];
  if(plan.departure)events.push({date:plan.departure,flight:plan.returnFlight||'not provided',label:`Departure from ${plan.returnAirport||plan.airport}`,detail:`Return flight: ${plan.returnFlight||'not yet booked'}. Confirm hotel pickup with your provider; this all-day reminder is not a pickup time.`});
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
    fields.departure.setCustomValidity(fields.departure.value&&fields.departure.value<fields.arrival.value?'Return date must be on or after arrival.':'');
    const origin=fields.origin.value==='custom'?fields.customOrigin.value:fields.origin.value;
    document.querySelector('#flight-search-link').href=flightSearch(origin||'your departure airport',fields.airport.value,fields.arrival.value,fields.departure.value);
    document.querySelector('#custom-origin-field').hidden=fields.origin.value!=='custom';fields.customOrigin.required=fields.origin.value==='custom';
    status.textContent=referenceFor(fields.origin.value,fields.airport.value,fields.arrival.value);
    transfer.elements.arrival.value=fields.arrival.value;transfer.elements.departure.value=fields.departure.value;transfer.elements.airport.value=fields.airport.value;
    transfer.elements.departure.min=fields.arrival.value;transfer.elements.returnAirport.value=fields.airport.value;currentPlan=null;document.querySelector('#download-travel-calendar').hidden=true;document.querySelector('#transfer-summary').textContent='';
    label.textContent=new Intl.DateTimeFormat('en',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(year,month,1)));
    calendar.replaceChildren();
    for(const day of ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']){const cell=document.createElement('span');cell.className='calendar-weekday';cell.textContent=day;calendar.append(cell);}
    for(const date of monthGrid(year,month)){
      if(!date){calendar.append(document.createElement('span'));continue;}
      const button=document.createElement('button');button.type='button';button.className='calendar-day';button.textContent=Number(date.slice(-2));button.disabled=date<today;button.setAttribute('aria-label',date);
      if(date===fields.arrival.value){button.classList.add('selected');button.setAttribute('aria-pressed','true');}else button.setAttribute('aria-pressed','false');
      if(date===fields.departure.value)button.classList.add('departure');
      const route=directRoutes.find(r=>r.code===fields.origin.value),weekday=(new Date(date+'T12:00:00Z').getUTCDay()+6)%7;
      if(fields.airport.value==='ASR'&&route?.days?.includes(weekday)&&winterReferenceApplies(date)){button.classList.add('reference-day');button.title='Weekday in the published winter reference; live confirmation required';}
      button.addEventListener('click',()=>{fields.arrival.value=date;sync();});calendar.append(button);
    }
  }
  form.addEventListener('input',()=>{if(fields.arrival.value){year=Number(fields.arrival.value.slice(0,4));month=Number(fields.arrival.value.slice(5,7))-1;}sync();});
  form.addEventListener('submit',event=>{event.preventDefault();if(form.reportValidity())window.open(document.querySelector('#flight-search-link').href,'_blank','noopener');});
  document.querySelectorAll('[data-calendar-move]').forEach(button=>button.addEventListener('click',()=>{const next=new Date(Date.UTC(year,month+Number(button.dataset.calendarMove),1));year=next.getUTCFullYear();month=next.getUTCMonth();sync();}));
  const output=document.querySelector('#transfer-summary');
  transfer.addEventListener('input',()=>{currentPlan=null;document.querySelector('#download-travel-calendar').hidden=true;output.textContent='';transfer.elements.departure.setCustomValidity(transfer.elements.departure.value&&transfer.elements.departure.value<transfer.elements.arrival.value?'Return date must be on or after arrival.':'');transfer.elements.returnFlight.required=Boolean(transfer.elements.returnBooked.checked);transfer.elements.departure.required=Boolean(transfer.elements.returnBooked.checked);});
  transfer.addEventListener('submit',event=>{event.preventDefault();if(!transfer.reportValidity())return;currentPlan=Object.fromEntries(new FormData(transfer));output.textContent=`Arrival: ${currentPlan.arrival}, ${currentPlan.airport}, flight ${currentPlan.flight}. Hotel: ${currentPlan.hotel}.${currentPlan.departure?` Return: ${currentPlan.departure}, ${currentPlan.returnAirport}, flight ${currentPlan.returnFlight||'not yet booked'}.`:''} Send this information to the provider when you book. Your pickup is not reserved by this checklist.`;document.querySelector('#download-travel-calendar').hidden=false;});
  document.querySelector('#download-travel-calendar').addEventListener('click',()=>{if(!currentPlan)return;const url=URL.createObjectURL(new Blob([arrivalCalendar(currentPlan)],{type:'text/calendar;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='cappadocia-arrival-checklist.ics';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  sync();
}
