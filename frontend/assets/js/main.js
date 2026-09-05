import {apiGet,escapeHTML as e,icon,icons,errorState,openDialog,initDialog,safeURL} from './api.js';
icons();initDialog();
const menu=document.querySelector('.menu-toggle'), nav=document.querySelector('#navigation');
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');nav.classList.toggle('open',open);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav?.classList.contains('open')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.focus();}});
const scroll=()=>document.querySelector('.header')?.classList.toggle('scrolled',window.scrollY>20);
window.addEventListener('scroll',scroll,{passive:true});scroll();
const page=document.body.dataset.page;
if(page==='projects')import('./projects.js');
if(page==='contact')import('./contact.js');
if(page==='services') {
 const grid=document.querySelector('#services-grid');
 const load=async()=>{try {
  const services=await apiGet('/services');
  grid.innerHTML=services.length?services.map((s,i)=>`<article class="panel service-card reveal">${icon(s.icon)}<span class="service-number">${String(i+1).padStart(2,'0')}</span><h2>${e(s.title)}</h2><p>${e(s.description)}</p><button class="text-link" data-service="${s.id}">En savoir plus ${icon('arrow-right')}</button></article>`).join(''):'<div class="panel empty-state">De nouveaux services arrivent bientôt. <a href="/contact">Discutons de votre besoin.</a></div>';
  grid.querySelectorAll('[data-service]').forEach(button=>button.addEventListener('click',()=>{const s=services.find(s=>String(s.id)===button.dataset.service);openDialog(`${icon(s.icon)}<h2>${e(s.title)}</h2><p>${e(s.description)}</p><p>Nous définissons ensemble le périmètre, les étapes et les délais de votre projet. Vous bénéficiez d’un suivi de la conception à la mise en ligne.</p><a class="button" href="/contact?subject=${encodeURIComponent(s.title)}">Discutons de votre projet ${icon('arrow-right')}</a>`);}));icons();
 }catch(error){errorState(grid,error,load);}};load();
}
if(page==='skills') {
 const grid=document.querySelector('#skills-grid');
 const categories={'Front-end':['code-xml','Des interfaces modernes, intuitives et responsive pour une meilleure expérience utilisateur.'],'Back-end':['server','Des architectures robustes et sécurisées pour des applications performantes.'],'Outils & DevOps':['database','Des outils modernes pour un développement efficace et un déploiement simplifié.'],'Design & Autres':['palette','Des outils pour créer des interfaces attrayantes et des solutions complètes.']};
 const load=async()=>{try {
  const skills=await apiGet('/skills');
  grid.innerHTML=Object.entries(categories).map(([cat,[ic,desc]])=>`<article class="panel skill-card"><div class="skill-heading">${icon(ic)}<h2>${e(cat)}</h2></div><p>${desc}</p><div class="skill-list">${skills.filter(s=>s.category===cat).map(s=>`<div class="skill-row">${['html','css','js','react','next','php','laravel','node','mysql','mongo','git','docker','github','linux','postman','tailwind','figma','xd','vscode','express'].includes(s.icon)?`<img class="skill-logo skill-logo-${e(s.icon)}" src="/assets/icons/${e(s.icon)}.svg" alt="" width="25" height="25">`:`<span class="skill-symbol">${e(s.name.slice(0,2))}</span>`}<span>${e(s.name)}</span><div class="skill-bar" role="meter" aria-label="${e(s.name)}" aria-valuenow="${Number(s.percentage)}" aria-valuemin="0" aria-valuemax="100"><span style="width:${Math.min(100,Math.max(0,Number(s.percentage)))}%"></span></div><span>${Number(s.percentage)}%</span></div>`).join('')||'<p>Compétences à venir.</p>'}</div></article>`).join('');
  icons();const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.2});grid.querySelectorAll('.skill-row').forEach(row=>observer.observe(row));
 }catch(error){errorState(grid,error,load);}};load();
}
apiGet('/settings/public').then(settings=>{
 if(settings.availability==='false')document.querySelectorAll('.availability').forEach(el=>{el.textContent='Discutons de votre prochain projet';});
 const social=document.querySelector('.social-links');
 if(social)for(const [key,name] of [['linkedin_url','linkedin'],['github_url','github'],['instagram_url','instagram']]){const url=safeURL(settings[key]);if(url)social.insertAdjacentHTML('beforeend',`<a href="${e(url)}" target="_blank" rel="noopener noreferrer" aria-label="${name}">${icon(name)}</a>`);}icons();
}).catch(()=>{});
