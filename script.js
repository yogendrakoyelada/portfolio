// script.js — main JavaScript module for YK Analytics
// Loads JSON data, renders UI, and wires interactions.

const DATA_PATH = 'data';

async function fetchJSON(name){
  const res = await fetch(`${DATA_PATH}/${name}`);
  if(!res.ok) throw new Error(`Failed to load ${name}`);
  return res.json();
}

// Utilities
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function el(tag, attrs={}, children=[]){
  const d = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => {
    if(k==='class') d.className = v;
    else if(k.startsWith('data-')) d.setAttribute(k,v);
    else d[k]=v;
  });
  if(typeof children === 'string') d.innerHTML = children;
  else children.forEach(c => d.appendChild(c));
  return d;
}

// Simple syntax highlighter for SQL/DAX (lightweight, client-side)
function escapeHtml(s){
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function highlight(code, lang='sql'){
  let out = escapeHtml(code);
  // comments
  if(lang==='sql'){
    out = out.replace(/(--.*?$)/gim, '<span class="token comment">$1</span>');
    const keywords = ['SELECT','FROM','WHERE','JOIN','ON','GROUP BY','ORDER BY','INNER','LEFT','RIGHT','FULL','SUM','COUNT','AS','IN','AND','OR','HAVING','OVER','PARTITION BY'];
    keywords.forEach(k=>{
      const re = new RegExp('\\b'+k+'\\b','ig'); out = out.replace(re, `<span class="token keyword">$&</span>`);
    });
    out = out.replace(/\b(\d+)\b/g, '<span class="token number">$1</span>');
    out = out.replace(/('[^']*')/g, '<span class="token string">$1</span>');
  } else if(lang==='dax'){
    out = out.replace(/(\/\/.*?$)/gim, '<span class="token comment">$1</span>');
    const k2 = ['CALCULATE','SUM','FILTER','ALLSELECTED','MAX','MIN','TOTALYTD','VAR','RETURN','IF','VALUES'];
    k2.forEach(k=>{ const re = new RegExp('\\b'+k+'\\b','ig'); out = out.replace(re, `<span class="token keyword">$&</span>`); });
    out = out.replace(/\b(\d+)\b/g, '<span class="token number">$1</span>');
    out = out.replace(/("[^"]*"|'[^']*')/g, '<span class="token string">$1</span>');
  }
  return out;
}

// Counters
function animateCounter(node, target){
  const isFloat = (String(target).indexOf('.')>-1);
  let start = 0; const dur = 1400; const startTs = performance.now();
  const end = parseFloat(target);
  function tick(ts){
    const prog = Math.min(1,(ts-startTs)/dur);
    const cur = start + (end-start)*prog;
    node.textContent = isFloat?cur.toFixed(1):Math.floor(cur);
    if(prog<1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// NAV toggle
function setupNav(){
  const toggle = $('#navToggle');
  const list = $('#navList');
  toggle.addEventListener('click', ()=>{
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    list.classList.toggle('show');
  });
  // Smooth scroll
  $$('[data-nav]').forEach(a=>{
    a.addEventListener('click', e=>{
      e.preventDefault(); const id = a.getAttribute('href').slice(1);
      document.getElementById(id).scrollIntoView({behavior:'smooth',block:'start'});
      // close nav on mobile
      list.classList.remove('show'); toggle.setAttribute('aria-expanded','false');
    });
  });
}

// Scroll spy
function setupScrollSpy(){
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const navLinks = $$('[data-nav]');
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const id = e.target.id;
        navLinks.forEach(a=>a.removeAttribute('aria-current'));
        const active = navLinks.find(a=>a.getAttribute('href')===`#${id}`);
        if(active) active.setAttribute('aria-current','true');
      }
    });
  },{threshold:0.5});
  sections.forEach(s=>obs.observe(s));
}

// Render profile
function renderProfile(profile){
  $('#heroTitle').textContent = profile.name;
  $('#heroTagline').textContent = profile.tagline;
  $('#heroRole').innerHTML = `${profile.role} — <span id="heroTech">${profile.tech.join(' | ')}</span>`;
  document.title = `${profile.name} — ${profile.tagline}`;
  $('#currentYear').textContent = new Date().getFullYear();
  // About
  $('#aboutProfile').innerHTML = `<p>${profile.summary}</p>`;
  // socials
  const socials = $('#socials'); socials.innerHTML='';
  profile.socials.forEach(s=>{
    const a = el('a',{href:s.url,target:'_blank',class:'social',title:s.name},[document.createTextNode(s.icon?s.icon:s.name)]);
    socials.appendChild(a);
  });
}

// Render career timeline
function renderTimeline(node, items){
  node.innerHTML='';
  items.forEach(it=>{
    const card = el('div',{class:'card'},[]);
    card.innerHTML = `<strong>${it.title}</strong><div class="muted">${it.period}</div><p>${it.description || ''}</p>`;
    node.appendChild(card);
  });
}

// Render skills
function renderSkills(skills){
  const grid = $('#skillsGrid'); grid.innerHTML='';
  skills.forEach(s=>{
    const c = el('div',{class:'skill-card'},[]);
    c.innerHTML = `<div class="skill-icon">${s.icon||''}</div><div><strong>${s.name}</strong><div class="muted">${s.level||''}</div></div>`;
    grid.appendChild(c);
  });
}

// Projects
let allProjects = [];
function renderProjects(projects){
  allProjects = projects;
  const grid = $('#projectsGrid'); grid.innerHTML='';
  projects.forEach(p=>{
    const card = el('article',{class:'project-card',tabIndex:0},[]);
    const thumb = el('div',{class:'project-thumb',style:`background-image:url(${p.gallery?.[0]||'assets/images/placeholder-project.svg'})`},[]);
    const chips = el('div',{class:'chips'},[]);
    (p.industries||p.industries||[]).forEach(i=>chips.appendChild(el('span',{class:'chip'},[document.createTextNode(i)])));
    const desc = el('div',{},[document.createTextNode(p.short || '')]);
    const btns = el('div',{class:'project-actions'},[]);
    const view = el('button',{class:'btn btn-ghost'},[document.createTextNode('View Case Study')]);
    view.addEventListener('click',()=>openProjectModal(p.id));
    btns.appendChild(view);
    card.appendChild(thumb); card.appendChild(chips); card.appendChild(desc); card.appendChild(btns);
    grid.appendChild(card);
  });
  // populate filter
  const filter = $('#projectsFilter'); filter.innerHTML='';
  const industries = Array.from(new Set(projects.flatMap(p=>p.industries||[])));
  filter.appendChild(el('option',{value:'all'},['All Industries']));
  industries.forEach(i=>filter.appendChild(el('option',{value:i},[document.createTextNode(i)])));
  filter.addEventListener('change', ()=>{
    const v = filter.value; if(v==='all') renderProjects(allProjects); else renderProjects(allProjects.filter(p=>p.industries && p.industries.includes(v)));
  });
  $('#projectsSearch').addEventListener('input', e=>{
    const q = e.target.value.toLowerCase();
    renderProjects(allProjects.filter(p=>p.title.toLowerCase().includes(q) || (p.short||'').toLowerCase().includes(q)));
  });
}

// Gallery controller used in modal
function createGallery(galleryImages){
  const wrap = el('div',{class:'gallery'},[]);
  const track = el('div',{class:'gallery-track'},[]);
  galleryImages.forEach(src=>{
    const g = el('div',{class:'g-img',style:`background-image:url(${src})`},[]);
    track.appendChild(g);
  });
  wrap.appendChild(track);
  const controls = el('div',{class:'g-controls'},[]);
  const prev = el('button',{},[document.createTextNode('◀')]);
  const next = el('button',{},[document.createTextNode('▶')]);
  controls.appendChild(prev); controls.appendChild(next);
  wrap.appendChild(controls);

  let idx = 0; const imgs = track.children;
  function update(){ track.style.transform = `translateX(-${idx * 100}%)`; }
  prev.addEventListener('click', ()=>{ idx = (idx-1+imgs.length)%imgs.length; update(); });
  next.addEventListener('click', ()=>{ idx = (idx+1)%imgs.length; update(); });
  // keyboard
  wrap.tabIndex = 0;
  wrap.addEventListener('keydown', e=>{ if(e.key==='ArrowLeft') prev.click(); if(e.key==='ArrowRight') next.click(); });
  // swipe support
  let startX = null; wrap.addEventListener('pointerdown', e=>{ startX = e.clientX; wrap.setPointerCapture(e.pointerId); });
  wrap.addEventListener('pointerup', e=>{ if(startX===null) return; const dx = e.clientX - startX; if(Math.abs(dx)>40){ if(dx<0) next.click(); else prev.click(); } startX=null; });

  return wrap;
}

// Modal
function openProjectModal(id){
  const p = allProjects.find(x=>x.id===id);
  if(!p) return;
  const root = $('#modalRoot'); root.innerHTML=''; root.classList.add('active'); root.setAttribute('aria-hidden','false');
  const modal = el('div',{class:'modal',role:'dialog','aria-modal':'true'},[]);
  const body = el('div',{class:'modal-body'},[]);
  const left = el('div',{class:'modal-left'},[]);
  const right = el('aside',{class:'modal-right'},[]);

  // gallery
  const gallery = createGallery(p.gallery && p.gallery.length? p.gallery : ['assets/images/placeholder-project.svg']);
  left.appendChild(gallery);

  const content = el('div',{},[]);
  content.innerHTML = `<h3>${p.title}</h3><p>${p.overview}</p><h4>Business Problem</h4><p>${p.businessProblem||''}</p><h4>KPIs</h4><ul>${(p.kpis||[]).map(k=>`<li>${k}</li>`).join('')}</ul>`;
  left.appendChild(content);

  // right column: sections with collapsible behavior on mobile
  const sections = ['Overview','Business Users','SQL','Power Query','Data Model','DAX','Insights','Challenges','Timeline','Technologies'];
  const secContainer = el('div',{},[]);
  // populate
  secContainer.innerHTML = `
    <div><strong>Technologies</strong><div>${(p.technologies||[]).join(', ')}</div></div>
    <div style="margin-top:12px"><strong>Project Duration</strong><div>${(p.timeline? `${p.timeline.start} → ${p.timeline.end}` : '')}</div></div>
  `;
  right.appendChild(secContainer);
  right.appendChild(el('div',{},[el('button',{class:'btn',id:'closeModal'},[document.createTextNode('Close')]) ]));

  body.appendChild(left); body.appendChild(right); modal.appendChild(body); root.appendChild(modal);
  $('#closeModal').focus();
  $('#closeModal').addEventListener('click', closeModal);
  root.addEventListener('click', (e)=>{ if(e.target===root) closeModal(); });
  document.addEventListener('keydown', escHandler);
}
function closeModal(){
  const root = $('#modalRoot'); root.classList.remove('active'); root.setAttribute('aria-hidden','true'); root.innerHTML=''; document.removeEventListener('keydown', escHandler);
}
function escHandler(e){ if(e.key==='Escape') closeModal(); }

// Code showcases (simple highlighting)
function renderCodeList(nodeId, items, lang){
  const node = document.getElementById(nodeId); node.innerHTML='';
  items.forEach(it=>{
    const card = el('div',{class:'code-card'},[]);
    const toolbar = el('div',{class:'code-toolbar'},[]);
    const copy = el('button',{class:'copy-btn',title:'Copy code'},[document.createTextNode('Copy')]);
    toolbar.appendChild(copy);
    const pre = el('pre',{},[]);
    const code = el('code',{},[]);
    code.innerHTML = highlight(it.code, lang);
    pre.appendChild(code);
    card.appendChild(toolbar); card.appendChild(pre);
    node.appendChild(card);
    copy.addEventListener('click', async ()=>{
      await navigator.clipboard.writeText(it.code);
      copy.textContent='Copied'; setTimeout(()=>copy.textContent='Copy',1200);
    });
  });
}

// Intersection animations
function setupObservers(){
  const anim = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting) e.target.classList.add('inview');
    });
  },{threshold:0.15});
  $$('section .card, .project-card, .skill-card, .code-card, .timeline .card').forEach(n=>anim.observe(n));
}

