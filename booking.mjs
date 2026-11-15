// Booking/CJ identifiers supplied by the publisher on 2026-11-15.
// Hotel destinations verified against Booking.com property records; never invent an aid.
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
export const bookingPublisher = '101906092';
export const bookingHotels = [
  {id:'sultan', name:'Sultan Cave Suites', area:'Göreme', slug:'sultan-cave-suites', note:'Compare the exact room and terrace access for your Göreme stay.'},
  {id:'aza', name:'Aza Cave Hotel', area:'Göreme', slug:'aza-cave-suites', note:'Plan an adult stay in Göreme; check the guest-age policy and room category.'},
  {id:'kelebek', name:'Kelebek Special Cave Hotel', area:'Göreme', slug:'kelebek-cave', note:'Compare cave and stone room categories, access and included facilities.'},
  {id:'artemis', name:'Artemis Cave Suites', area:'Göreme', slug:'artemis-cave-suites', note:'Check the adults-only policy, room layout and any spa access in your offer.'},
  {id:'henna', name:'Henna Hotel', area:'Göreme', slug:'phoenix-nevseha-r', note:'Check the adults-only policy, selected room and terrace arrangements.'},
  {id:'aydinli', name:'Aydınlı Cave Hotel', area:'Göreme', slug:'aydinli-cave', note:'Compare room windows, steps and breakfast details for your Göreme base.'},
  {id:'museum', name:'Museum Hotel', area:'Uçhisar', slug:'museum', note:'Choose your Uçhisar room carefully and arrange any restaurant reservation separately.'},
  {id:'argos', name:'Argos in Cappadocia', area:'Uçhisar', slug:'argos-in-cappadocia', note:'Match the room, daylight and hillside access to the stay you have in mind.'},
  {id:'taskonaklar', name:'Taşkonaklar Hotel', area:'Uçhisar', slug:'taskonaklar', note:'Compare the exact room, outdoor facilities and transport for a Uçhisar stay.'},
  {id:'seki', name:'Seki Cave Hotel', area:'Çavuşin', slug:'seki-cave-cavusin', note:'Stay in Çavuşin; check room details, terrace access and transport to Göreme.'},
  {id:'cappadocia-cave-suites', name:'Cappadocia Cave Suites', area:'Göreme', slug:'cappadocia-cave-suites', note:'Confirm the layout and bed arrangement of the cave or stone room you select.'},
  {id:'carus', name:'Carus Cappadocia', area:'Göreme', slug:'carus-cappadocia', note:'Check the guest-age policy, exact room and access to the facilities you want.'}
].map(hotel => ({...hotel, url:`https://www.booking.com/hotel/tr/${hotel.slug}.html`}));

export const bookingProductIds = [...bookingHotels.map(hotel => `booking-${hotel.id}`), 'booking-search', 'booking-flights'];
export const bookingSearchDestination = 'https://www.booking.com/searchresults.html?ss=Cappadocia%2C%20T%C3%BCrkiye&selected_currency=EUR';
export function bookingSid(value) { return String(value).toLowerCase().replace(/[^a-z0-9_-]/g,'-').slice(0,90); }
export function bookingLink(destination, placement) {
  const target = new URL(destination);
  if (target.protocol !== 'https:' || target.hostname !== 'www.booking.com') throw new Error('Booking destination must be an HTTPS Booking.com URL.');
  const link = new URL(`https://www.dpbolvw.net/click-${bookingPublisher}-17293139`);
  link.searchParams.set('url', target.href);
  link.searchParams.set('sid', bookingSid(placement));
  return link.href;
}

