import { faqGroups, faqCount, faqReviewed, faqSources } from "./faq-data.mjs";

const escape = (value) => String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
function question(item, prefix = "") {
  const source = faqSources[item.source];
  const sourceLink = source ? `<p class="faq-source">Source: <a href="${escape(source.url)}" target="_blank" rel="${["turquaz","discovery"].includes(item.source) ? "sponsored " : ""}noopener">${escape(source.label)}</a></p>` : "";
  return `<details class="faq-item" id="${prefix}${item.id}" data-faq-accordion><summary>${escape(item.question)}</summary><div class="faq-answer"><p>${escape(item.answer)}</p>${sourceLink}</div></details>`;
}

export function faqPage() {
  return `<section class="page-hero faq-hero"><div class="shell"><span class="eyebrow">Cappadocia FAQ</span><h1>Your questions.<br>Clear answers.</h1><p>${faqCount} questions about planning, balloons, stays, transport and life in Cappadocia. Choose a topic, then click a question to open its answer.</p><div class="faq-meta"><span>25 topics</span><span>${faqCount} answers</span><span>Reviewed ${faqReviewed}</span></div></div></section><div class="shell faq-directory"><nav class="faq-topic-index" aria-label="FAQ topics"><h2>Find your topic</h2><div>${faqGroups.map((group,index)=>`<a href="#topic-${group.id}"><span>${String(index+1).padStart(2,"0")}</span>${escape(group.title)}</a>`).join("")}</div></nav><div class="faq-content">${faqGroups.map((group,index)=>`<section class="faq-topic" id="topic-${group.id}" aria-labelledby="heading-${group.id}"><div class="faq-topic-heading"><span>${String(index+1).padStart(2,"0")}</span><div><p>20 questions</p><h2 id="heading-${group.id}">${escape(group.title)}</h2></div><a href="#main">Back to topics</a></div><div class="faq-list">${group.items.map((item)=>question(item)).join("")}</div></section>`).join("")}</div><aside class="faq-editorial-note"><h2>About these answers</h2><p>Destination facts link to primary sources where relevant. Practical planning suggestions are our editorial guidance. Check current prices, opening hours, access and booking conditions with the official site or provider before travelling.</p></aside></div>`;
}

export function faqPreview() {
  const chosen = [faqGroups[2].items[0],faqGroups[4].items[0],faqGroups[7].items[3],faqGroups[8].items[5],faqGroups[11].items[7],faqGroups[24].items[6]];
  return `<section class="section shell faq-preview"><div class="section-heading"><div><span class="eyebrow">Cappadocia FAQ</span><h2>A few answers before you go.</h2></div><a class="section-link" href="/faq/">Explore all ${faqCount} questions</a></div><div class="faq-preview-grid"><div><p class="faq-preview-intro">From airport pickups to sunrise flights, find the details that help your trip run smoothly.</p><a class="button button-green" href="/faq/">Open the FAQ</a></div><div class="faq-list">${chosen.map((item)=>question(item,"home-")).join("")}</div></div></section>`;
}