// Init
async function init(){
  try{
    setupNav(); setupScrollSpy();
    const [profile, projects, skills, experience, certifications, sql, dax] = await Promise.all([
      fetchJSON('profile.json'),
      fetchJSON('projects.json'),
      fetchJSON('skills.json'),
      fetchJSON('experience.json'),
      fetchJSON('certifications.json'),
      fetchJSON('sql.json'),
      fetchJSON('dax.json')
    ]);
    renderProfile(profile);
    renderTimeline($('#careerTimeline'), profile.career || []);
    renderSkills(skills);
    renderProjects(projects);
    renderTimeline($('#experienceTimeline'), experience);
    renderTimeline($('#certificationsGrid'), certifications);
    renderCodeList('sqlList', sql, 'sql');
    renderCodeList('daxList', dax, 'dax');

    // counters
    $$('.counter').forEach(n=>animateCounter(n, n.getAttribute('data-target')));
    setupObservers();

    // buttons
    $('#viewProjectsBtn').addEventListener('click', ()=>document.getElementById('projects').scrollIntoView({behavior:'smooth'}));
    $('#contactBtn').addEventListener('click', ()=>document.getElementById('contact').scrollIntoView({behavior:'smooth'}));

  }catch(err){
    console.error(err);
  }
}

init();
