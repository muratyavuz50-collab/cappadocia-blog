export const transportChecked = '2026-10-07';
export const winterSource = 'https://static.sunexpress.com/media/3bmmupmk/sunexpress_flight_connections_w2627_cw49-1.pdf';
export const summerSource = 'https://static.sunexpress.com/media/wn1lmfyn/sxs-flightplan-s26-27nov_0126.pdf';
// Regional market shortlist supplied for flight planning; not a visitor ranking.
export const marketEvidence = {
  note:'An alphabetical flight-planning shortlist based on regional accommodation research supplied for editorial planning; it is not a visitor ranking, and no visitor totals or shares are published.'
};
// Mon=0. These are Europe -> Kayseri rows, visually checked in the primary PDF.
// Published seasonal references are never interpreted as bookable inventory.
export const directRoutes = [
  {city:'Düsseldorf',code:'DUS',country:'Germany',days:[0,2,4]},
  {city:'Frankfurt',code:'FRA',country:'Germany',days:[2]},
  {city:'Munich',code:'MUC',country:'Germany',days:[5]},
  {city:'Stuttgart',code:'STR',country:'Germany',days:[3,6]},
  {city:'Amsterdam',code:'AMS',country:'Netherlands',days:[2,6]},
  {city:'Rotterdam',code:'RTM',country:'Netherlands',days:[3]},
  ...[['Berlin','BER','Germany'],['Cologne/Bonn','CGN','Germany'],['Hanover','HAJ','Germany'],['Brussels','BRU','Belgium'],['Vienna','VIE','Austria'],['Copenhagen','CPH','Denmark'],['Basel/Mulhouse','BSL','Switzerland / France'],['Geneva','GVA','Switzerland'],['London Stansted','STN','United Kingdom']].map(([city,code,country])=>({city,code,country,days:null}))
];
const market=(country,origin,originCode,city,note='Compare a single ticket via Istanbul IST to Kayseri ASR or Nevşehir NAV.')=>({country,origin,originCode,city,note,source:`https://www.turkishairlines.com/en/flights-from-${city}-to-istanbul`});
export const visitorMarkets = [
  market('Brazil','São Paulo GRU','GRU','sao-paulo'),
  market('Canada','Toronto YYZ','YYZ','toronto'),
  market('China','Beijing PEK','PEK','beijing'),
  market('Germany','Frankfurt FRA','FRA','frankfurt','Compare a direct flight to ASR with an IST connection; other German departure airports appear above.'),
  market('Hong Kong SAR','Hong Kong HKG','HKG','hong-kong'),
  market('India','Delhi DEL','DEL','delhi'),
  market('Indonesia','Jakarta CGK','CGK','jakarta'),
  market('Italy','Rome FCO','FCO','rome'),
  market('Japan','Tokyo (check NRT / HND)','TYO','tokyo'),
  market('Malaysia','Kuala Lumpur KUL','KUL','kuala-lumpur'),
  market('Philippines','Manila MNL','MNL','manila'),
  market('Russia','Moscow (choose the exact airport)','MOW','moscow'),
  market('Singapore','Singapore SIN','SIN','singapore'),
  market('South Korea','Seoul Incheon ICN','ICN','seoul'),
  market('Spain','Madrid MAD','MAD','madrid'),
  market('Taiwan','Taipei TPE','TPE','taipei'),
  market('Thailand','Bangkok BKK','BKK','bangkok'),
  market('United Kingdom','London (check LHR / LGW)','LON','london','Compare same-airport IST connections with seasonal Stansted–ASR service. London airports are separate.'),
  market('United States','New York JFK','JFK','new-york'),
  market('Vietnam','Hanoi HAN','HAN','hanoi')
];
export const domesticRoutes = [
  {from:'Istanbul Airport IST',to:'Kayseri ASR',carrier:'Turkish Airlines',url:'https://www.turkishairlines.com/en-tr/flights-from-istanbul-to-kayseri'},
  {from:'Istanbul Airport IST',to:'Nevşehir NAV',carrier:'Turkish Airlines',url:'https://www.turkishairlines.com/en/flights-from-istanbul-to-nevsehir'},
  {from:'Sabiha Gökçen SAW',to:'Kayseri ASR',carrier:'Pegasus',url:'https://www.flypgs.com/sehirler/istanbul-kayseri-ucak-bileti'},
  {from:'Sabiha Gökçen SAW',to:'Nevşehir NAV',carrier:'AJet',url:'https://ajet.com/en/flights-from-istanbul-to-nevsehir'}
];
export function flightSearch(origin,airport,arrival='',departure='') {
  const destination=airport==='NAV'?'Nevsehir NAV':'Kayseri ASR';
  const query=`Flights from ${String(origin).slice(0,100)} to ${destination}${arrival?` departing ${arrival}`:''}${departure?` returning ${departure}`:''}`;
  return 'https://www.google.com/travel/flights?hl=en&q='+encodeURIComponent(query);
}
export function winterReferenceApplies(date) {const month=String(date).slice(0,7);return /^\d{4}-\d{2}$/.test(month)&&month>='2026-10'&&month<='2027-03';}
