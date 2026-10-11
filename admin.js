(() => {
  const data = JSON.parse(document.getElementById('cms-data')?.textContent || '{}');
  const token = document.querySelector('meta[name="csrf-token"]')?.content;
  const $ = (selector) => document.querySelector(selector);
  const escape = (value = '') => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  async function api(path, options = {}) {
    const response = await fetch(path, {credentials:'same-origin',...options,headers:{'content-type':'application/json','x-csrf-token':token,...options.headers}});
    let result;
    try { result = await response.json(); } catch { throw new Error('İstek tamamlanamadı. Lütfen yeniden deneyin.'); }
    if (!response.ok) throw new Error(result.error || 'İşlem başarısız.');
    return result;
  }
  function notice(message, error = false) {
    const box=$('#notice');
    box.textContent=message;box.hidden=false;box.classList.toggle('error',error);
    clearTimeout(notice.timeout);notice.timeout=setTimeout(()=>{box.hidden=true;},6000);
  }
  const date=(value)=>new Date(value).toLocaleString('tr-TR',{dateStyle:'medium',timeStyle:'short'});

  if(data.type!=='admin')return;
  if(data.view==='seo'){
    api('/api/admin/seo').then(({report,settings,origin,sitemap,publishedArticles,topicCount,businessShortlist,domainStatus})=>{
      $('#seo-status').textContent=`30 günlük rapor · ${date(report.updatedAt)} itibarıyla`;
      $('#seo-views').textContent=report.pageviews;$('#seo-search').textContent=report.searchReferrals;$('#seo-clicks').textContent=report.clicks;
      $('#seo-pages').innerHTML=report.pages.length?report.pages.map(p=>`<tr><td><a href="${escape(p.path)}" target="_blank" rel="noopener">${escape(p.path)}</a></td><td>${p.views}</td><td>${p.search}</td><td>${p.clicks}</td></tr>`).join(''):'<tr><td colspan="4">Henüz ölçüm verisi yok. Okuyucu ziyaretlerinden sonra gerçek sonuçlar burada görünür.</td></tr>';
      const bands={'good':'İyi','needs-improvement':'İyileştirme gerekiyor','poor':'Zayıf'};
      $('#seo-vitals').innerHTML=report.vitals.map(v=>`<div><h3>${v.metric}</h3><p>${v.total?`${v.total} örnek · p75 aralığı: ${bands[v.p75Band]}`:'Henüz yeterli örnek yok.'}</p></div>`).join('');
      $('#seo-publication').textContent=`${publishedArticles} yayındaki yazı · ${topicCount} konu merkezi · Okuyucu sayfaları girişsiz · Yönetim ve taslaklar korumalı`;
      $('#seo-origin').textContent=`Google'a bildirilen ana adres: ${origin} · Domain durumu: ${domainStatus==='active'?'Aktif':'DNS bekliyor'}`;
      $('#seo-sitemap').href=sitemap;
      $('#verification-form').elements.googleVerification.value=settings.googleVerification||'';
      $('#business-method').textContent=`Araştırma: ${businessShortlist.date}. Doğrulanmış işletme sayfaları ve bağımsız rehber kayıtlarına dayalı içerik adayları; Google sıralaması ölçülmedi.`;
      $('#business-rows').innerHTML=[...businessShortlist.hotels,...businessShortlist.restaurants].map(b=>`<tr><td><a href="${escape(b.url)}" target="_blank" rel="noopener">${escape(b.name)}</a></td><td>${escape(b.area)}</td><td>${escape(b.evidence||b.distinction)}<small>${escape(b.angle)}</small></td></tr>`).join('');
    }).catch(error=>{$('#seo-status').textContent='Rapor yüklenemedi. Sayfayı yeniden açın.';notice(error.message,true);});
    $('#verification-form').addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget,button=form.querySelector('button');button.disabled=true;try{await api('/api/admin/seo',{method:'PUT',body:JSON.stringify({googleVerification:form.elements.googleVerification.value})});$('#verification-message').textContent='Doğrulama meta etiketi kaydedildi. Şimdi Search Console’da Doğrula düğmesini kullanın.';}catch(error){$('#verification-message').textContent=error.message;}finally{button.disabled=false;}});
    return;
  }
  if(data.view==='members'){
    api('/api/admin/members').then(({members,total})=>{
      $('#member-total').textContent=`(${total})`;
      $('#member-rows').innerHTML=members.length?members.map((m)=>`<tr><td>${escape(m.name)}</td><td>${escape(m.email)}</td><td>${date(m.joined_at)}</td></tr>`).join(''):'<tr><td colspan="3">Henüz üye yok. Üyelik sayfasından isteğe bağlı kayıtlar alınır.</td></tr>';
    }).catch((error)=>{$('#member-rows').innerHTML='<tr><td colspan="3">Üyeler yüklenemedi. Sayfayı yeniden açın.</td></tr>';notice(error.message,true);});
    return;
  }
  if(data.view!=='articles')return;
  let articles=[];
  let current=null;
  let revision=0;
  let status='draft';
  let dirty=false;
  let savedSlug=null;
  let busy=false;
  const form=$('#article-form');
  const markDirty=()=>{dirty=true;$('#save-message').textContent='Kaydedilmemiş değişiklikler var.';};
  form.addEventListener('input',markDirty);
  window.addEventListener('beforeunload',(event)=>{if(dirty){event.preventDefault();event.returnValue='';}});

  function renderList(){
    const query=($('#admin-search').value || '').toLocaleLowerCase('tr');
    const filter=$('#status-filter').value;
    const list=articles.filter((a)=>(`${a.title} ${a.category}`.toLocaleLowerCase('tr').includes(query)) && (filter==='all'||(filter==='changes'?a.hasDraft:a.status===filter)));
    $('#stat-total').textContent=articles.length;
    $('#stat-published').textContent=articles.filter((a)=>a.status==='published').length;
    $('#stat-drafts').textContent=articles.filter((a)=>a.status==='draft'||a.hasDraft).length;
    $('#article-rows').innerHTML=list.length?list.map((a)=>`<tr><td><strong>${escape(a.title)}</strong><small>${escape(a.category)}${a.featured?' · Öne çıkan':''}</small></td><td><span class="status-pill ${a.status==='published'?'live':''}">${a.status==='published'?'Yayında':'Taslak'}</span>${a.hasDraft && a.status==='published'?'<small class="unsaved-label">Yeni taslak var</small>':''}</td><td>${date(a.updatedAt)}</td><td><button class="btn secondary small" type="button" data-edit="${escape(a.slug)}">Düzenle</button></td></tr>`).join(''):'<tr><td colspan="4">Bu filtrede yazı bulunamadı.</td></tr>';
  }
  async function loadList(){
    try{articles=(await api('/api/admin/articles')).articles;renderList();$('#retry-list').hidden=true;}
    catch(error){$('#article-rows').innerHTML='<tr><td colspan="4">Yazı listesi yüklenemedi. Kaydınız değişmedi.</td></tr>';$('#retry-list').hidden=false;notice(error.message,true);}
  }
  $('#admin-search').addEventListener('input',renderList);
  $('#status-filter').addEventListener('change',renderList);
  $('#retry-list').addEventListener('click',loadList);

  function addSection(section={heading:'',paragraphs:[''],list:[]}){
    const element=document.createElement('section');element.className='section-editor';
    element.innerHTML=`<div class="section-title"><strong>Bölüm</strong><div><button class="section-move" type="button" data-direction="-1" aria-label="Bölümü yukarı taşı">Yukarı</button><button class="section-move" type="button" data-direction="1" aria-label="Bölümü aşağı taşı">Aşağı</button><button class="section-remove" type="button">Kaldır</button></div></div><label>Bölüm başlığı<input data-field="heading" value="${escape(section.heading)}" maxlength="220" required></label><label>Paragraflar<textarea data-field="paragraphs" rows="7" required>${escape(section.paragraphs.join('\n\n'))}</textarea><small>Yeni paragraf için arada boş satır bırakın. HTML koduna gerek yok.</small></label><label>Madde listesi (isteğe bağlı)<textarea data-field="list" rows="3">${escape((section.list || []).join('\n'))}</textarea><small>Her satır bir madde olur.</small></label>`;
    $('#sections').append(element);
  }
  $('#add-section').addEventListener('click',()=>{addSection();markDirty();});
  $('#sections').addEventListener('click',(event)=>{
    const section=event.target.closest('.section-editor');if(!section)return;
    if(event.target.closest('.section-remove')){if($('#sections').children.length===1){notice('En az bir bölüm kalmalı.',true);return;}if(confirm('Bu bölümü taslaktan kaldırmak istiyor musunuz?')){section.remove();markDirty();}}
    const move=event.target.closest('.section-move');
    if(move){if(move.dataset.direction==='-1'&&section.previousElementSibling)section.previousElementSibling.before(section);if(move.dataset.direction==='1'&&section.nextElementSibling)section.nextElementSibling.after(section);markDirty();}
  });

  function applyEditor(article,meta={}){
    current=article;revision=meta.revision || 0;status=meta.status || 'draft';savedSlug=meta.isNew?null:article.slug;
    form.reset();
    for(const field of ['title','dek','intro','slug','category','readTime','cmp','seoTitle','metaDescription'])form.elements[field].value=article[field] || (field==='readTime'?5:'');
    form.elements.slug.readOnly=!meta.isNew;
    form.elements.featured.checked=Boolean(article.featured);
    form.elements.faqText.value=(article.faq || []).map((pair)=>pair.join(' | ')).join('\n');
    $('#sections').innerHTML='';article.sections.forEach(addSection);
    $('#editor-heading').textContent=meta.isNew?'Yeni yazı':'Yazıyı düzenle';
    $('#editor-status').textContent=status==='published'?(meta.hasDraft?'Yayında · yeni taslak var':'Yayında'):'Taslak';
    $('#editor-status').classList.toggle('live',status==='published');
    $('#unpublish').hidden=status!=='published';
    $('#revision-history').innerHTML=(meta.history || []).map((item)=>`<li><strong>v${item.revision} · ${item.action==='publish'?'Yayınlandı':item.action==='unpublish'?'Yayından kaldırıldı':'Taslak kaydedildi'}</strong><small>${date(item.saved_at)}</small></li>`).join('') || '<li>Henüz yeni bir kayıt yok.</li>';
    $('#preview-link').href=savedSlug?`/admin/preview/${savedSlug}/`:'/admin/';
    $('#preview-link').setAttribute('aria-disabled',String(!savedSlug));
    $('#save-message').textContent=meta.isNew?'Henüz kaydedilmedi.':'Kaydedilmiş sürüm açık.';
    $('#article-list-view').hidden=true;$('#editor-view').hidden=false;dirty=false;
    form.elements.title.focus();
  }
  async function edit(slug){
    if(dirty&&!confirm('Kaydedilmemiş değişikliklerden çıkılsın mı?'))return;
    try{const record=await api(`/api/admin/articles/${encodeURIComponent(slug)}`);applyEditor(record.article,record);history.replaceState(null,'',`/admin/?edit=${encodeURIComponent(slug)}`);}catch(error){notice(error.message,true);}
  }
  $('#article-rows').addEventListener('click',(event)=>{const button=event.target.closest('[data-edit]');if(button)edit(button.dataset.edit);});
  $('#new-article').addEventListener('click',()=>{
    if(dirty&&!confirm('Kaydedilmemiş değişikliklerden çıkılsın mı?'))return;
    applyEditor({title:'',dek:'',intro:'',slug:'',category:data.categories[0]||'',readTime:5,cmp:'',sections:[{heading:'',paragraphs:[''],list:[]}]},{isNew:true});
  });
  $('#back-to-list').addEventListener('click',()=>{
    if(dirty&&!confirm('Kaydedilmemiş değişikliklerden çıkılsın mı?'))return;
    dirty=false;$('#editor-view').hidden=true;$('#article-list-view').hidden=false;history.replaceState(null,'','/admin/');loadList();
  });
  $('#preview-link').addEventListener('click',(event)=>{if(!savedSlug){event.preventDefault();notice('Önizleme için önce taslağı kaydedin.');}else if(dirty){event.preventDefault();notice('Son değişiklikleri önizlemek için önce taslağı kaydedin.');}});
  function collect(){
    return {slug:form.elements.slug.value.trim(),title:form.elements.title.value,dek:form.elements.dek.value,intro:form.elements.intro.value,seoTitle:form.elements.seoTitle.value,metaDescription:form.elements.metaDescription.value,
      category:form.elements.category.value,readTime:Number(form.elements.readTime.value),featured:form.elements.featured.checked,cmp:form.elements.cmp.value,
      sections:[...document.querySelectorAll('.section-editor')].map((element)=>({heading:element.querySelector('[data-field="heading"]').value,
        paragraphs:element.querySelector('[data-field="paragraphs"]').value.split(/\n\s*\n/).map((p)=>p.trim()).filter(Boolean),
        list:element.querySelector('[data-field="list"]').value.split('\n').map((p)=>p.trim()).filter(Boolean)})),
      faq:form.elements.faqText.value.split('\n').filter((line)=>line.trim()).map((line)=>{const position=line.indexOf('|');if(position<1)throw new Error('Sık sorulan sorularda “Soru | Cevap” biçimini kullanın.');return[line.slice(0,position).trim(),line.slice(position+1).trim()];})};
  }
  async function save(action){
    if(busy || !form.reportValidity())return;
    let article;try{article=collect();}catch(error){notice(error.message,true);return;}
    if(!savedSlug && articles.some((a)=>a.slug===article.slug)){notice('Bu yazı adresi zaten kullanılıyor. Başka bir adres seçin.',true);return;}
    busy=true;const buttons=[...form.querySelectorAll('button')];buttons.forEach((button)=>{button.disabled=true;});
    $('#save-message').textContent='Kaydediliyor…';
    try{
      const result=await api(`/api/admin/articles/${encodeURIComponent(article.slug)}`,{method:'PUT',body:JSON.stringify({article,revision,action})});
      savedSlug=article.slug;revision=result.revision;status=result.status;dirty=false;current=article;
      form.elements.slug.readOnly=true;
      $('#preview-link').href=`/admin/preview/${savedSlug}/`;$('#preview-link').setAttribute('aria-disabled','false');
      $('#unpublish').hidden=status!=='published';
      $('#editor-status').textContent=status==='published'?(result.hasDraft?'Yayında · yeni taslak var':'Yayında'):'Taslak';
      $('#editor-status').classList.toggle('live',status==='published');
      const message=action==='publish'?'Yeni sürüm yayınlandı.':action==='unpublish'?'Yazı yayından kaldırıldı; taslak korundu.':'Taslak kalıcı olarak kaydedildi. Yayındaki sürüm değişmedi.';
      $('#save-message').textContent=`${message} · ${date(result.updatedAt)}`;notice(message);
      history.replaceState(null,'',`/admin/?edit=${encodeURIComponent(savedSlug)}`);
      await loadList();
    }catch(error){$('#save-message').textContent=`Kayıt yapılamadı: ${error.message} Metniniz ekranda korunuyor.`;notice(error.message,true);}
    finally{busy=false;buttons.forEach((button)=>{button.disabled=false;});}
  }
  form.addEventListener('submit',(event)=>{event.preventDefault();save(event.submitter?.dataset.action || 'draft');});
  $('#unpublish').addEventListener('click',()=>{if(confirm('Bu yazı okuyuculara kapatılsın mı? Taslak ve kayıt geçmişi korunur.'))save('unpublish');});
  loadList().then(()=>{const slug=new URLSearchParams(location.search).get('edit');if(slug)edit(slug);});
})();
