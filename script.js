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

// Render contact card dynamically
function renderContact(profile) {
  const card = $('#contactCard');
  if (card) {
    card.innerHTML = `
      <div class="contact-info" style="display: flex; flex-direction: column; gap: 8px;">
        <h3 style="margin: 0; color: #fff;">Get in Touch</h3>
        <p class="muted" style="margin: 8px 0 0;">Feel free to reach out for BI consulting, enterprise dashboard development, or data architecture projects.</p>
        <ul style="list-style: none; padding: 0; margin: 16px 0 0; display: flex; flex-direction: column; gap: 12px;">
          <li><strong>📧 Email:</strong> <a href="mailto:${profile.email}" style="color: var(--accent); text-decoration: none; font-weight: 600;">${profile.email}</a></li>
          <li><strong>📞 Phone:</strong> <a href="tel:${profile.phone.replace(/\s+/g, '')}" style="color: var(--accent); text-decoration: none; font-weight: 600;">${profile.phone}</a></li>
        </ul>
      </div>
      <div class="contact-actions-box" style="display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 12px; border-left: 1px solid rgba(255,255,255,0.05); padding-left: 18px;">
        <p class="muted" style="text-align: center; font-size: 0.85rem; margin: 0;">Available for freelance opportunities and full-time positions.</p>
        <a class="btn btn-primary" href="mailto:${profile.email}" style="padding: 10px 20px; font-weight: 600; text-decoration: none; display: inline-flex;">Send an Email</a>
      </div>
    `;
  }
}

// Render profile
function renderProfile(profile){
  $('#heroTitle').textContent = profile.name;
  $('#heroTagline').textContent = profile.tagline;
  $('#heroRole').innerHTML = `${profile.role} — <span id="heroTech">${profile.tech.join(' | ')}</span>`;
  const heroDescription = $('#heroDescription');
  if (heroDescription) heroDescription.textContent = profile.summary || heroDescription.textContent;
  document.title = `${profile.name} — ${profile.tagline}`;
  $('#currentYear').textContent = new Date().getFullYear();
  // About
  $('#aboutProfile').innerHTML = `<p>${profile.summary}</p>`;
  
  // Set Resume URL dynamically
  if (profile.resumeUrl) {
    const resumeBtn = $('#downloadResume');
    if (resumeBtn) {
      resumeBtn.href = profile.resumeUrl;
    }
  }

  // Render contact card dynamically
  renderContact(profile);

  // socials
  const socials = $('#socials'); socials.innerHTML='';
  profile.socials.forEach(s=>{
    const a = el('a',{href:s.url,target:'_blank',class:'social',title:s.name},[document.createTextNode(s.icon?s.icon:s.name)]);
    socials.appendChild(a);
  });
}

