import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
const base=process.env.TEST_BASE_URL||'http://localhost:5000';
const marker='test-'+randomBytes(5).toString('hex');
let cookie='';
const created=[];
async function call(path,{method='GET',body,auth=true,headers={}}={}){
 const response=await fetch(base+'/api'+path,{method,headers:{...(body&&!(body instanceof FormData)?{'Content-Type':'application/json'}:{}),...(auth&&cookie?{Cookie:cookie}:{}),'X-Requested-With':'Portfolio',...headers},body:body?body instanceof FormData?body:JSON.stringify(body):undefined});
 const result=await response.json();return {response,result};
}
after(async()=>{for(const [resource,id] of created.reverse()){try{await call(`/${resource}/${id}`,{method:'DELETE'});}catch{}}});
test('portfolio API integration',async t=>{
 await t.test('public endpoints and security headers',async()=>{for(const path of ['/health','/projects','/services','/skills','/settings/public']){const {response,result}=await call(path,{auth:false});assert.equal(response.status,200,path);assert.equal(result.success,true);assert.ok(response.headers.get('content-security-policy'));assert.equal(response.headers.get('x-powered-by'),null);}});
 await t.test('server-rendered SEO, clean URLs, sitemap and robots',async()=>{
  const pages=[['/','Amine ELKARTITE | Développeur Full-Stack au Maroc'],['/about','À propos | Amine ELKARTITE - Développeur Full-Stack'],['/services','Création de Sites Web & Applications | Amine ELKARTITE'],['/projects','Projets Web & Applications | Portfolio Amine ELKARTITE'],['/skills','Compétences Full-Stack | Amine ELKARTITE'],['/contact','Contact | Amine ELKARTITE - Développeur Web Maroc']];
  for(const [path,title] of pages){const response=await fetch(base+path);const html=await response.text();const encodedTitle=title.replace(/&/g,'&amp;');assert.equal(response.status,200,path);assert.match(html,new RegExp(`<title>${encodedTitle.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}</title>`));assert.match(html,/rel="canonical"/);assert.match(html,/property="og:image"/);assert.match(html,/name="twitter:card"/);assert.match(html,/application\/ld\+json/);assert.match(html,/name="robots" content="index, follow/);}
  const legacy=await fetch(base+'/about.html',{redirect:'manual'});assert.equal(legacy.status,301);assert.equal(legacy.headers.get('location'),'/about');
  const project=await fetch(base+'/projects/le-gourmet');const projectHTML=await project.text();assert.equal(project.status,200);assert.match(projectHTML,/<h1>Le Gourmet<\/h1>/);assert.match(projectHTML,/BreadcrumbList/);assert.match(projectHTML,/CreativeWork/);
  const sitemap=await fetch(base+'/sitemap.xml');const xml=await sitemap.text();assert.equal(sitemap.headers.get('content-type').startsWith('application/xml'),true);assert.match(xml,/\/projects\/le-gourmet/);assert.doesNotMatch(xml,/\/admin/);
  const robots=await (await fetch(base+'/robots.txt')).text();assert.match(robots,/Disallow: \/admin\//);assert.match(robots,/Sitemap: https:\/\/amineelkartite.com\/sitemap.xml/);
  const missing=await fetch(base+'/not-a-real-page');assert.equal(missing.status,404);assert.match(missing.headers.get('x-robots-tag'),/noindex/);
  const admin=await fetch(base+'/admin/login.html');assert.match(admin.headers.get('x-robots-tag'),/noindex/);
 });
 await t.test('private routes require authentication',async()=>{for(const path of ['/messages','/clients','/tasks','/quotes','/invoices','/dashboard/stats','/projects/manage','/settings']){const {response}=await call(path,{auth:false});assert.equal(response.status,401,path);}});
 await t.test('contact validation rejects empty and invalid fields',async()=>{for(const body of [{},{name:' ',email:'bad',subject:'',message:''}]){const {response}=await call('/messages',{method:'POST',body,auth:false});assert.equal(response.status,422);}});
 await t.test('login rejects incorrect password',async()=>{const {response}=await call('/auth/login',{method:'POST',body:{email:'amineelkartite@gmail.com',password:'not-the-password'},auth:false});assert.equal(response.status,401);});
 await t.test('admin signs in with HttpOnly SameSite cookie',async()=>{const password=process.env.TEST_ADMIN_PASSWORD||(await readFile(new URL('../.local-admin.txt',import.meta.url),'utf8')).trim().split(' : ').at(-1);const {response,result}=await call('/auth/login',{method:'POST',auth:false,body:{email:'amineelkartite@gmail.com',password}});assert.equal(response.status,200);const set=response.headers.get('set-cookie');assert.match(set,/HttpOnly/i);assert.match(set,/SameSite=Strict/i);assert.ok(!result.token);cookie=set.split(';')[0];});
 await t.test('SEO settings expose only safe public values',async()=>{const admin=(await call('/settings')).result.data;assert.equal(admin.pages.length,6);assert.ok(admin.seo.site_url);const publicSettings=(await call('/settings/public',{auth:false})).result.data;assert.ok(publicSettings.siteName);assert.ok(publicSettings.defaultOgImage);assert.equal(publicSettings.google_site_verification,undefined);});
 await t.test('cross-origin mutations and missing CSRF header rejected',async()=>{let {response}=await call('/clients',{method:'POST',body:{},headers:{Origin:'https://attacker.example'}});assert.equal(response.status,403);response=await fetch(base+'/api/clients',{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},body:'{}'});assert.equal(response.status,403);});
 await t.test('project upload, draft privacy, publication, edit and deletion',async()=>{
 const payload={title:marker,description:'Integration test project',long_description:'Details',category:'Sites Web',technologies:'HTML5, JavaScript',status:'draft',featured:'true'};
 const form=new FormData();for(const [key,value] of Object.entries(payload))form.set(key,value);
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aG4kAAAAASUVORK5CYII=','base64');
 form.set('thumbnail',new Blob([png],{type:'image/png'}),'test.png');
 let {response,result}=await call('/projects',{method:'POST',body:form});assert.equal(response.status,201,JSON.stringify(result));const id=result.data.id;created.push(['projects',id]);assert.match(result.data.thumbnail,/^\/uploads\/projects\/.*\.png$/);const image=await fetch(base+result.data.thumbnail);assert.equal(image.status,200);
  assert.equal((await call('/projects/'+id,{auth:false})).response.status,404);
 assert.ok(!(await call('/projects',{auth:false})).result.data.some(p=>p.id===id));
  ({response,result}=await call('/projects/'+id,{method:'PUT',body:{...payload,technologies:['HTML5'],status:'published',featured:false,seo_title:'Integration SEO title',seo_description:'Integration SEO description'}}));assert.equal(response.status,200,JSON.stringify(result));assert.equal((await call('/projects/'+id,{auth:false})).response.status,200);assert.equal(result.data.seo_title,'Integration SEO title');
 assert.equal((await call('/projects/'+id,{method:'PUT',body:{...payload,live_url:'javascript:alert(1)'}})).response.status,422);
 const fake=new FormData();for(const [key,value] of Object.entries(payload))fake.set(key,value);fake.set('thumbnail',new Blob(['<script>alert(1)</script>'],{type:'image/png'}),'fake.png');assert.equal((await call('/projects',{method:'POST',body:fake})).response.status,422);
 });
 await t.test('CRUD services, skills, clients, tasks, quotes and invoices',async()=>{
 const payloads={services:{title:marker,description:'Test service',icon:'code-xml',order_position:99,active:false},skills:{name:marker,category:'Front-end',percentage:80,icon:'js',order_position:99},clients:{name:marker,email:'integration@example.com',company:'Test',phone:'0123456789',notes:'Temporary'},tasks:{title:marker,description:'Test task',status:'todo',priority:'high',due_date:new Date().toISOString().slice(0,10)},quotes:{number:marker+'-Q',title:marker,amount:1200,status:'draft'},invoices:{number:marker+'-I',title:marker,amount:350,status:'paid'}};
 for(const [resource,payload] of Object.entries(payloads)){
  let {response,result}=await call('/'+resource,{method:'POST',body:payload});assert.equal(response.status,201,resource+JSON.stringify(result));const id=result.data.id;created.push([resource,id]);
  ({response,result}=await call(`/${resource}/${id}`,{method:'PUT',body:payload}));assert.equal(response.status,200,resource+JSON.stringify(result));
  assert.equal((await call(`/${resource}/${id}`)).response.status,200);
  if(resource==='services')assert.ok(!(await call('/services',{auth:false})).result.data.some(s=>s.id===id));
 }
 assert.equal((await call('/skills',{method:'POST',body:{...payloads.skills,percentage:101}})).response.status,422);
 const dashboard=(await call('/dashboard/stats')).result.data;assert.ok(dashboard.revenue>=350);assert.ok(dashboard.today_tasks.some(t=>t.title===marker));
 });
 await t.test('contact persists, statuses update, mass assignment blocked',async()=>{
 const {response}=await call('/messages',{auth:false,method:'POST',body:{name:marker,email:'sender@example.com',subject:'Contact test',message:'A real message',status:'replied'}});assert.equal(response.status,201);
 const row=(await call('/messages')).result.data.find(m=>m.name===marker);assert.ok(row);assert.equal(row.status,'unread');created.push(['messages',row.id]);
 assert.equal((await call(`/messages/${row.id}/status`,{method:'PATCH',body:{status:'read'}})).response.status,200);
 assert.equal((await call(`/messages/${row.id}/status`,{method:'PATCH',body:{status:'invalid'}})).response.status,422);
 });
 await t.test('SQL-like invalid ids and absent resources are handled',async()=>{assert.equal((await call('/projects/1%20OR%201=1')).response.status,422);assert.equal((await call('/projects/99999999')).response.status,404);assert.equal((await call('/missing')).response.status,404);});
});