export function bookingHotelSection({placement='cb_hotels', limit=12, compact=false}={}) {
  const hotels = bookingHotels.slice(0,limit);
  return `<section class="booking-hotels${compact?' booking-hotels-compact':''}" id="featured-stays" aria-labelledby="featured-stays-title">
    <div class="booking-section-heading"><div><span class="eyebrow">Featured stays</span><h2 id="featured-stays-title">Our Cappadocia hotel shortlist</h2></div><span class="booking-provider">Booking.com</span></div>
    <p class="booking-intro">Start with Sultan, Aza and Kelebek in Göreme, then explore our preferred stays in Göreme, Uçhisar and Çavuşin. Compare the room and total price for your own dates.</p>
    <div class="booking-hotel-grid">${hotels.map((hotel,index)=>`<article class="booking-hotel-card${index<3?' booking-hotel-featured':''}" data-booking-hotel="${hotel.id}"><span class="booking-hotel-area">${escape(hotel.area)}</span><h3>${escape(hotel.name)}</h3><p>${escape(hotel.note)}</p><a class="button button-booking" href="${escape(bookingLink(hotel.url,`${placement}_${hotel.id}`))}" target="_blank" rel="sponsored nofollow noopener" data-booking-product="booking-${hotel.id}">Check availability on Booking.com</a></article>`).join('')}</div>
    ${limit<12?'<a class="booking-more" href="/articles/cappadocia-hotel-guide/#featured-stays">Explore all 12 featured hotels →</a>':''}
  </section>`;
}

const widgets = {
  accommodation: {selector:'bookingAffiliateWidget_386d39d7-2d08-41b5-af0f-0fc2c536b862', campaign:'17323528', title:'Find a stay for your dates', text:'Search Cappadocia accommodation on Booking.com. Choose your dates, guests and room, then review the final offer.', cta:'Search Cappadocia stays on Booking.com', product:'booking-search'},
  flights: {selector:'bookingAffiliateWidget_39c24ef3-3091-43e9-a903-e1857048b61e', campaign:'17323529', title:'Compare flights for your Cappadocia trip', text:'Search flights on Booking.com. Compare Kayseri (ASR) and Nevşehir (NAV), then match your airport transfer to the flight you book.', cta:'Search flights on Booking.com', product:'booking-flights'}
};
export function bookingWidget(type='accommodation', placement='cb_widget') {
  const widget = widgets[type];
  if (!widget) throw new Error('Unknown Booking widget.');
  const sid = bookingSid(placement);
  const destination = `https://www.jdoqocy.com/click-${bookingPublisher}-${widget.campaign}?sid=${sid}`;
  const fallback = type==='flights' ? destination : bookingLink(bookingSearchDestination, `${sid}_fallback`);
  return `<section class="booking-search" data-booking-widget data-booking-type="${type}" data-booking-selector="${widget.selector}" data-booking-destination="${escape(destination)}" data-booking-currency="EUR" data-booking-click-label="${sid}"${type==='accommodation'?' data-booking-search="Cappadocia, Türkiye"':''}>
    <div class="booking-section-heading"><div><span class="eyebrow">Booking.com</span><h2>${widget.title}</h2></div></div><p>${widget.text}</p>
    <p class="booking-widget-status" data-booking-status data-booking-fallback-text="Open Booking.com to continue your search." data-booking-ready-text="Booking.com search is ready." role="status">Loading Booking.com search…</p>
    <div class="booking-widget-mount" id="${widget.selector}"></div>
    <a class="button button-booking booking-widget-fallback" data-booking-product="${widget.product}" href="${escape(fallback)}" target="_blank" rel="sponsored nofollow noopener">${widget.cta}</a>
    <img class="booking-tracking-pixel" src="https://www.awltovhc.com/image-${bookingPublisher}-${widget.campaign}" width="1" height="1" alt="" loading="lazy" decoding="async" aria-hidden="true">
  </section>`;
}

export function bookingForArticle(article) {
  const placement = `cb_${article.slug}`;
  if (article.category==='Where to Stay') return bookingHotelSection({placement,limit:['cappadocia-hotel-guide','best-hotels-cappadocia'].includes(article.slug)?12:3,compact:true}) + bookingWidget('accommodation',placement);
  if (article.category==='Getting There') return bookingWidget('flights',placement);
  if (['Trip Planning','Itineraries'].includes(article.category)) return bookingHotelSection({placement,limit:3,compact:true});
  return '';
}