// Render about-style timeline cards (used for Experience, Certifications, and career)
function renderTimeline(node, items){
  node.innerHTML='';
  items.forEach(it=>{
    const card = el('div',{class:'card about-card'},[]);
    card.innerHTML = `
      <div class="about-card-header">
        <div class="about-card-title">${it.title}</div>
        <div class="about-card-period">${it.period || ''}</div>
      </div>
      ${it.description ? `<p class="about-card-desc">${it.description}</p>` : ''}
      ${it.badge ? `<span class="about-card-badge">${it.badge}</span>` : ''}
    `;
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
    
    // Only show thumbnail if image is present and not blank
    const validImages = (p.gallery || []).filter(src => src && src.trim() !== '');
    if (validImages.length > 0) {
      const thumb = el('div',{class:'project-thumb',style:`background-image:url(${validImages[0]})`},[]);
      card.appendChild(thumb);
    }

    const chips = el('div',{class:'chips'},[]);
    (p.industries||[]).forEach(i=>chips.appendChild(el('span',{class:'chip'},[document.createTextNode(i)])));
    
    const desc = el('div',{},[document.createTextNode(p.short || '')]);
    const btns = el('div',{class:'project-actions'},[]);
    const view = el('button',{class:'btn btn-ghost'},[document.createTextNode('View Case Study')]);
    view.addEventListener('click',()=>openProjectModal(p.id));
    btns.appendChild(view);
    
    card.appendChild(chips); card.appendChild(desc); card.appendChild(btns);
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
  const images = (galleryImages || []).filter(src => src && src.trim() !== '');
  if (images.length === 0) return null;

  const wrap = el('div',{class:'gallery'},[]);
  const track = el('div',{class:'gallery-track'},[]);
  images.forEach(src=>{
    const g = el('div',{class:'g-img',style:`background-image:url(${src})`},[]);
    track.appendChild(g);
  });
  wrap.appendChild(track);

  // If there is more than 1 image, show controls and clickable thumbnails
  if (images.length > 1) {
    const controls = el('div',{class:'g-controls'},[]);
    const prev = el('button',{},[document.createTextNode('◀')]);
    const next = el('button',{},[document.createTextNode('▶')]);
    controls.appendChild(prev); controls.appendChild(next);
    wrap.appendChild(controls);

    // Create thumbnail row
    const thumbRow = el('div',{class:'g-thumb-row'},[]);
    images.forEach((src, idx)=>{
      const thumb = el('div',{
        class:`g-thumb ${idx === 0 ? 'active' : ''}`,
        style:`background-image:url(${src})`
      },[]);
      thumb.addEventListener('click', () => {
        goToSlide(idx);
      });
      thumbRow.appendChild(thumb);
    });

    let idx = 0; const imgs = track.children;
    function update(){ 
      track.style.transform = `translateX(-${idx * 100}%)`; 
      Array.from(thumbRow.children).forEach((t, i) => {
        if (i === idx) t.classList.add('active');
        else t.classList.remove('active');
      });
    }
    function goToSlide(slideIdx) {
      idx = slideIdx;
      update();
    }

    prev.addEventListener('click', ()=>{ idx = (idx-1+imgs.length)%imgs.length; update(); });
    next.addEventListener('click', ()=>{ idx = (idx+1)%imgs.length; update(); });
    // keyboard
    wrap.tabIndex = 0;
    wrap.addEventListener('keydown', e=>{ if(e.key==='ArrowLeft') prev.click(); if(e.key==='ArrowRight') next.click(); });
    // swipe support
    let startX = null; wrap.addEventListener('pointerdown', e=>{ startX = e.clientX; wrap.setPointerCapture(e.pointerId); });
    wrap.addEventListener('pointerup', e=>{ if(startX===null) return; const dx = e.clientX - startX; if(Math.abs(dx)>40){ if(dx<0) next.click(); else prev.click(); } startX=null; });

    // Return a wrapper node that holds both the main gallery wrap and the thumbnails row
    return el('div',{},[wrap, thumbRow]);
  }

  return wrap;
}

// Helper to resolve and construct video player iframe/video tags
function getVideoEmbed(videoUrl) {
  if (!videoUrl || videoUrl.trim() === '') return '';
  
  // Google Drive Link detection
  const gdRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/;
  const gdMatch = videoUrl.match(gdRegex);
  if (gdMatch && gdMatch[1]) {
    const fileId = gdMatch[1];
    return `<iframe src="https://drive.google.com/file/d/${fileId}/preview" width="100%" height="360" allow="autoplay" style="border:none; border-radius:8px; margin-top:12px; background:#000;" allowfullscreen></iframe>`;
  }
  
  // YouTube Link detection (adds autoplay and mute so browser policies allow autoplay)
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const ytMatch = videoUrl.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1" width="100%" height="360" allow="autoplay; encrypted-media" allowfullscreen style="border:none; border-radius:8px; margin-top:12px; background:#000;"></iframe>`;
  }
  
  // Local or raw video link
  return `<video src="${videoUrl}" controls style="width: 100%; border-radius: 8px; background: #000; max-height: 360px; margin-top: 12px;"></video>`;
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

  // gallery (Only render if there are valid images/links in the array)
  const validImages = (p.gallery || []).filter(src => src && src.trim() !== '');
  if (validImages.length > 0) {
    const gallery = createGallery(validImages);
    if (gallery) {
      left.appendChild(gallery);
    }
  }

  const content = el('div',{},[]);
  
  let codeBlocksHtml = '';
  if (p.sql) {
    codeBlocksHtml += `
      <div class="modal-section-code" style="margin-top:16px;">
        <strong style="color:var(--accent);">SQL Query</strong>
        <pre class="code-card" style="margin-top:6px; max-height:220px; overflow:auto;"><code class="language-sql">${highlight(p.sql, 'sql')}</code></pre>
      </div>`;
  }
  if (p.powerQuery) {
    codeBlocksHtml += `
      <div class="modal-section-code" style="margin-top:16px;">
        <strong style="color:var(--accent);">Power Query (M)</strong>
        <pre class="code-card" style="margin-top:6px; max-height:220px; overflow:auto;"><code class="language-dax">${highlight(p.powerQuery, 'dax')}</code></pre>
      </div>`;
  }
  if (p.dax) {
    codeBlocksHtml += `
      <div class="modal-section-code" style="margin-top:16px;">
        <strong style="color:var(--accent);">DAX Measure</strong>
        <pre class="code-card" style="margin-top:6px; max-height:220px; overflow:auto;"><code class="language-dax">${highlight(p.dax, 'dax')}</code></pre>
      </div>`;
  }

  // Only render video card if a link is provided and not empty
  const videoHtml = (p.video && p.video.trim() !== '') ? `
    <div style="margin-top:24px;">
      <h4 style="border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:6px; color:#fff;">Interactive Demo Video</h4>
      ${getVideoEmbed(p.video)}
    </div>
  ` : '';

  content.innerHTML = `
    <h3 style="margin-top:16px; margin-bottom:6px; color:#fff; font-size:1.6rem;">${p.title}</h3>
    <p class="muted" style="margin-bottom:20px; font-size:1.05rem; line-height:1.5;">${p.overview}</p>
    
    <h4 style="color:#fff; margin-bottom:8px;">Business Problem</h4>
    <p style="margin-bottom:20px; line-height:1.5;">${p.businessProblem||''}</p>
    
    <h4 style="color:#fff; margin-bottom:8px;">KPIs Tracked</h4>
    <ul style="margin-bottom:20px; padding-left:20px; line-height:1.5;">
      ${(p.kpis||[]).map(k=>`<li style="margin-bottom:4px;">${k}</li>`).join('')}
    </ul>

    ${videoHtml}

    ${codeBlocksHtml ? `
      <div style="margin-top:24px;">
        <h4 style="border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:6px; color:#fff;">Technical Code Snippets</h4>
        ${codeBlocksHtml}
      </div>
    ` : ''}

    ${p.insights ? `
      <div style="margin-top:24px;">
        <h4 style="border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:6px; color:#fff;">Insights & Strategic Impact</h4>
        <p style="line-height:1.5;">${p.insights}</p>
      </div>
    ` : ''}

    ${p.challenges ? `
      <div style="margin-top:24px;">
        <h4 style="border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:6px; color:#fff;">Challenges & Solutions</h4>
        <p style="line-height:1.5;">${p.challenges}</p>
      </div>
    ` : ''}
  `;
  left.appendChild(content);

  // right column: metadata and close button
  right.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div>
        <strong style="color:#fff; font-size:0.9rem;">Industries</strong>
        <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
          ${(p.industries || []).map(i => `<span class="chip">${i}</span>`).join('')}
        </div>
      </div>
      <div>
        <strong style="color:#fff; font-size:0.9rem;">Technologies Used</strong>
        <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
          ${(p.technologies || []).map(t => `<span class="chip" style="background: rgba(255, 122, 0, 0.1); color: var(--accent); border: 1px solid rgba(255, 122, 0, 0.2);">${t}</span>`).join('')}
        </div>
      </div>
      <div>
        <strong style="color:#fff; font-size:0.9rem;">Business Users</strong>
        <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
          ${(p.businessUsers || []).map(u => `<span class="chip" style="background: rgba(255, 255, 255, 0.05);">${u}</span>`).join('')}
        </div>
      </div>
      <div>
        <strong style="color:#fff; font-size:0.9rem;">Project Duration</strong>
        <div style="margin-top: 8px; color:var(--muted);">${(p.timeline ? `${p.timeline.start} → ${p.timeline.end}` : 'Ongoing')}</div>
      </div>
    </div>
    <div style="margin-top: 36px;">
      <button class="btn btn-primary" id="closeModal" style="width: 100%; justify-content: center; padding: 12px; font-weight: 600;">Close Case Study</button>
    </div>
  `;

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

// Code showcases — About-style card with title, description, and expandable code block
function renderCodeList(nodeId, items, lang){
  const node = document.getElementById(nodeId); node.innerHTML='';
  items.forEach(it=>{
    const card = el('div',{class:'card about-card showcase-card'},[]);

    // Header row: title + copy button
    const header = el('div',{class:'about-card-header'},[]);
    const titleEl = el('div',{class:'about-card-title'},[document.createTextNode(it.title || '')]);
    const copy = el('button',{class:'copy-btn',title:'Copy code'},[document.createTextNode('Copy')]);
    header.appendChild(titleEl);
    header.appendChild(copy);
    card.appendChild(header);

    // Description (if any)
    if(it.description){
      const desc = el('p',{class:'about-card-desc'},[document.createTextNode(it.description)]);
      card.appendChild(desc);
    }

    // Lang badge
    const badge = el('span',{class:'about-card-badge'},[document.createTextNode(lang.toUpperCase())]);
    card.appendChild(badge);

    // Expandable code block
    const codeWrap = el('div',{class:'showcase-code-wrap'},[]);
    const pre = el('pre',{class:'showcase-pre'},[]);
    const code = el('code',{},[]);
    code.innerHTML = highlight(it.code, lang);
    pre.appendChild(code);
    codeWrap.appendChild(pre);
    card.appendChild(codeWrap);

    node.appendChild(card);
    copy.addEventListener('click', async ()=>{
      await navigator.clipboard.writeText(it.code);
      copy.textContent='Copied ✓'; setTimeout(()=>copy.textContent='Copy',1400);
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
  $$('section .card, .project-card, .skill-card, .code-card, .timeline .card, .about-card').forEach(n=>anim.observe(n));
}

// 3D scene motion using cursor and scroll depth
function setupHero3D(){
  const hero = document.querySelector('.hero');
  const sceneObjects = Array.from(document.querySelectorAll('.scene-object'));
  if (!hero || sceneObjects.length === 0) return;

  function updateScene(x, y){
    hero.style.setProperty('--mouse-x', x.toFixed(4));
    hero.style.setProperty('--mouse-y', y.toFixed(4));
    sceneObjects.forEach((obj)=>{
      const depth = parseFloat(obj.dataset.depth) || 1;
      const xOffset = x * depth * 18;
      const yOffset = y * depth * 18;
      obj.style.transform = `translate3d(${xOffset}px, ${yOffset}px, ${-depth * 36}px) rotateZ(${depth * 18}deg)`;
    });
  }

  function handlePointerMove(event){
    const rect = hero.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    updateScene(x, y);
  }

  function handleScroll(){
    const scrollValue = Math.min(1, window.scrollY / 1000);
    hero.style.setProperty('--scroll-depth', scrollValue.toFixed(4));
  }

  hero.addEventListener('pointermove', handlePointerMove);
  hero.addEventListener('pointerleave', ()=> updateScene(0, 0));
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

function setupSkills3D(){
  const skillsGrid = document.getElementById('skillsGrid');
  if (!skillsGrid) return;
  const cards = Array.from(skillsGrid.querySelectorAll('.skill-card'));

  function updateCards(){
    const gridRect = skillsGrid.getBoundingClientRect();
    const centerX = gridRect.left + gridRect.width / 2;
    cards.forEach(card=>{
      const cardRect = card.getBoundingClientRect();
      const offset = (cardRect.left + cardRect.width / 2) - centerX;
      const maxOffset = (gridRect.width / 2) + cardRect.width;
      const ratio = Math.max(-1, Math.min(1, offset / maxOffset));
      const rotateY = ratio * 40;
      const rotateX = Math.sign(ratio) * Math.min(12, Math.abs(ratio) * 20);
      const translateZ = 40 - Math.abs(ratio) * 34;
      const translateY = Math.abs(ratio) * 18;
      const scale = 1 - Math.abs(ratio) * 0.12;
      const opacity = 1 - Math.abs(ratio) * 0.4;
      card.style.transform = `translateZ(${translateZ}px) translateY(${translateY}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${scale})`;
      card.style.opacity = `${opacity}`;
      card.style.zIndex = `${100 - Math.round(Math.abs(ratio) * 100)}`;
    });
  }

  skillsGrid.addEventListener('scroll', ()=> requestAnimationFrame(updateCards), { passive: true });
  window.addEventListener('resize', ()=> requestAnimationFrame(updateCards));
  updateCards();
}

// Init static features immediately
try {
  setupNav();
  setupScrollSpy();
  setupHero3D();
  setupSkills3D();
  
  const viewBtn = $('#viewProjectsBtn');
  if (viewBtn) {
    viewBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = $('#projects');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const contactBtn = $('#contactBtn');
  if (contactBtn) {
    contactBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = $('#contact');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }
} catch (err) {
  console.error("Static setup error:", err);
}

// Init dynamic content
async function init(){
  try{
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

  }catch(err){
    console.error("Dynamic load error:", err);
  }
}

init();
