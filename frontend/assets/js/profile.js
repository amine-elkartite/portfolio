import {apiGet,apiPut,apiPost,escapeHTML as e,safeURL,icon,icons,toast,openDialog} from './api.js';

export async function renderProfile(me) {
 const results=await Promise.allSettled([apiGet('/dashboard/stats'),apiGet('/skills'),apiGet('/settings')]);
 const [stats,skills,settings]=results.map((r,i)=>r.status==='fulfilled'?r.value:[{},[],{}][i]);
 const name=e(me.name), email=e(me.email);
 const initials=e(me.name.split(' ').filter(Boolean).map(n=>n[0]).slice(0,2).join(''));
 const avatar=safeURL(me.avatar,true);
 const heading=(symbol,title,link='')=>`<header class="profile-card-heading">${icon(symbol)}<h2>${title}</h2>${link}</header>`;
 const row=(symbol,label,value)=>`<div class="profile-detail">${icon(symbol)}<span>${label}</span><div>${value}</div></div>`;
 document.querySelector('#page-actions').innerHTML=`<span class="date-label">${new Date().toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'long',year:'numeric'})} ${icon('calendar-days')}</span>`;
 document.querySelector('#admin-content').innerHTML=`
 <section class="profile-banner panel">
 <div class="profile-identity-photo"><div class="profile-large-avatar" id="profile-avatar">${avatar?`<img src="${e(avatar)}" alt="Photo de profil">`:initials}</div><span class="profile-online">En ligne</span></div>
 <div class="profile-identity"><h2>${name}</h2><strong>Administrateur</strong><p>Développeur Full-Stack</p><div class="profile-contact"><span>${icon('map-pin')}Maroc (à distance)</span><span>${icon('mail')}${email}</span><span>${icon('phone')}0704879403</span></div></div>
 <blockquote>« Du code aujourd’hui,<br>un meilleur demain. »</blockquote>
 <div class="profile-actions"><a class="button" href="/admin/settings.html">${icon('pencil')}Modifier les paramètres</a><button class="button secondary" id="change-avatar">${icon('camera')}Changer la photo</button><input id="avatar-file" type="file" accept="image/jpeg,image/png,image/webp" hidden><small id="avatar-status" role="status"></small></div>
 </section>
 <div class="profile-stats">
 ${[['folder',stats.projects??'—','Projets au portfolio','Des idées transformées en réalité'],['users',stats.clients??'—','Clients','Une relation de confiance'],['graduation-cap','5+','Années d’apprentissage','Toujours en évolution'],['heart','Passion','pour le code','Plus qu’un métier, une passion']].map(([symbol,value,label,note])=>`<article class="panel profile-stat"><span class="profile-icon">${icon(symbol)}</span><div><strong>${e(value)}</strong><p>${label}</p><small>${note}</small></div></article>`).join('')}
 </div>
 <div class="profile-middle">
 <section class="panel profile-card">${heading('user-round','Informations personnelles')}
 ${row('user-round','Nom complet',name)}${row('users','Rôle','Administrateur')}${row('mail','Email',email)}${row('phone','Téléphone','0704879403')}${row('map-pin','Localisation','Maroc (à distance)')}${row('languages','Langues','Français, Arabe, Anglais')}${row('map-pin','Bio','Développeur Full-Stack passionné par la création de solutions digitales innovantes. J’aime transformer des idées en produits concrets et performants.')}
 </section>
 <section class="panel profile-card">${heading('shield','Sécurité du compte')}
 <div class="profile-security"><span class="profile-icon">${icon('lock-keyhole')}</span><div><strong>Mot de passe</strong><small>Protégez votre compte</small></div><button class="button secondary" id="change-password">Changer</button></div>
 <div class="profile-security"><span class="profile-icon">${icon('smartphone')}</span><div><strong>Authentification à deux facteurs</strong><small>Cette fonction n’est pas encore disponible</small></div><span class="profile-muted">À venir</span></div>
 <div class="profile-security"><span class="profile-icon">${icon('monitor')}</span><div><strong>Session actuelle</strong><small>Connexion sécurisée par cookie HttpOnly</small></div><span class="profile-online">Ce navigateur</span></div>
 <div class="profile-security"><span class="profile-icon">${icon('log-out')}</span><div><strong>Déconnexion</strong><small>Fermez votre session en toute sécurité</small></div><button class="button secondary" id="profile-logout">Se déconnecter</button></div>
 </section></div>
 <div class="profile-bottom">
 <section class="panel profile-card">${heading('code-xml','Mes compétences','<a href="/admin/skills.html">Voir toutes →</a>')}<div class="profile-skills">${(Array.isArray(skills)?skills:[]).map(s=>`<span>${icon('code-xml')}${e(s.name)}</span>`).join('')||'<p>Aucune compétence renseignée.</p>'}</div></section>
 <section class="panel profile-card">${heading('share-2','Liens sociaux')}<div class="profile-socials">${[['linkedin','LinkedIn',settings.linkedin_url],['github','GitHub',settings.github_url],['instagram','Instagram',settings.instagram_url],['globe','Site web','/']].map(([symbol,label,url])=>safeURL(url,true)?`<a href="${e(safeURL(url,true))}" target="_blank" rel="noopener">${icon(symbol)}<strong>${label}</strong><span>${e(url==='/'?location.hostname:new URL(url).hostname)}</span>${icon('arrow-right')}</a>`:'').join('')}<a href="/admin/settings.html">${icon('pencil')}Configurer mes liens ${icon('arrow-right')}</a></div></section>
 <section class="panel profile-card">${heading('clock','Activité récente','<a href="/admin/projects.html">Voir tout →</a>')}<div class="profile-timeline">${(stats.recent_projects||[]).slice(0,5).map(p=>`<a href="/admin/project-form.html?id=${p.id}"><span></span><div><strong>${e(p.title)}</strong><small>Projet créé · ${new Date(p.created_at).toLocaleDateString('fr-FR')}</small></div>${icon('folder')}</a>`).join('')||'<p>Aucun projet récent.</p>'}</div></section>
 </div>`;
 const input=document.querySelector('#avatar-file'),button=document.querySelector('#change-avatar'),status=document.querySelector('#avatar-status');
 button.addEventListener('click',()=>input.click());
 input.addEventListener('change',async()=>{
  const file=input.files?.[0];if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>4.5*1024*1024){status.textContent='JPG, PNG ou WebP, 4,5 Mo maximum.';input.value='';return;}
  button.disabled=true;status.textContent='Enregistrement de la photo…';
  try {const form=new FormData();form.set('avatar',file);const data=await apiPost('/settings/avatar',form);
   for(const node of document.querySelectorAll('#profile-avatar,.admin-user .avatar')){node.innerHTML=`<img src="${e(safeURL(data.avatar,true))}" alt="Photo de profil">`;node.classList.add('avatar-image');}
   status.textContent='Photo enregistrée.';toast('Photo de profil mise à jour.');
  }catch(error){status.textContent=error.message;toast(error.message,true);}
  finally{button.disabled=false;input.value='';}
 });
 document.querySelector('#profile-logout').addEventListener('click',()=>document.querySelector('#logout').click());
 document.querySelector('#change-password').addEventListener('click',()=>{
  openDialog('<h2>Changer le mot de passe</h2><form id="profile-password" class="editor-form"><label>Mot de passe actuel<input name="current_password" type="password" autocomplete="current-password" required maxlength="72"></label><label>Nouveau mot de passe<input name="new_password" type="password" autocomplete="new-password" required minlength="12" maxlength="72"><small>12 caractères minimum.</small></label><p class="form-error" role="alert"></p><button class="button" type="submit">Enregistrer</button></form>');
  document.querySelector('#profile-password').addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget,submit=form.querySelector('button');submit.disabled=true;try{await apiPut('/settings/password',Object.fromEntries(new FormData(form)));location.assign('/admin/login.html');}catch(error){form.querySelector('.form-error').textContent=error.message;submit.disabled=false;}});
 });
 icons();
}
