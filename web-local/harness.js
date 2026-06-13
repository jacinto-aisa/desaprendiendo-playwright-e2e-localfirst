
const fs = require('fs');
const vm = require('vm');

class El {
  constructor(id){ this.id=id; this.children=[]; this.style={}; this.attributes={}; this.innerHTML=''; this.textContent=''; this.clientWidth=980; }
  setAttribute(k,v){ this.attributes[k]=String(v); }
  getAttribute(k){ return this.attributes[k]; }
  appendChild(ch){ this.children.push(ch); return ch; }
  querySelector(){ return null; }
  querySelectorAll(){ return []; }
  addEventListener(){ }
  remove(){ }
}

const ids = ['bubbleHost','bubbleSvg','courseGroups','selectedTags','resetAll','undoStep','bubbleMetaText','bubbleMetaDot','kpiEditions','kpiDistinct','kpiHours'];
const dom = new Map(ids.map(id=>[id,new El(id)]));

const domReadyCallbacks = [];

const document = {
  getElementById: (id)=> dom.get(id) || null,
  querySelector: ()=> null,
  querySelectorAll: ()=> [],
  createElementNS: (ns, tag)=> new El(tag),
  addEventListener: (evt, cb)=> { if(evt==='DOMContentLoaded') domReadyCallbacks.push(cb); }
};
const windowObj = {
  innerHeight: 900,
  addEventListener: ()=>{},
  getComputedStyle: ()=>({ getPropertyValue: ()=>'#2563eb' })
};

const ctx = { window: windowObj, document, console, setTimeout, clearTimeout, getComputedStyle: windowObj.getComputedStyle, performance: { now: ()=>0 }, requestAnimationFrame: (cb)=>cb(0) };
ctx.global = ctx;

const dataCode = fs.readFileSync('data.js','utf8');
vm.runInNewContext(dataCode, ctx, {filename:'data.js'});
console.log('courses:', ctx.window.SITE_DATA?.courses?.length || 0);

const graphCode = fs.readFileSync('assets/js/cursos_graph.js','utf8');
vm.runInNewContext(graphCode, ctx, {filename:'cursos_graph.js'});

for(const cb of domReadyCallbacks){ cb(); }
console.log('OK');
