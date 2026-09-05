import {chromium} from '@playwright/test';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
const context=await browser.newContext({viewport:{width:1536,height:1024}});
const page=await context.newPage();
const errors=[];page.on('pageerror',err=>errors.push(err.message));
const failed=[];page.on('response',res=>{if(res.status()>=400 && !res.url().includes('/auth/me'))failed.push(res.status()+' '+res.url());});
const artifact=process.env.TEST_ARTIFACT_DIR||join(tmpdir(),'amine-portfolio-check');await mkdir(artifact,{recursive:true});
try{
 for(const route of ['','about','services','projects','skills','contact']){
  await page.goto('http://localhost:5000/'+route);await page.waitForLoadState('networkidle');
  assert.equal(await page.locator('h1').count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,route+' horizontal overflow');
  if(route==='services')assert.equal(await page.locator('.service-card').count(),8);
  if(route==='projects')assert.equal(await page.locator('.project-card').count(),6);
  if(route==='skills')assert.equal(await page.locator('.skill-row').count(),20);
  await page.screenshot({path:`${artifact}/${route||'index'}-desktop.png`,fullPage:true});
 }
 await page.goto('http://localhost:5000/projects');await page.locator('.project-card').first().waitFor();
 await page.getByRole('button',{name:'E-commerce',exact:true}).click();assert.equal(await page.locator('.project-card').count(),1);
 await page.getByRole('link',{name:'Voir le projet'}).click();await page.waitForURL('**/projects/mode-style');assert.match(await page.locator('main').innerText(),/Mode & Style/);assert.equal(await page.locator('script[type="application/ld+json"]').count(),2);await page.goto('http://localhost:5000/projects');
 await page.locator('#project-search').fill('no-results');await page.getByRole('button',{name:'Réinitialiser les filtres'}).click();assert.equal(await page.locator('.project-card').count(),6);
 // Mobile navigation and overflow at narrow and tablet widths.
 for(const width of [390,768]){
  await page.setViewportSize({width,height:844});
  for(const route of ['','about','services','projects','skills','contact']){
   await page.goto('http://localhost:5000/'+route);await page.waitForLoadState('networkidle');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,route+' overflow '+width);
   if(width===390)await page.screenshot({path:`${artifact}/${route||'index'}-mobile.png`,fullPage:true});
  }
 }
 await page.setViewportSize({width:390,height:844});await page.goto('http://localhost:5000/');await page.getByRole('button',{name:'Ouvrir le menu'}).click();await page.locator('#navigation').getByRole('link',{name:'Projets',exact:true}).click();await page.waitForURL('**/projects');
 await page.setViewportSize({width:1536,height:1024});
 await page.goto('http://localhost:5000/admin/login.html');
 const password=process.env.TEST_ADMIN_PASSWORD||(await readFile(new URL('../.local-admin.txt',import.meta.url),'utf8')).trim().split(' : ').at(-1);
 await page.getByLabel('Adresse email').fill('amineelkartite@gmail.com');await page.locator('input[name=password]').fill(password);await page.getByRole('button',{name:'Se connecter'}).click();await page.waitForURL('**/admin/dashboard.html');await page.locator('.kpi').first().waitFor();await page.waitForTimeout(1100);
 await page.screenshot({path:`${artifact}/admin-dashboard-desktop.png`,fullPage:true});
 for(const route of ['projects','services','skills','messages','clients','tasks','quotes','invoices','statistics','settings','project-form']){
  await page.goto('http://localhost:5000/admin/'+route+'.html');await page.waitForLoadState('networkidle');
  assert.ok(!(await page.locator('#admin-content').innerText()).includes('Contenu indisponible'),route+' unavailable');
  assert.ok(!(await page.locator('#admin-content').innerText()).includes('Connexion à votre espace'),route+' still loading');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'admin '+route+' overflow');
 }
 // Create/edit/delete a client through the interface.
 await page.goto('http://localhost:5000/admin/clients.html');await page.getByRole('button',{name:'Ajouter client'}).click();await page.getByLabel('Nom complet').fill('Browser Test Client');await page.getByLabel('Email',{exact:false}).fill('browser@example.com');await page.getByRole('button',{name:'Créer',exact:true}).click();await page.getByRole('button',{name:'Modifier Browser Test Client'}).waitFor();await page.getByRole('button',{name:'Modifier Browser Test Client'}).click();await page.getByLabel('Entreprise').fill('Browser Test Company');await page.getByRole('button',{name:'Enregistrer',exact:true}).click();await page.getByText('Browser Test Company',{exact:true}).waitFor();await page.getByRole('button',{name:'Supprimer Browser Test Client'}).click();await page.locator('#confirm-delete').click();await page.locator('dialog[open]').waitFor({state:'hidden'});
 // Contact submission goes into the same inbox, then is marked read and removed.
 await page.goto('http://localhost:5000/contact');await page.getByLabel('Votre nom').fill('Browser Test Message');await page.getByLabel('Votre email').fill('browser@example.com');await page.getByLabel('Sujet').selectOption('Site web vitrine');await page.getByLabel('Votre message').fill('Bonjour, voici un message de test navigateur.');await page.getByRole('button',{name:'Envoyer le message'}).click();await page.locator('#form-status').filter({hasText:'Votre message a été envoyé avec succès.'}).waitFor();
 await page.goto('http://localhost:5000/admin/messages.html');await page.getByRole('button',{name:'Lire Browser Test Message'}).click();await page.getByRole('button',{name:'Marquer lu',exact:true}).click();await page.getByRole('button',{name:'Supprimer Browser Test Message'}).click();await page.locator('#confirm-delete').click();await page.locator('dialog[open]').waitFor({state:'hidden'});
 await page.setViewportSize({width:390,height:844});
 for(const route of ['dashboard','projects','settings']){
  await page.goto('http://localhost:5000/admin/'+route+'.html');await page.waitForLoadState('networkidle');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'admin mobile '+route+' overflow');await page.screenshot({path:`${artifact}/admin-${route}-mobile.png`,fullPage:true});
 }
 await page.getByRole('button',{name:'Se déconnecter'}).click();await page.waitForURL('**/admin/login.html');
 assert.deepEqual(errors,[],'browser exceptions');assert.deepEqual(failed,[],'failed HTTP requests');
 console.log('PASS: 6 public pages, clean URLs, project SEO page, desktop/mobile layouts, admin pages, client CRUD, contact→inbox, logout.');
 await writeFile(artifact+'/results.json',JSON.stringify({status:'passed',errors,failed},null,2));
}finally{await browser.close();}
