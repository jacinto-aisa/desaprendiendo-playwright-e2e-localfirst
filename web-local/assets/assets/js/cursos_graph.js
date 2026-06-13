// cursos_graph.js — Local-first, sin dependencias externas
// - Mantiene el listado y KPIs (ediciones/títulos/horas)
// - Sustituye la nube de tags por un "bubble map" (círculos) cuyo área depende de apariciones
// - Click para seleccionar tags; ♻ reinicia

(function(){
  const D = window.SITE_DATA || {};
  const allCourses = Array.isArray(D.courses) ? D.courses : [];

  const $$ = (s, el=document)=>Array.from(el.querySelectorAll(s));

  function esc(s){
    return String(s ?? '').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  }
  function num(v){
    if (v === null || v === undefined) return 0;
    const n = parseFloat(String(v).trim().replace(',','.'));
    return (isFinite(n) ? n : 0);
  }

  // Horas por edición (compatibilidad con posibles nombres alternativos)
  function hoursOf(c){
    return num(
      c?.hours_per_edition ??
      c?.hoursPerEdition ??
      c?.hours_per_title ??
      c?.hours ??
      c?.duration_hours ??
      c?.durationHours ??
      0
    );
  }
  function fmtInt(n){
    try { return new Intl.NumberFormat('es-ES').format(Math.round(n)); }
    catch(_e){ return String(Math.round(n)); }
  }
  function norm(s){
    s = String(s||'').trim().toLowerCase();
    try { s = s.normalize('NFD').replace(/[\u0300-\u036f]/g,''); } catch(_e){}
    s = s.replace(/\s+/g,' ');
    return s;
  }

  function pushHistory(){
    historyStack.push({
      selected: Array.from(selected.entries()),
      stage,
      selectedDomainKey,
      selectedDomainLabel,
      selectedTechKey,
      selectedTechLabel,
      visibleCategory
    });
    if(historyStack.length > 60) historyStack.shift();
  }
  function restoreHistory(){
    if(historyStack.length === 0) return false;
    const prev = historyStack.pop();
    selected.clear();
    for(const [k,v] of (prev.selected || [])) selected.set(k,v);
    stage = (typeof prev.stage === 'number') ? prev.stage : 0;
    selectedDomainKey = prev.selectedDomainKey || null;
    selectedDomainLabel = prev.selectedDomainLabel || null;
    selectedTechKey = prev.selectedTechKey || null;
    selectedTechLabel = prev.selectedTechLabel || null;
    visibleCategory = prev.visibleCategory || 'all';
    setSelectedDomainUI();
    return true;
  }


  // ===== Normalización y categorización (data-driven desde data.js) =====
// Categorías fijas (sin "Enfoque"): Tecnología, Dominio, Nivel, Rol, Cliente
// Se leen desde:
// - SITE_DATA.tagCatalog (cat -> [tags]) (opcional, para enriquecer)
// - course.tagsByType (cat -> [tags]) (principal)
// Back-compat: course.tags (lista plana) y course.type (tag legacy)
//
// Internamente, usamos claves cortas: tech/domain/level/role/client

function canonCatKey(s){
  return norm(String(s||''))
    .replace(/\./g,'')
    .replace(/\s+/g,' ')
    .trim();
}
function toInternalCat(catKey){
  const k = canonCatKey(catKey);
  if(k === 'tecnologia') return 'tech';
  if(k === 'dominio') return 'domain';
  if(k === 'nivel') return 'level';
  if(k === 'rol') return 'role';
  if(k === 'cliente') return 'client';
  return 'tech';
}
function catLabelSimple(cat){
  switch(cat){
    case 'tech': return 'Tecnología';
    case 'domain': return 'Dominio';
    case 'level': return 'Nivel';
    case 'role': return 'Rol';
    case 'client': return 'Cliente';
    default: return String(cat||'');
  }
}

// Catalogo global tag -> cat (solo para clasificar legacy; NO genera burbujas)
const tagToCat = new Map(); // norm(tag) -> internal cat
(function buildTagCatalog(){
  // Aprende EXCLUSIVAMENTE desde tagsByType reales presentes en cursos (data-driven)
  for(const c of allCourses){
    const byType = (c && typeof c.tagsByType === 'object') ? c.tagsByType : null;
    if(byType){
      for(const [catKey, tags] of Object.entries(byType)){
        const cat = toInternalCat(catKey);
        if(!Array.isArray(tags)) continue;
        for(const t of tags){
          const lbl = String(t||'').trim();
          if(!lbl) continue;
          const k = norm(lbl);
          if(!tagToCat.has(k)) tagToCat.set(k, cat);
        }
      }
    }
    // Cliente legacy (solo si el curso NO tiene tagsByType.Cliente)
    if(c?.client){
      const k = norm(String(c.client));
      if(!tagToCat.has(k)) tagToCat.set(k, 'client');
    }
  }
})();

function courseTags(course){
  const items = [];
  const seen = new Set(); // norm tag

  const push = (tag, catKey)=>{
    const lbl = String(tag||'').trim();
    if(!lbl) return;
    const key = norm(lbl);
    if(!key || seen.has(key)) return;
    seen.add(key);

    const cat = catKey ? toInternalCat(catKey) : (tagToCat.get(key) || 'tech');
    items.push({ tag: lbl, cat });
  };

  const byType = (course && typeof course.tagsByType === 'object') ? course.tagsByType : null;

  if(byType){
    // MODO ESTRICTO (como WinForms): SOLO tagsByType
    for(const [catKey, tags] of Object.entries(byType)){
      if(!Array.isArray(tags)) continue;
      for(const t of tags) push(t, catKey);
    }
    // Cliente legacy solo si NO viene ya en tagsByType
    const hasClient = Object.keys(byType).some(k => toInternalCat(k) === 'client');
    if(!hasClient && course?.client) push(String(course.client), 'Cliente');
  }else{
    // Fallback legacy SOLO si no hay tagsByType
    if(Array.isArray(course?.tags)){
      for(const t of course.tags) push(t, null);
    }
    if(course?.type) push(String(course.type), null);
    if(course?.client) push(String(course.client), 'Cliente');
  }

  // Orden estable por categoría y label
  const order = { tech:0, domain:1, level:2, role:3, client:4 };
  items.sort((a,b)=>{
    const ia = order[a.cat] ?? 99;
    const ib = order[b.cat] ?? 99;
    if(ia !== ib) return ia - ib;
    return a.tag.localeCompare(b.tag,'es',{sensitivity:'base'});
  });

  return items;
}

// Precompute per-course tag sets
const courseTagMap = new Map(); // course -> {set, items}
for(const c of allCourses){
  const items = courseTags(c);
  const set = new Set(items.map(x=>norm(x.tag)));
  courseTagMap.set(c, { items, set });
}

  // ===== UI refs =====
  const elSvg = document.getElementById('bubbleSvg');
  const elHost = document.getElementById('bubbleHost');
  const elGroupsHost = document.getElementById('courseGroups');
  const elSel = document.getElementById('selectedTags');
  const elReset = document.getElementById('resetAll');
    const elUndo  = document.getElementById('undoStep');
  const elMetaText = document.getElementById('bubbleMetaText');
  const elMetaDot  = document.getElementById('bubbleMetaDot');
const elKpiEditions = document.getElementById('kpiEditions');


  function setMeta(cat, tag){
    const c = cat || 'tech';
    if(elMetaDot){
      elMetaDot.style.background = (typeof catColor === 'function') ? catColor(c) : 'rgba(255,255,255,.45)';
    }
    if(elMetaText){
      const lbl = catLabelSimple(c).toLowerCase();
      elMetaText.textContent = tag ? `${lbl} · ${tag}` : lbl;
    }
  }


  const elKpiDistinct = document.getElementById('kpiDistinct');
  const elKpiHours = document.getElementById('kpiHours');
  const elSelectedCourses = document.getElementById('selectedCourses');

  const categoryChips = $$('.chip[data-cat]');

  let visibleCategory = 'all';
  // Nuevo flujo por fases:
  // - Inicio / Reiniciar: SOLO burbujas de Dominio
  // - Al elegir un Dominio: SOLO se piden Tecnologías (del dominio seleccionado)
  // - Al elegir una Tecnología: aparecen el resto de categorías (Nivel/Rol/Cliente) y
  //   se mantienen visibles (Dominio no vuelve; se muestra arriba como texto fijo).
  let stage = 0; // 0: elegir Dominio, 1: elegir Tecnología, 2: todo visible
  let orderMode = 'domain-tech'; // 'domain-tech' (por defecto) o 'tech-domain'
  let showClients = true; // 'domain-tech' (por defecto) o 'tech-domain'
  let selectedDomainKey = null;
  let selectedDomainLabel = null;
  let selectedTechKey = null;
  let selectedTechLabel = null;
  const selected = new Map(); 
  const historyStack = [];
// key(norm tag) -> {tag,cat}

  const elSelectedDomainBar = document.getElementById('selectedDomainBar');
  const elSelectedDomainText = document.getElementById('selectedDomainText');

  const elOrderModeToggle = document.getElementById('orderModeToggle');
  const elToggleClients = document.getElementById('toggleClients');

  function primaryCat(){ return (orderMode === 'domain-tech') ? 'domain' : 'tech'; }
  function secondaryCat(){ return (orderMode === 'domain-tech') ? 'tech' : 'domain'; }

  function setOrderUI(){
    if(!elOrderModeToggle) return;
    const isDT = (orderMode === 'domain-tech');
    elOrderModeToggle.textContent = isDT ? 'Dominio → Tecnología' : 'Tecnología → Dominio';
    elOrderModeToggle.setAttribute('aria-pressed', isDT ? 'true' : 'false');
    elOrderModeToggle.classList.toggle('is-on', true);
  }

  function setSelectedDomainUI(){
    if(!elSelectedDomainBar) return;

    // La selección ya se muestra en el bloque de seleccionados, no dentro del canvas.
    elSelectedDomainBar.hidden = true;
    if(elSelectedDomainText) elSelectedDomainText.textContent = '';
  }

  // ===== KPI anim =====
  function animateInt(el, to, suffix=''){
    if(!el) return;
    const from = parseInt(String(el.getAttribute('data-n')||'0'),10) || 0;
    const start = performance.now();
    const dur = 520;
    const ease = (t)=> 1 - Math.pow(1-t,3);
    function tick(now){
      const p = Math.min(1, (now-start)/dur);
      const v = Math.round(from + (to-from)*ease(p));
      el.textContent = fmtInt(v) + suffix;
      if(p<1) requestAnimationFrame(tick);
      else {
        el.setAttribute('data-n', String(to));
        el.classList.remove('pulse');
        void el.offsetWidth;
        el.classList.add('pulse');
        setTimeout(()=>el.classList.remove('pulse'), 220);
      }
    }
    requestAnimationFrame(tick);
  }

  // ===== Filtering =====
  function matchesSelected(course){
    if(selected.size === 0) return true;
    const set = courseTagMap.get(course)?.set;
    if(!set) return false;
    for(const k of selected.keys()){
      if(!set.has(k)) return false;
    }
    return true;
  }

  // ===== Grouping + render list (copiado de cursos.js, sin tocar salida) =====
  function normalizeTitle(t){
    t = norm(t).replace(/[–—]/g,'-').replace(/\s*-\s*/g,' - ');
    return t.trim();
  }
  function pickDisplayTitle(arr){
    const freq = new Map();
    for(const c of arr){
      const t = String(c.title||'').trim();
      freq.set(t, (freq.get(t)||0)+1);
    }
    let best='', bestN=-1;
    for(const [k,v] of freq.entries()){
      if(v>bestN){ bestN=v; best=k; }
    }
    return best || (arr[0] ? String(arr[0].title||'') : '');
  }
  function groupByTitle(courses){
    const map = new Map();
    for(const c of courses){
      const key = normalizeTitle(c.title);
      if(!map.has(key)) map.set(key, []);
      map.get(key).push(c);
    }
    for(const arr of map.values()){
      arr.sort((a,b)=>(parseInt(b.year,10)||0)-(parseInt(a.year,10)||0));
    }
    const groups = Array.from(map.entries()).map(([k, arr])=>({
      key:k,
      items:arr,
      title: pickDisplayTitle(arr)
    }));
    groups.sort((a,b)=>a.title.localeCompare(b.title,'es',{sensitivity:'base'}));
    return groups;
  }
  function buildRequestMailto(courseTitle, item){
    const to = 'jacinto@desaprendiendo.net';
    const now = new Date();
    const pad = (n)=>String(n).padStart(2,'0');
    const stamp = `${pad(now.getDate())}/${pad(now.getMonth()+1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const subject = `Solicitud de formación: ${courseTitle}`;
    const body =
`Hola Jacinto,\n\nQuiero solicitar esta formación.\n\nFecha y hora de solicitud: ${stamp}\n\nCurso: ${courseTitle}\nTipo: ${item.type || ''}\nCliente (referencia): ${item.client || ''}\nHoras: ${hoursOf(item) ? (hoursOf(item) + 'h') : ''}\nAño: ${item.year || ''}\n\nGracias.`;

    return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function renderList(filtered){
    if(!elGroupsHost) return;
    const groups = groupByTitle(filtered);

    // KPIs
    const editions = filtered.length;
    const distinct = groups.length;
    const hours = filtered.reduce((acc,c)=>acc + hoursOf(c), 0);
    animateInt(elKpiEditions, editions);
    animateInt(elKpiDistinct, distinct);
    animateInt(elKpiHours, Math.round(hours), 'h');

    // Cursos seleccionados (títulos) en panel izquierdo
    if(elSelectedCourses){
      if(groups.length === 0){
        elSelectedCourses.innerHTML = `<div class="empty">—</div>`;
      } else {
        const maxItems = 20;
        const titles = groups.map(g=>g.title);
        const shown = titles.slice(0, maxItems);
        const remaining = titles.length - shown.length;
        const items = shown.map(t=>
          `<li><span class="dot" aria-hidden="true"></span><span class="t">${esc(t)}</span></li>`
        );
        if(remaining > 0){
          items.push(`<li><span class="dot" aria-hidden="true"></span><span class="t">… y ${fmtInt(remaining)} más</span></li>`);
        }
        elSelectedCourses.innerHTML = `<ul>${items.join('')}</ul>`;
      }
    }

    if(!groups.length){
      elGroupsHost.innerHTML = `<div class="empty">No hay cursos que coincidan con el filtro.</div>`;
      return;
    }

    elGroupsHost.innerHTML = groups.map(g=>{
      const sessions = g.items.length;
      const h = g.items.reduce((acc,c)=>acc + hoursOf(c), 0);
      const rows = g.items.map(c=>`
        <tr>
          <td class="col-action"><a class="reqBtn" href="${buildRequestMailto(g.title, c)}">Solicitar</a></td>
          <td class="col-year">${esc(c.year||'')}</td>
          <td class="col-type">${esc(c.type||'')}</td>
          <td class="col-hours">${esc(hoursOf(c) ? (hoursOf(c) + 'h') : '')}</td>
          <td class="col-client">${esc(c.client||'')}</td>
        </tr>
      `).join('');
      return `
        <div class="cg-item">
          <button class="cg-head" type="button" aria-expanded="false">
            <div class="cg-title">${esc(g.title)}</div>
            <div class="cg-meta">
              <span class="cg-pill">${sessions} ediciones</span>
              <span class="cg-pill">${fmtInt(h)}h</span>
              <span class="cg-chev" aria-hidden="true">▾</span>
            </div>
          </button>
          <div class="cg-body" hidden>
            <div class="cg-inner">
              <div class="cg-table-wrap">
                <table class="cg-table">
                  <colgroup>
                    <col style="width:120px">
                    <col style="width:90px">
                    <col style="width:240px">
                    <col style="width:110px">
                    <col>
                  </colgroup>
                  <thead>
                    <tr><th></th><th>Año</th><th>Tipo</th><th>Horas</th><th>Cliente</th></tr>
                  </thead>
                  <tbody>${rows}</tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Accordion
    $$('.cg-head', elGroupsHost).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const body = btn.nextElementSibling;
        const open = !body.hasAttribute('hidden');
        if(open){ body.setAttribute('hidden',''); btn.setAttribute('aria-expanded','false'); }
        else { body.removeAttribute('hidden'); btn.setAttribute('aria-expanded','true'); }
      });
    });
  }

  // ===== Bubble data =====
  function buildTagStats(courses){
    const counts = new Map(); // norm(tag)-> {key,tag,cat,count}
    for(const c of courses){
      const items = courseTagMap.get(c)?.items || [];
      for(const it of items){
        const key = norm(it.tag);
        if(!key) continue;
        const prev = counts.get(key);
        if(prev) prev.count += 1;
        else counts.set(key, { key, tag: it.tag, cat: it.cat, count: 1 });
      }
    }
    // Devuelve SOLO entradas con count > 0 (estricto)
    return Array.from(counts.values()).filter(x => Number.isFinite(x.count) && x.count > 0);
  }

  function catColor(cat){
    const css = getComputedStyle(document.documentElement);
    const map = {
      tech: css.getPropertyValue('--c-tech').trim(),
      domain: css.getPropertyValue('--c-domain').trim(),
      level: css.getPropertyValue('--c-level').trim(),
      role: css.getPropertyValue('--c-role').trim(),
      client: (css.getPropertyValue('--c-client').trim() || css.getPropertyValue('--c-focus').trim()),
      focus: css.getPropertyValue('--c-focus').trim(),
    };
    return map[cat] || map.tech;
  }

  // Spiral packing (sin d3)
  function pack(nodes, w, h){
    const placed = [];
    // Reduce el espacio entre burbujas (aprox. a la mitad) para que quepan más
    const gap = 7;

    const cx0 = w/2, cy0 = h/2;
    const step = 6;
    const turns = 1500;
    for(const n of nodes){
      if(!placed.length){
        n.x = cx0; n.y = cy0;
        placed.push(n);
        continue;
      }
      let ok = false;
      for(let i=0; i<turns; i++){
        const a = i * 0.35;
        const r = step * Math.sqrt(i);
        const x = cx0 + Math.cos(a)*r;
        const y = cy0 + Math.sin(a)*r;
        // bounds
        if(x - n.r < 8 || x + n.r > w-8 || y - n.r < 8 || y + n.r > h-8) continue;
        let hit = false;
        for(const p of placed){
          const dx = x - p.x;
          const dy = y - p.y;
          const min = n.r + p.r + gap;
          if(dx*dx + dy*dy < min*min){ hit = true; break; }
        }
        if(!hit){ n.x=x; n.y=y; ok=true; break; }
      }
      if(!ok){
        // fallback: apila cerca del centro
        n.x = cx0 + (Math.random()*2-1)*20;
        n.y = cy0 + (Math.random()*2-1)*20;
      }
      placed.push(n);
    }
    return nodes;
  }

  function ensureDefs(svg){
    let defs = svg.querySelector('defs');
    if(defs) return defs;
    defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
    svg.appendChild(defs);
    // sombra suave
    const f = document.createElementNS('http://www.w3.org/2000/svg','filter');
    f.setAttribute('id','bubbleShadow');
    f.setAttribute('x','-20%'); f.setAttribute('y','-20%');
    f.setAttribute('width','140%'); f.setAttribute('height','140%');
    const ds = document.createElementNS('http://www.w3.org/2000/svg','feDropShadow');
    ds.setAttribute('dx','0'); ds.setAttribute('dy','10');
    ds.setAttribute('stdDeviation','10');
    ds.setAttribute('flood-color','rgba(0,0,0,.35)');
    f.appendChild(ds);
    defs.appendChild(f);

    const cats = ['tech','domain','level','role','client'];
    for(const cat of cats){
      const id = `g_${cat}`;
      const grad = document.createElementNS('http://www.w3.org/2000/svg','radialGradient');
      grad.setAttribute('id', id);
      grad.setAttribute('cx','30%');
      grad.setAttribute('cy','28%');
      grad.setAttribute('r','78%');

      const c = catColor(cat);

      const stop = (off, col, op)=>{
        const s = document.createElementNS('http://www.w3.org/2000/svg','stop');
        s.setAttribute('offset', off);
        s.setAttribute('stop-color', col);
        s.setAttribute('stop-opacity', String(op));
        return s;
      };

      // esfera sólida con brillo (glossy)
      grad.appendChild(stop('0%',  '#ffffff', 0.42));  // highlight
      grad.appendChild(stop('18%', c,        0.98));   // main
      grad.appendChild(stop('70%', c,        0.72));   // falloff
      grad.appendChild(stop('100%','#000000',0.18));   // shadow
      defs.appendChild(grad);
    }

    return defs;
  }

  
  function labelFor(n){
    const t = String(n.tag || '').trim();
    if(!t) return ['',''];
    const r = n.r || 30;
    const maxChars = Math.max(9, Math.min(18, Math.floor(r/2.8)));
    const words = t.split(' ').filter(Boolean);
    if(t.length <= maxChars) return [t,''];

    // Greedy split into 2 lines
    let l1 = '';
    let i = 0;
    while(i < words.length){
      const test = (l1 ? l1+' ' : '') + words[i];
      if(test.length <= maxChars){
        l1 = test; i++;
      } else break;
    }
    let l2 = words.slice(i).join(' ');
    if(l2.length > maxChars){
      l2 = l2.slice(0, maxChars-1) + '…';
    }
    if(!l1){
      l1 = t.slice(0, maxChars-1) + '…';
      l2 = '';
    }
    return [l1, l2];
  }


  function renderSelectedChips(){
    if(!elSel) return;
    if(selected.size === 0){ elSel.textContent = '—'; return; }
    elSel.innerHTML = Array.from(selected.values()).map(it=>{
      const c = it.cat;
      return `<span class="st st-${esc(c)}"><span class="dot"></span>${esc(it.tag)}</span>`;
    }).join('');
  }

  function updateChipsUI(){
    const p = primaryCat();
    const s = secondaryCat();
    categoryChips.forEach(ch=>{
      const c = ch.getAttribute('data-cat');
      ch.classList.toggle('is-on', c === visibleCategory);

      const enabled = stage === 0
        ? (c === 'all' || c === p)
        : stage === 1
          ? (c === s)
          : (c !== 'domain' && c !== 'tech');

      ch.classList.toggle('is-disabled', !enabled);
      ch.setAttribute('aria-disabled', enabled ? 'false' : 'true');
    });
  }

  function recompute(){
    // Fases guiadas (según orden elegido)
    const p = primaryCat();
    const s = secondaryCat();

    if(stage === 0 && !['all', p].includes(visibleCategory)){
      visibleCategory = 'all';
      updateChipsUI();
    }
    if(stage === 1 && visibleCategory !== s){
      visibleCategory = s;
      updateChipsUI();
    }

    if(stage === 0) setMeta(p, p === 'domain' ? 'Selecciona un dominio' : 'Selecciona una tecnología');
    if(stage === 1) setMeta(s, s === 'domain' ? 'Selecciona un dominio' : 'Selecciona una tecnología');
    const filtered = allCourses.filter(matchesSelected);
    renderSelectedChips();
    renderList(filtered);
    renderBubbles(filtered);
  }

  function renderBubbles(filteredCourses){
    if(!elSvg || !elHost) return;

    const w = Math.max(320, elHost.clientWidth);
// Altura inicial "suave" (se ajustará al contenido tras el packing)
let h = Math.max(380, Math.round(window.innerHeight * 0.50));
elSvg.setAttribute('viewBox', `0 0 ${w} ${h}`);
elSvg.setAttribute('width', String(w));
elSvg.setAttribute('height', String(h));
elHost.style.height = h + 'px';
ensureDefs(elSvg);
// counts dinámicos: si hay selección, usa el filtrado; si no, usa todo
    const baseCourses = (selected.size ? filteredCourses : allCourses);
    // Garantía extra: si no hay tags seleccionados, baseCourses debe ser TODO el dataset
    // (mismo comportamiento que al reiniciar)
    // Nota: filteredCourses podría variar por KPIs/listado, pero burbujas iniciales deben ser globales.
    const bubbleCourses = (selected.size ? baseCourses : allCourses);

    // En estado inicial (sin selección) siempre mostramos TODAS las burbujas
    // y al filtrar, recalculamos según el conjunto filtrado.
    let stats = buildTagStats(bubbleCourses);

    // Fases guiadas:
    // stage 0: SOLO categoría primaria (Dominio o Tecnología)
    // stage 1: SOLO categoría secundaria (filtrada por la primaria elegida)
    // stage 2: Todas excepto Dominio (el Dominio queda fijado arriba)
    const p = primaryCat();
    const s = secondaryCat();

    if(stage === 0){
      stats = stats.filter(st => (st.cat === p));
    }else if(stage === 1){
      stats = stats.filter(st => (st.cat === s));
    }else{
      // Fase final (estricto):
      // Una vez elegidos Dominio + Tecnología (en cualquier orden),
      // NO deben volver a aparecer burbujas de esas categorías para evitar bucles.
      // Solo se muestran categorías restantes (Nivel/Rol/Cliente).
      stats = stats.filter(st => (st.cat !== 'domain' && st.cat !== 'tech'));


    // Si estamos en fase final, no permitimos fijar la vista en Dominio/Tecnología (no se muestran)
    if(stage >= 2 && (visibleCategory === 'domain' || visibleCategory === 'tech')){
      visibleCategory = 'all';
    }    }

// Si ya se ha seleccionado alguna etiqueta de una categoría,
// no mostramos el resto de burbujas de ESA categoría (evita bucles y simplifica la búsqueda).
// Esto aplica en la fase final (stage 2), donde ya tenemos primaria+secundaria fijadas.
if(stage >= 2 && selected.size){
  const selectedCats = new Set(Array.from(selected.values()).map(v => v && v.cat).filter(Boolean));
  if(selectedCats.size){
    // Si el usuario estaba "viendo" una categoría ya seleccionada, volvemos a 'all'
    if(selectedCats.has(visibleCategory)) visibleCategory = 'all';
    stats = stats.filter(st => !selectedCats.has(st.cat));
  }
}

    // Toggle mostrar/ocultar clientes (solo afecta a burbujas/visibilidad, no al dataset)
    if(!showClients){
      stats = stats.filter(st => st.cat !== 'client');
      if(visibleCategory === 'client') visibleCategory = 'all';
    }

    // aplica filtro de categoría visible (solo afecta a lo que se ve)
    if(visibleCategory !== 'all'){
      stats = stats.filter(s=>s.cat === visibleCategory);
    }

    // Seguridad: nunca renderizar burbujas con count <= 0
    stats = stats.filter(st => Number.isFinite(st.count) && st.count > 0);

    // Orden por frecuencia
    stats.sort((a,b)=>b.count-a.count);

    const maxC = stats.length ? Math.max(...stats.map(s=>s.count)) : 1;
    // Un pelín más pequeñas para que entren más burbujas en pantalla
    const minR = 14;
    const maxR = 68;
    const scaleR = (c)=>{
      const t = Math.sqrt(c / maxC);
      return minR + (maxR-minR)*t;
    };

    const nodes = stats.map(s=>({
      key: s.key,
      tag: s.tag,
      cat: s.cat,
      count: s.count,
      r: scaleR(s.count),
      x: 0,
      y: 0
    }));

    pack(nodes, w, h);

    // Ajuste "zoom": encaja el viewBox al contenido real (sin que el canvas parezca enorme)
    const pad = 28;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for(const n of nodes){
      minX = Math.min(minX, n.x - n.r);
      minY = Math.min(minY, n.y - n.r);
      maxX = Math.max(maxX, n.x + n.r);
      maxY = Math.max(maxY, n.y + n.r);
    }
    if(isFinite(minX) && isFinite(minY) && isFinite(maxX) && isFinite(maxY)){
      const vbW = Math.max(320, (maxX - minX) + pad*2);
      const vbH = Math.max(320, (maxY - minY) + pad*2);

      // centra y aplica padding
      const vbX = minX - pad;
      const vbY = minY - pad;

      // Ajusta altura del host al contenido (con límites razonables)
      const targetH = Math.max(360, Math.min(720, Math.round(vbH)));
      elHost.style.height = targetH + 'px';
      elSvg.setAttribute('height', String(targetH));
      elSvg.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
    }


    // join/update
    const ns = 'http://www.w3.org/2000/svg';
    const existing = new Map();
    $$('.bNode', elSvg).forEach(g=> existing.set(g.getAttribute('data-key'), g));

    const nextKeys = new Set(nodes.map(n=>n.key));
    // remove old
    for(const [k,g] of existing.entries()){
      if(!nextKeys.has(k)) g.remove();
    }

    for(const n of nodes){
      let g = existing.get(n.key);
      if(!g){
        g = document.createElementNS(ns,'g');
        g.classList.add('bNode');
        g.setAttribute('data-key', n.key);
        g.setAttribute('data-cat', n.cat);

        const c = document.createElementNS(ns,'circle');
        c.classList.add('bCircle');
        c.setAttribute('stroke', catColor(n.cat));
        c.setAttribute('stroke-width','1.3');
        c.setAttribute('fill', `url(#g_${n.cat})`);
        c.setAttribute('filter','url(#bubbleShadow)');

        const t1 = document.createElementNS(ns,'text');
        t1.classList.add('bLabel');

        const t2 = document.createElementNS(ns,'text');
        t2.classList.add('bSub');

        g.appendChild(c);
        g.appendChild(t1);
        g.appendChild(t2);

        g.addEventListener('mouseenter', ()=>{ setMeta(n.cat, n.tag); document.body.classList.add('legend-off'); });
        g.addEventListener('mouseleave', ()=>{ document.body.classList.remove('legend-off'); });
        g.addEventListener('click', ()=>{
          const key = n.key;
          pushHistory();
          setMeta(n.cat, n.tag);

          // stage 0: el primer click DEBE ser la categoría primaria (según el toggle).
                    // La fijamos (no se deselecciona), la mostramos arriba y pasamos a pedir la secundaria.

    if(stage === 0){
                      const p = primaryCat();
                      const s = secondaryCat();
                      if(n.cat !== p) return;
          
                      stage = 1;
          
                      if(p === 'domain'){
                        selectedDomainKey = key;
                        selectedDomainLabel = n.tag;
                        // Al cambiar de ruta, la tecnología vuelve a estar vacía
                        selectedTechKey = null;
                        selectedTechLabel = null;
                      }else{
                        selectedTechKey = key;
                        selectedTechLabel = n.tag;
                        selectedDomainKey = null;
                        selectedDomainLabel = null;
                      }
          
                      // fuerza selección única: primaria
                      selected.clear();
                      selected.set(key, { tag: n.tag, cat: n.cat });
          
                      visibleCategory = s;
                      updateChipsUI();
                      setSelectedDomainUI();
                      setMeta(s, s === 'domain' ? 'Selecciona un dominio' : 'Selecciona una tecnología');
                      recompute();
                      return;
                    }
          
                    // stage 1: el primer click DEBE ser la categoría secundaria (filtrada por la primaria elegida)
                    // La fijamos también y desbloqueamos el resto de categorías.
                    if(stage === 1){
                      const s = secondaryCat();
                      if(n.cat !== s) return;
          
                      stage = 2;
          
                      if(s === 'domain'){
                        selectedDomainKey = key;
                        selectedDomainLabel = n.tag;
                      }else{
                        selectedTechKey = key;
                        selectedTechLabel = n.tag;
                      }
          
                      selected.set(key, { tag: n.tag, cat: n.cat });
          
                      visibleCategory = 'all';
                      updateChipsUI();
                      setSelectedDomainUI();
                      recompute();
                      return;
                    }
          
                    // stage 2+: no permitimos deseleccionar Dominio/Tecnología fijados
          if(key === selectedDomainKey || key === selectedTechKey) return;

          if(selected.has(key)) selected.delete(key);
          else selected.set(key, { tag: n.tag, cat: n.cat });
          recompute();
        });

        elSvg.appendChild(g);
      }

      const circle = g.querySelector('circle');
      const [l1,l2] = labelFor(n);
      const t1 = g.querySelector('.bLabel');
      const t2 = g.querySelector('.bSub');

      // position
      circle.setAttribute('cx', String(n.x));
      circle.setAttribute('cy', String(n.y));
      circle.setAttribute('r', String(n.r));

      // label sizing
      const fs = Math.max(10, Math.min(16, Math.round(n.r/3.2)));
      t1.setAttribute('x', String(n.x));
      t1.setAttribute('y', String(n.y - (l2? (fs*0.22):0)));
      t1.setAttribute('font-size', String(fs));
      t1.textContent = l1;

      t2.setAttribute('x', String(n.x));
      t2.setAttribute('y', String(n.y + fs*0.72));
      t2.setAttribute('font-size', String(Math.max(10, fs-3)));
      t2.textContent = (l2 ? `${l2} · ${n.count}` : String(n.count));

      // selected state
      const isSel = selected.has(n.key);
      // Si hay selección, NO apagamos las burbujas relacionadas (las que aparecen en el filtrado)
      // Solo destacamos las seleccionadas y dejamos el resto bien visible.
      g.classList.toggle('is-dim', false);
      circle.setAttribute('stroke-width', isSel ? '2.6' : '1.3');
      circle.setAttribute('opacity', isSel ? '1' : (selected.size ? '0.98' : '0.92'));
      g.classList.toggle('is-sel', isSel);
    }

    // Asegura que Tecnología y Dominio queden SIEMPRE en primer plano (SVG draw order)
    // En SVG, lo último en el DOM se pinta arriba.
    const priority = (cat)=> (cat === 'tech' || cat === 'domain') ? 2 : 1;
    const groups = $$('.bNode', elSvg);
    groups
      .sort((a,b)=> priority(a.getAttribute('data-cat')) - priority(b.getAttribute('data-cat')))
      .forEach(g=> elSvg.appendChild(g));
  }

  // ===== Wiring =====
  function wire(){

    function resetFlow(clearHistory=true){
      if(clearHistory) historyStack.length = 0;
      selected.clear();
      visibleCategory = 'all';
      stage = 0;
      selectedDomainKey = null;
      selectedDomainLabel = null;
      selectedTechKey = null;
      selectedTechLabel = null;
      setSelectedDomainUI();
      setMeta(primaryCat(), primaryCat() === 'domain' ? 'Selecciona un dominio' : 'Selecciona una tecnología');
      updateChipsUI();
      recompute();
    }


    categoryChips.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const cat = btn.getAttribute('data-cat');
        const p = primaryCat();
        const s = secondaryCat();
        const enabled = stage === 0
          ? (cat === 'all' || cat === p)
          : stage === 1
            ? (cat === s)
            : (cat !== 'domain' && cat !== 'tech');

        if(!enabled) return;
        visibleCategory = cat || 'all';
        updateChipsUI();
        recompute();
      });
    });

    // Toggle de orden (no entra en Undo; reinicia el flujo manteniendo el criterio seleccionado)
    setOrderUI();
    if(elOrderModeToggle){
      elOrderModeToggle.addEventListener('click', ()=>{
        orderMode = (orderMode === 'domain-tech') ? 'tech-domain' : 'domain-tech';
        setOrderUI();
        resetFlow(true);
      });
    }

    // Toggle mostrar/ocultar clientes (no afecta al criterio de selección ni al undo)
  function applyShowClientsUI(){
    if(!elToggleClients) return;
    elToggleClients.classList.toggle('is-on', showClients);
    elToggleClients.classList.toggle('is-off', !showClients);
    elToggleClients.setAttribute('aria-pressed', showClients ? 'false' : 'true');
    document.body.classList.toggle('hideClients', !showClients);
  }
  applyShowClientsUI();

  if(elToggleClients){
    elToggleClients.addEventListener('click', () => {
      showClients = !showClients;
      if(!showClients){
        // Evita filtros invisibles: si ocultamos clientes, limpiamos selecciones de cliente
        for(const [k,v] of Array.from(selected.entries())){
          if(v && v.cat === 'client') selected.delete(k);
        }
      }

      applyShowClientsUI();
      updateChipsUI();
      recompute(); // re-render respetando el filtro
    });
  }

    if(elUndo){
      elUndo.addEventListener('click', ()=>{
        if(restoreHistory()){
          updateChipsUI();
          setSelectedDomainUI();
          recompute();
        }
      });
    }
    if(elReset){
      elReset.addEventListener('click', ()=> resetFlow(true));
    }
  }

  window.addEventListener('resize', ()=>{
    // solo recalcula posición/medidas (manteniendo filtros)
    recompute();
  });


  document.addEventListener('DOMContentLoaded', ()=>{
// Mover el bloque de "seleccionados" encima del diagrama (columna derecha)
try{
  const help = document.querySelector('.hero .left .help');
  const right = document.querySelector('.hero .right');
  const bubbleHost = document.getElementById('bubbleHost');
  if(help && right && bubbleHost){
    right.insertBefore(help, bubbleHost);
  }
}catch(_e){}

// Quitar indicaciones de sección dentro del canvas (la selección ya se ve en "seleccionados")
try{
  const meta = document.getElementById('bubbleMeta');
  if(meta) meta.hidden = true;
}catch(_e){}

    // estado inicial (todas las burbujas visibles)
    selected.clear();
    visibleCategory = 'all';
    stage = 0;
    selectedDomainKey = null;
    selectedDomainLabel = null;
    selectedTechKey = null;
    selectedTechLabel = null;
    setSelectedDomainUI();
    updateChipsUI();
    wire();
    if(elSvg){ elSvg.addEventListener('mouseleave', ()=> document.body.classList.remove('legend-off')); }
    // KPIs initial set
    if(elKpiEditions) elKpiEditions.setAttribute('data-n','0');
    if(elKpiDistinct) elKpiDistinct.setAttribute('data-n','0');
    if(elKpiHours) elKpiHours.setAttribute('data-n','0');
    recompute();
  });