export const bookingFooter = 'Our featured hotel selection includes properties connected to the publisher and other preferred stays. Some links are commercial; we may earn a commission at no extra cost to you. Reservations, payment and customer support are handled by Booking.com, GetYourGuide or the named provider.';
export const bookingPrivacyMetrics = 'We count page views, broad referral categories and clicks on our GetYourGuide and Booking.com affiliate links in daily aggregates retained for 90 days. We do not store IP addresses, full referrer URLs, search queries or visitor identifiers in these aggregates, and do not set analytics cookies. Around 20% of eligible visits send real page-performance measurements (LCP, CLS and INP); only performance bands are retained. Our measurement honours Do Not Track and Global Privacy Control. Counts are not unique visitors or confirmed bookings.';
export const bookingPrivacyServices = 'GetYourGuide and Booking.com widgets load when their section approaches the viewport. Booking.com placements also use CJ tracking links and impression pixels. These external services receive requests from your browser and apply their own privacy and cookie policies. Our Do Not Track setting controls our own measurement, not an external service. We do not receive payment-card details or complete reservations. If a widget is unavailable, the labelled booking link remains available.';

// Supplemental exact-string dictionaries follow the site's existing localization pipeline.
const copy = [
['Featured stays','Öne çıkan oteller','Alojamientos destacados','精选酒店'],
['Our Cappadocia hotel shortlist','Kapadokya için otel seçkimiz','Nuestra selección de hoteles en Capadocia','我们的卡帕多奇亚酒店精选'],
['Start with Sultan, Aza and Kelebek in Göreme, then explore our preferred stays in Göreme, Uçhisar and Çavuşin. Compare the room and total price for your own dates.','Göreme’de Sultan, Aza ve Kelebek ile başlayın; ardından Göreme, Uçhisar ve Çavuşin’deki diğer önerilerimize göz atın. Seçtiğiniz tarihler için oda özelliklerini ve toplam tutarı karşılaştırın.','Empieza por Sultan, Aza y Kelebek en Göreme y descubre los demás hoteles de nuestra selección en Göreme, Uçhisar y Çavuşin. Compara la habitación y el precio total para tus fechas.','先看看格雷梅的 Sultan、Aza 和 Kelebek，再了解我们在格雷梅、乌奇希萨尔和恰武辛的其他精选酒店。请按自己的入住日期比较房型与总价。'],
['Check availability on Booking.com','Booking.com’da müsaitliğe bak','Ver disponibilidad en Booking.com','在 Booking.com 查看空房'],
['Explore all 12 featured hotels →','Seçkideki 12 otelin tamamını gör →','Ver los 12 hoteles destacados →','查看全部 12 家精选酒店 →'],
['Find a stay for your dates','Tarihlerinize uygun bir otel bulun','Encuentra alojamiento para tus fechas','查找适合您日期的住宿'],
['Search Cappadocia accommodation on Booking.com. Choose your dates, guests and room, then review the final offer.','Booking.com’da Kapadokya otellerini arayın. Tarihleri, kişi sayısını ve odayı seçtikten sonra toplam tutarı ve rezervasyon koşullarını inceleyin.','Busca alojamiento en Capadocia en Booking.com. Elige fechas, huéspedes y habitación, y revisa las condiciones finales.','在 Booking.com 搜索卡帕多奇亚住宿，选择日期、人数和房型后，再核对最终报价与预订条件。'],
['Search Cappadocia stays on Booking.com','Booking.com’da Kapadokya otellerini ara','Buscar hoteles en Capadocia en Booking.com','在 Booking.com 搜索卡帕多奇亚酒店'],
['Compare flights for your Cappadocia trip','Kapadokya seyahatiniz için uçuşları karşılaştırın','Compara vuelos para tu viaje a Capadocia','比较前往卡帕多奇亚的航班'],
['Search flights on Booking.com. Compare Kayseri (ASR) and Nevşehir (NAV), then match your airport transfer to the flight you book.','Booking.com’da uçuş arayın. Kayseri (ASR) ve Nevşehir (NAV) seçeneklerini karşılaştırın; transferinizi satın aldığınız uçuşa göre planlayın.','Busca vuelos en Booking.com. Compara Kayseri (ASR) y Nevşehir (NAV) y organiza el traslado según el vuelo que reserves.','在 Booking.com 搜索航班，比较开塞利（ASR）和内夫谢希尔（NAV）机场，再根据已预订的航班安排接送。'],
['Search flights on Booking.com','Booking.com’da uçuş ara','Buscar vuelos en Booking.com','在 Booking.com 搜索航班'],
['Loading Booking.com search…','Booking.com araması yükleniyor…','Cargando el buscador de Booking.com…','正在加载 Booking.com 搜索…'],
['Open Booking.com to continue your search.','Aramanıza devam etmek için Booking.com’u açın.','Abre Booking.com para continuar la búsqueda.','打开 Booking.com 继续搜索。'],
['Booking.com search is ready.','Booking.com araması hazır.','El buscador de Booking.com está listo.','Booking.com 搜索已就绪。'],
['Compare the exact room and terrace access for your Göreme stay.','Göreme konaklamanız için seçtiğiniz odanın özelliklerini ve teras kullanımını karşılaştırın.','Compara la habitación concreta y el acceso a la terraza para tu estancia en Göreme.','为格雷梅之行核对具体房型及露台使用安排。'],
['Plan an adult stay in Göreme; check the guest-age policy and room category.','Göreme’de yetişkinlere yönelik bir konaklama için yaş koşulunu ve oda kategorisini inceleyin.','Para una estancia de adultos en Göreme, revisa la edad mínima y la categoría de habitación.','计划成人出行时，请确认入住年龄要求与房型。'],
['Compare cave and stone room categories, access and included facilities.','Kaya ve taş oda seçeneklerini, odaya erişimi ve fiyata dahil olanakları karşılaştırın.','Compara las habitaciones cueva y de piedra, el acceso y los servicios incluidos.','比较洞穴房与石屋房的类别、出入条件和所含设施。'],
['Check the adults-only policy, room layout and any spa access in your offer.','Yetişkinlere yönelik konaklama koşulunu, oda planını ve teklifinizde spa kullanımını kontrol edin.','Revisa la política de solo adultos, la distribución de la habitación y si la oferta incluye acceso al spa.','确认仅限成人入住的规定、房间布局及报价是否含水疗设施使用。'],
['Check the adults-only policy, selected room and terrace arrangements.','Yetişkinlere yönelik konaklama koşulunu, seçtiğiniz odayı ve teras kullanımını kontrol edin.','Consulta la política de solo adultos, la habitación elegida y el uso de la terraza.','核对仅限成人入住的规定、所选房型与露台使用安排。'],
['Compare room windows, steps and breakfast details for your Göreme base.','Göreme’de kalacağınız odanın pencerelerini, merdivenlerini ve kahvaltı koşullarını inceleyin.','Revisa las ventanas, las escaleras y las condiciones del desayuno para tu estancia en Göreme.','入住格雷梅前，了解房间窗户、台阶和早餐安排。'],
['Choose your Uçhisar room carefully and arrange any restaurant reservation separately.','Uçhisar’da odanızı özelliklerine göre seçin; restoran rezervasyonunu ayrıca yapın.','Elige la habitación en Uçhisar según tus necesidades y reserva el restaurante por separado.','根据需要选择乌奇希萨尔的房间，并另行安排餐厅预订。'],
['Match the room, daylight and hillside access to the stay you have in mind.','Oda özelliklerini, gün ışığını ve yamaçtaki erişim koşullarını konaklama beklentinize göre değerlendirin.','Valora la habitación, la luz natural y el acceso por la ladera según la estancia que buscas.','结合旅行需求，确认房型、自然采光和坡地出入条件。'],
['Compare the exact room, outdoor facilities and transport for a Uçhisar stay.','Uçhisar konaklamanız için odanın özelliklerini, açık alan olanaklarını ve ulaşımı karşılaştırın.','Compara la habitación, las instalaciones al aire libre y el transporte para tu estancia en Uçhisar.','比较乌奇希萨尔的具体房型、户外设施及交通安排。'],
['Stay in Çavuşin; check room details, terrace access and transport to Göreme.','Çavuşin’de konaklayın; oda özelliklerini, teras kullanımını ve Göreme’ye ulaşımı kontrol edin.','Para alojarte en Çavuşin, revisa la habitación, el acceso a la terraza y el transporte a Göreme.','计划住在恰武辛时，请核对房间、露台使用和前往格雷梅的交通。'],
['Confirm the layout and bed arrangement of the cave or stone room you select.','Seçtiğiniz kaya veya taş odanın planını ve yatak düzenini teyit edin.','Confirma la distribución y las camas de la habitación cueva o de piedra que elijas.','确认所选洞穴房或石屋房的布局和床型。'],
['Check the guest-age policy, exact room and access to the facilities you want.','Yaş koşulunu, seçtiğiniz odanın özelliklerini ve kullanmak istediğiniz olanakları kontrol edin.','Revisa la política de edad, la habitación concreta y el acceso a los servicios que te interesan.','核对入住年龄规定、具体房型及所需设施的使用条件。'],
[bookingFooter,'Otel seçkimizde yayıncıyla bağlantılı tesisler ve öncelik verdiğimiz diğer oteller yer alır. Bazı bağlantılar ticaridir; size ek ücret yansımadan komisyon kazanabiliriz. Rezervasyon, ödeme ve müşteri desteği Booking.com, GetYourGuide veya ilgili hizmet sağlayıcı tarafından yürütülür.','Nuestra selección incluye hoteles vinculados al editor y otros alojamientos preferidos. Algunos enlaces son comerciales y podemos recibir una comisión sin coste adicional para ti. Booking.com, GetYourGuide o el proveedor indicado gestionan las reservas, los pagos y la atención al cliente.','我们的酒店精选包括与发布方有关联的酒店及其他优先推荐住宿。部分链接为商业链接，我们可能获得佣金，您无需额外付费。预订、付款和客户服务由 Booking.com、GetYourGuide 或相应服务商处理。'],
[bookingPrivacyMetrics,'Sayfa görüntülemelerini, genel trafik kaynaklarını ve GetYourGuide ile Booking.com satış ortaklığı bağlantılarımıza yapılan tıklamaları, 90 gün saklanan günlük toplamlar halinde sayarız. Bu kayıtlarda IP adresi, tam yönlendiren URL, arama sorgusu veya ziyaretçi kimliği tutmayız; analitik çerezi kullanmayız. Uygun ziyaretlerin yaklaşık %20’sinde gerçek sayfa performansı (LCP, CLS, INP) ölçülür; yalnız performans aralıkları saklanır. Kendi ölçümlerimiz Do Not Track ve Global Privacy Control tercihlerini dikkate alır. Sayımlar tekil ziyaretçi veya tamamlanmış rezervasyon sayısı değildir.','Contamos las visitas, las categorías generales de procedencia y los clics en nuestros enlaces de afiliación de GetYourGuide y Booking.com mediante totales diarios que conservamos durante 90 días. No guardamos direcciones IP, URL completas de procedencia, búsquedas ni identificadores de visitantes, y no usamos cookies analíticas. En aproximadamente el 20 % de las visitas aptas medimos el rendimiento real de la página (LCP, CLS e INP) y conservamos solo intervalos. Nuestra medición respeta Do Not Track y Global Privacy Control. Los recuentos no representan visitantes únicos ni reservas confirmadas.','我们按日汇总页面浏览量、大致来源类别及 GetYourGuide 和 Booking.com 推广链接的点击量，并保留 90 天。这些记录不包含 IP 地址、完整来源网址、搜索词或访客标识，也不设置分析 Cookie。约 20% 的符合条件访问会发送实际页面性能数据（LCP、CLS 和 INP），仅保留性能区间。我们的测量遵循 Do Not Track 和 Global Privacy Control。计数不代表独立访客或已确认预订。'],
[bookingPrivacyServices,'GetYourGuide ve Booking.com araçları, ilgili bölüm ekrana yaklaştığında yüklenir. Booking.com alanlarında CJ takip bağlantıları ve gösterim pikselleri de kullanılır. Bu dış hizmetler tarayıcınızdan istek alır ve kendi gizlilik ile çerez politikalarını uygular. Do Not Track tercihi bizim ölçümlerimizi kontrol eder; dış hizmetleri kontrol etmez. Kart bilgilerinizi almayız ve rezervasyon işlemini tamamlamayız. Araç yüklenmezse etiketli rezervasyon bağlantısı kullanılabilir.','Los widgets de GetYourGuide y Booking.com se cargan cuando su sección se acerca al área visible. Los espacios de Booking.com también usan enlaces de seguimiento y píxeles de impresión de CJ. Estos servicios reciben solicitudes de tu navegador y aplican sus propias políticas de privacidad y cookies. Do Not Track controla nuestra medición, no la de servicios externos. No recibimos datos de tarjetas ni completamos reservas. Si un widget no está disponible, puedes usar el enlace de reserva indicado.','GetYourGuide 和 Booking.com 组件会在相关区域接近屏幕时加载。Booking.com 推广位也使用 CJ 跟踪链接和展示像素。这些外部服务会接收浏览器请求，并适用各自的隐私和 Cookie 政策。Do Not Track 控制我们自己的测量，不能控制外部服务。我们不接收银行卡信息，也不完成预订。如果组件不可用，带有明确标签的预订链接仍可使用。']
];
export const bookingGuideCopy = {
  title:'Cappadocia Hotel Guide: 12 Featured Stays to Compare',
  dek:'Start with Sultan, Aza and Kelebek, then compare our twelve preferred hotels in Göreme, Uçhisar and Çavuşin.',
  intro:'Start in Göreme with Sultan Cave Suites, Aza Cave Hotel and Kelebek Special Cave Hotel. Our twelve-hotel selection continues in the order shown below, with other Göreme stays and choices in Uçhisar and Çavuşin. Open the specific property on Booking.com to compare your dates, guests, room and cancellation conditions. This is a preferred selection, not a score-based ranking or a claim that every property suits every traveller.',
  goreme:'Göreme: Sultan, Aza and Kelebek',
  more:'More choices in Göreme and Çavuşin',
  moreFirst:'In Göreme, continue with Artemis Cave Suites, Henna Hotel and Aydınlı Cave Hotel; Cappadocia Cave Suites and Carus Cappadocia are also part of our selection. Compare the exact room and access to the facilities you want. Aza, Artemis and Henna list adult-focused guest policies, so check the current minimum age before planning a family stay.',
  moreSecond:'Seki Cave Hotel is in Çavuşin. It is a separate hotel from Seki Restaurant at Argos in Cappadocia. Check the journey to your planned dinners and activities, as well as the route from the vehicle drop-off to your room. For every property, ask about windows, ventilation, stairs and your actual bed arrangement.',
  howFirst:'Use each hotel’s Booking.com button to compare the same dates and guest count. The card opens that specific property, rather than a general hotel results page. Check the final total, breakfast, taxes, cancellation conditions and any deposit before paying.',
  howSecond:'If you need more options, use the Cappadocia accommodation search below the selection. The current offer is confirmed on Booking.com; this guide does not promise a fixed rate or available room. Arrange airport transport with your arriving flight number and your return flight number when booked.'
};
copy.push(
['Booking.com','Booking.com','Booking.com','Booking.com'],
[bookingGuideCopy.title,'Kapadokya Otel Rehberi: Karşılaştırabileceğiniz 12 Otel','Guía de hoteles de Capadocia: 12 alojamientos para comparar','卡帕多奇亚酒店指南：12 家精选住宿比较'],
[bookingGuideCopy.dek,'Sultan, Aza ve Kelebek ile başlayın; Göreme, Uçhisar ve Çavuşin’de öncelik verdiğimiz on iki oteli karşılaştırın.','Empieza por Sultan, Aza y Kelebek y compara nuestros doce hoteles preferidos en Göreme, Uçhisar y Çavuşin.','从 Sultan、Aza 和 Kelebek 开始，比较我们在格雷梅、乌奇希萨尔和恰武辛优先推荐的十二家酒店。'],
[bookingGuideCopy.intro,'Göreme’de Sultan Cave Suites, Aza Cave Hotel ve Kelebek Special Cave Hotel ile başlayın. On iki otellik seçkimiz, aşağıdaki sırayla Göreme’deki diğer tesisler ve Uçhisar ile Çavuşin seçenekleriyle devam ediyor. Tarihinizi, kişi sayısını, odayı ve iptal koşullarını karşılaştırmak için ilgili tesisin Booking.com sayfasını açın. Bu liste öncelik verdiğimiz otellerden oluşur; puana dayalı bir sıralama değildir ve her otelin her gezgine uygun olduğunu ileri sürmez.','Empieza en Göreme con Sultan Cave Suites, Aza Cave Hotel y Kelebek Special Cave Hotel. Nuestra selección de doce hoteles continúa en el orden que ves abajo, con otros alojamientos de Göreme y opciones en Uçhisar y Çavuşin. Abre la ficha de cada hotel en Booking.com para comparar fechas, huéspedes, habitaciones y cancelación. Es una selección de alojamientos preferidos, no una clasificación por puntuación ni una garantía de que todos encajen con cualquier viajero.','先看格雷梅的 Sultan Cave Suites、Aza Cave Hotel 和 Kelebek Special Cave Hotel。十二家精选酒店按下方顺序列出，还包括格雷梅其他住宿，以及乌奇希萨尔和恰武辛的选择。打开具体酒店的 Booking.com 页面，比较日期、人数、房型及取消条件。这是一份优先推荐名单，并非按评分排列，也不意味着每家酒店都适合所有旅客。'],
[bookingGuideCopy.goreme,'Göreme: Sultan, Aza ve Kelebek','Göreme: Sultan, Aza y Kelebek','格雷梅：Sultan、Aza 和 Kelebek'],
[bookingGuideCopy.more,'Göreme ve Çavuşin’de diğer seçenekler','Más opciones en Göreme y Çavuşin','格雷梅和恰武辛的其他选择'],
[bookingGuideCopy.moreFirst,'Göreme’de Artemis Cave Suites, Henna Hotel ve Aydınlı Cave Hotel ile devam edebilirsiniz; Cappadocia Cave Suites ve Carus Cappadocia da seçkimizde yer alıyor. Seçtiğiniz odayı ve kullanmak istediğiniz olanaklara erişimi karşılaştırın. Aza, Artemis ve Henna yetişkinlere yönelik konaklama koşulları belirtiyor; çocuklu bir seyahat planlamadan önce güncel asgari yaşı kontrol edin.','En Göreme, sigue con Artemis Cave Suites, Henna Hotel y Aydınlı Cave Hotel; Cappadocia Cave Suites y Carus Cappadocia también forman parte de la selección. Compara la habitación concreta y el acceso a los servicios que te interesan. Aza, Artemis y Henna indican políticas orientadas a adultos: comprueba la edad mínima vigente antes de organizar un viaje familiar.','在格雷梅还可以比较 Artemis Cave Suites、Henna Hotel 和 Aydınlı Cave Hotel；Cappadocia Cave Suites 与 Carus Cappadocia 也在名单内。请比较具体房型及所需设施的使用条件。Aza、Artemis 和 Henna 的房源信息标有面向成人的入住政策，家庭出游前应确认当前最低入住年龄。'],
[bookingGuideCopy.moreSecond,'Seki Cave Hotel, Çavuşin’dedir; Argos in Cappadocia içindeki Seki Restaurant’tan ayrı bir oteldir. Planladığınız yemek ve etkinliklere ulaşımı, araçtan indikten sonra odaya giden yolu da hesaba katın. Her tesiste pencere, havalandırma, merdivenler ve yatak düzenini ayrıca sorun.','Seki Cave Hotel está en Çavuşin y es un hotel distinto del restaurante Seki de Argos in Cappadocia. Comprueba los trayectos a las cenas y actividades, además del acceso desde donde te deja el vehículo hasta tu habitación. Pregunta siempre por ventanas, ventilación, escaleras y distribución de camas.','Seki Cave Hotel 位于恰武辛，与 Argos in Cappadocia 内的 Seki Restaurant 是不同场所。请确认前往餐厅和活动地点的交通，以及下车点到房间的路线。无论选择哪家酒店，都建议询问窗户、通风、台阶和实际床型。'],
[bookingGuideCopy.howFirst,'Aynı tarih ve kişi sayısı için her otelin Booking.com düğmesini kullanın. Kart, genel arama sonuçları yerine doğrudan ilgili tesisin sayfasını açar. Ödeme yapmadan önce son toplamı, kahvaltıyı, vergileri, iptal koşullarını ve varsa ön ödemeyi kontrol edin.','Usa el botón de Booking.com de cada hotel con las mismas fechas y número de huéspedes. La tarjeta abre ese alojamiento concreto, no una búsqueda general. Antes de pagar, revisa el total final, el desayuno, los impuestos, la cancelación y cualquier depósito.','用相同日期与人数点击各酒店的 Booking.com 按钮。卡片会打开对应酒店，而非普通搜索结果。付款前请核对最终总价、早餐、税费、取消政策和任何押金。'],
[bookingGuideCopy.howSecond,'Daha fazla seçenek için seçkinin altındaki Kapadokya konaklama aramasını kullanın. Güncel teklif Booking.com’da kesinleşir; bu rehber sabit fiyat veya boş oda sözü vermez. Havalimanı transferini geliş uçuş numaranızla, dönüş biletiniz varsa onun uçuş numarasıyla birlikte planlayın.','Si necesitas más opciones, usa el buscador de alojamiento en Capadocia que aparece debajo de la selección. La oferta vigente se confirma en Booking.com; esta guía no promete un precio fijo ni disponibilidad. Organiza el traslado con el número de tu vuelo de llegada y también el de regreso cuando lo tengas reservado.','如需更多选择，可使用名单下方的卡帕多奇亚住宿搜索。当前报价以 Booking.com 为准，本指南不承诺固定价格或空房。安排机场接送时，请提供抵达航班号；返程已预订的话，也提供返程航班号。']
);
export const bookingTranslations = Object.fromEntries(['tr','es','zh'].map((lang,index) => [lang,Object.fromEntries(copy.map(row=>[row[0],row[index+1]]))]));
for (const lang of ['tr','es','zh']) for (const hotel of bookingHotels) {
  bookingTranslations[lang][hotel.name]=hotel.name;
  bookingTranslations[lang][hotel.area]=hotel.area;
  bookingTranslations[lang][hotel.name+': Booking.com property page']=hotel.name+({tr:': Booking.com tesis sayfası',es:': ficha en Booking.com',zh:'：Booking.com 酒店页面'})[lang];
  bookingTranslations[lang]['{0}'+hotel.name+': Booking.com property page{/0}']='{0}'+bookingTranslations[lang][hotel.name+': Booking.com property page']+'{/0}';
}
for (const lang of ['tr','es','zh']) {
  const dictionary=bookingTranslations[lang],title=dictionary[bookingGuideCopy.title];
  dictionary.Language=({tr:'Dil',es:'Idioma',zh:'语言'})[lang];
  dictionary['Read '+bookingGuideCopy.title]=({tr:'Rehberi oku: ',es:'Leer: ',zh:'阅读：'})[lang]+title;
  dictionary['{0}'+bookingGuideCopy.title+'{/0}']='{0}'+title+'{/0}';
  dictionary[': '+bookingGuideCopy.title]=': '+title;
  dictionary[bookingGuideCopy.title+' | CappadociaBlog']=title+' | CappadociaBlog';
  dictionary['Illustrated Cappadocia field note for '+bookingGuideCopy.title]=({tr:'Kapadokya çizimli gezi notu: ',es:'Nota ilustrada de Capadocia: ',zh:'卡帕多奇亚插图旅行笔记：'})[lang]+title;
}
