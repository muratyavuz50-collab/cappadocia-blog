// Owner-requested contextual resource. Existing operator/GYG links remain untouched.
export const target='https://cappadociaballoonflights.com/';
export const marker='<!-- balloon-resource:start -->',endMarker='<!-- balloon-resource:end -->';
export const configurations={'www.cappadociablog.com':{routes:['/','/topics/balloons/','/getting-there/','/articles/cappadocia-hotel-guide/']}};
const copy={
 en:['Explore Cappadocia','Plan your time above the valleys','Including a balloon flight in your Göreme itinerary? Explore Cappadocia Balloon Flights for flight options and booking information.','Check the exact flight operator, departure area, dates and booking terms with the provider.'],
 tr:['Kapadokya’yı keşfedin','Vadilerin üzerinde bir sabah planlayın','Göreme gezinizde balon uçuşuna da yer ayırıyor musunuz? Uçuş seçenekleri ve rezervasyon bilgileri için Cappadocia Balloon Flights’ı inceleyin.','Uçuşu gerçekleştiren işletmeciyi, kalkış bölgesini, tarihleri ve rezervasyon koşullarını sağlayıcıyla teyit edin.'],
 es:['Descubre Capadocia','Planea una mañana sobre los valles','¿Vas a incluir un vuelo en globo en tu viaje a Göreme? Consulta las opciones de vuelo y la información de reserva en Cappadocia Balloon Flights.','Confirma con el proveedor el operador del vuelo, la zona de despegue, las fechas y las condiciones de reserva.'],
 zh:['探索卡帕多奇亚','安排一个飞越山谷的早晨','计划在格雷梅之旅中体验热气球？可在Cappadocia Balloon Flights查看飞行选项和预订信息。','请向服务商确认实际飞行运营商、起飞区域、日期及预订条款。']};
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function selection(html){
 const canonical=html.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["']([^"']+)["']/i)?.[1];if(!canonical)return null;
 const url=new URL(canonical),config=configurations[url.hostname];if(!config)return null;
 const match=url.pathname.match(/^\/(tr|es|zh)\//),lang=match?.[1]||'en',route=match?url.pathname.slice(match[0].length-1):url.pathname;
 return config.routes.includes(route)?{lang,route,canonical}:null;
}
export function addBalloonResource(html){
 const selected=selection(html);if(!selected||html.includes(marker))return html;
 if(!html.includes('</main>'))throw new Error('Selected resource page has no main element');
 const c=copy[selected.lang];
 const section=marker+`<style>.balloon-resource{box-sizing:border-box;max-width:1120px;margin:40px auto;padding:28px clamp(18px,4vw,36px);border-block:1px solid currentColor;color:inherit}.balloon-resource h2{font-family:Georgia,serif;font-size:clamp(1.5rem,3vw,2.1rem);line-height:1.25;margin:12px 0}.balloon-resource p{max-width:78ch;line-height:1.75;margin:12px 0}.balloon-resource-label{font-size:.75rem;letter-spacing:.08em;text-transform:uppercase}.balloon-resource a{display:inline-block;max-width:100%;padding:10px 0;color:inherit;text-decoration:underline;text-underline-offset:4px;overflow-wrap:anywhere;font-weight:700}.balloon-resource small{display:block;font-size:.85rem;line-height:1.6}.balloon-resource a:focus-visible{outline:2px solid currentColor;outline-offset:4px}@media(max-width:700px){.balloon-resource{margin:28px 16px;padding:22px 8px}}</style><section class="balloon-resource" data-balloon-resource="cappadociaballoonflights" aria-labelledby="balloon-resource-title"><span class="balloon-resource-label">${escape(c[0])}</span><h2 id="balloon-resource-title">${escape(c[1])}</h2><p>${escape(c[2])}</p><a href="${target}" target="_blank" rel="noopener noreferrer" data-outbound="balloon_resource" data-provider="cappadociaballoonflights" data-affiliate="false" data-placement="balloon_resource_${selected.lang}">Cappadocia Balloon Flights <span aria-hidden="true">↗</span></a><small>${escape(c[3])}</small></section>`+endMarker;
 return html.replace('</main>',section+'</main>');
}
export async function decorateResponse(request,response){
 if(request.method!=='GET'||response.status!==200||!response.headers.get('content-type')?.includes('text/html'))return response;
 const route=new URL(request.url).pathname.replace(/^\/(tr|es|zh)\//,'/');if(!configurations['www.cappadociablog.com'].routes.includes(route))return response;
 const original=await response.clone().text(),updated=addBalloonResource(original);if(updated===original)return response;
 const headers=new Headers(response.headers);headers.delete('content-length');headers.delete('etag');
 return new Response(updated,{status:response.status,statusText:response.statusText,headers});
}
