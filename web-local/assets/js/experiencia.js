// experiencia.js — Experiencia compacta (2 columnas) local-first
(function(){
  const D = window.SITE_DATA || {};
  const itemsRaw = Array.isArray(D.experience) ? D.experience : [];

  function escapeHtml(s){
    return String(s??'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  }

  function sortKey(dates){
    const s = String(dates||'').toLowerCase();
    if (s.includes('actualidad') || s.includes('presente')) return 9999;
    const years = (String(dates||'').match(/\b\d{4}\b/g) || []).map(n=>parseInt(n,10)).filter(n=>n>0);
    return years.length ? Math.max.apply(null, years) : 0;
  }

  function splitDates(d){
    const s = String(d||'').replace(/\s+/g,' ').trim();
    const parts = s.split('–');
    if (parts.length === 1){
      const parts2 = s.split('-');
      if (parts2.length >= 2) return [parts2[0].trim(), parts2.slice(1).join('-').trim()];
      return [s, ''];
    }
    return [parts[0].trim(), parts.slice(1).join('–').trim()];
  }

  function getHost(){
    return document.getElementById('experience')
      || document.getElementById('experienceTimeline')
      || document.getElementById('experienceTree')
      || document.getElementById('experienceList');
  }

  function render(){
    const host = getHost();
    if (!host) return;

    const items = itemsRaw.slice().sort((a,b)=>sortKey(b.dates)-sortKey(a.dates));

    if (!items.length){
      host.innerHTML = `<div class="card"><h2>Experiencia</h2><p>No se han podido cargar entradas de experiencia.</p></div>`;
      return;
    }

    host.innerHTML = items.map(e=>{
      const [d1,d2] = splitDates(e.dates||'');
      const chips = (e.chips||[]).map(c=>`<span class="xp-chip">${escapeHtml(c)}</span>`).join('');
      return `
        <div class="xp-row">
          <div class="xp-datecol">
            <div class="xp-date1">${escapeHtml(d1)}</div>
            <div class="xp-date2">${escapeHtml(d2)}</div>
          </div>
          <div class="xp-infocol">
            <div class="xp-role">${escapeHtml(e.role||'')}</div>
            <div class="xp-company">${escapeHtml(e.company||'')}</div>
            <div class="xp-summary">${escapeHtml(e.summary||'')}</div>
            ${chips ? `<div class="xp-chips">${chips}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', render);
})();