// ===== PRINT SELECTION (FIXED INSIDE SCOPE) =====
const elPrintGraph = document.getElementById('printSelectionGraph');

if(elPrintGraph){
  elPrintGraph.addEventListener('click', ()=>{
    const filtered = allCourses.filter(matchesSelected);
    printCoursesByTechnologyGraph(filtered);
  });
}

function printCoursesByTechnologyGraph(courses){

  const groups = new Map();

  for(const c of courses){
    const items = courseTagMap.get(c)?.items.filter(t => t.cat === 'tech') || [];
    for(const t of items){
      if(!groups.has(t.tag)) groups.set(t.tag, []);
      groups.get(t.tag).push(c);
    }
  }

  const win = window.open('', '_blank');

  let html = `
  <html>
  <head>
  <title>Informe de Cursos</title>
  <style>
  body{font-family:Arial;padding:30px;}
  h1{margin-bottom:30px;}
  h2{margin-top:30px;border-bottom:1px solid #ccc;padding-bottom:6px;}
  ul{margin:8px 0 20px 20px;}
  </style>
  </head>
  <body>
  <h1>Informe de Cursos por Tecnología</h1>
  `;

  const ordered = Array.from(groups.keys()).sort((a,b)=>
    a.localeCompare(b,'es',{sensitivity:'base'})
  );

  for(const tech of ordered){
    html += `<h2>${tech}</h2><ul>`;
    const titles = new Set(groups.get(tech).map(c=>c.title));
    for(const t of titles){
      html += `<li>${t}</li>`;
    }
    html += `</ul>`;
  }

  html += `</body></html>`;

  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

})();
