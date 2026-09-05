import {apiGet,escapeHTML as e,safeURL,icons,icon,errorState} from './api.js';
const grid=document.querySelector('#projects-grid'),search=document.querySelector('#project-search');
let projects=[],category='Tous';
function technologies(p){try{return Array.isArray(p.technologies)?p.technologies:JSON.parse(p.technologies||'[]');}catch{return [];}}
function image(p){return safeURL(p.thumbnail,true)||'/assets/images/project-portfolio.svg';}
function render(){
 const query=search.value.trim().toLocaleLowerCase('fr');
 const filtered=projects.filter(p=>(category==='Tous'||p.category===category)&&[p.title,p.description,p.category,...technologies(p)].join(' ').toLocaleLowerCase('fr').includes(query));
 document.querySelector('#project-count').textContent=`${filtered.length} projet(s) affiché(s)`;
 grid.innerHTML=filtered.length?filtered.map(p=>`<article class="panel project-card reveal"><a href="/projects/${encodeURIComponent(p.slug)}"><img class="project-image" src="${e(image(p))}" alt="Interface du projet ${e(p.title)} développée par Amine ELKARTITE" loading="lazy" width="600" height="245"></a><div class="project-info"><h2><a href="/projects/${encodeURIComponent(p.slug)}">${e(p.title)}</a></h2><p>${e(p.description)}</p><div class="project-meta"><div class="badges">${technologies(p).slice(0,3).map(t=>`<span class="badge">${e(t)}</span>`).join('')}</div><a class="text-link" href="/projects/${encodeURIComponent(p.slug)}">Voir le projet ${icon('arrow-up-right')}</a></div></div></article>`).join(''):'<div class="panel empty-state"><h2>Aucun projet trouvé</h2><p>Essayez une autre recherche ou une autre catégorie.</p><button class="button" id="reset-filters">Réinitialiser les filtres</button></div>';
 grid.querySelector('#reset-filters')?.addEventListener('click',()=>{search.value='';document.querySelector('[data-filter="Tous"]').click();});icons();
}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});render();}));
search.addEventListener('input',render);
async function load(){try{projects=await apiGet('/projects');render();}catch(error){errorState(grid,error,load);}}
load();
