import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {pool} from '../config/database.js';

const frontend = fileURLToPath(new URL('../../frontend/', import.meta.url));
const pageFiles = {home:'index.html',about:'about.html',services:'services.html',projects:'projects.html',skills:'skills.html',contact:'contact.html'};
const paths = {home:'/',about:'/about',services:'/services',projects:'/projects',skills:'/skills',contact:'/contact'};
const fallback = {
  site_name:'Amine ELKARTITE', site_url:'https://amineelkartite.com',
  default_title:'Amine ELKARTITE | Développeur Full-Stack au Maroc',
  default_description:"Portfolio d'Amine ELKARTITE, développeur Full-Stack au Maroc. Sites web, applications, e-commerce, APIs et solutions digitales sur mesure.",
  default_og_image:'/assets/images/og-cover.jpg', google_site_verification:'', bing_site_verification:'', google_analytics_id:process.env.GA_MEASUREMENT_ID || ''
};

export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const absolute = (value, base) => { try { return new URL(value, base).href; } catch { return base; } };
export const xmlEscape = value => escapeHTML(value).replace(/&#39;/g,'&apos;');

export async function getSeoSettings() {
  const [rows] = await pool.query('SELECT * FROM seo_settings ORDER BY id LIMIT 1');
  const settings={...fallback,...rows[0]};
  if(!settings.google_analytics_id)settings.google_analytics_id=process.env.GA_MEASUREMENT_ID || '';
  return settings;
}

export async function getPageSeo(pageKey) {
  const [rows] = await pool.execute('SELECT * FROM page_seo WHERE page_key = ?', [pageKey]);
  return rows[0] || {};
}

function jsonScript(data) {
  return JSON.stringify(data).replace(/</g,'\\u003c').replace(/-->/g,'--\\u003e');
}

function metadata({title,description,canonical,image,type='website',settings,schemas=[]}) {
  const verification = `${settings.google_site_verification ? `<meta name="google-site-verification" content="${escapeHTML(settings.google_site_verification)}">` : ''}${settings.bing_site_verification ? `<meta name="msvalidate.01" content="${escapeHTML(settings.bing_site_verification)}">` : ''}`;
  const analytics = /^G-[A-Z0-9]+$/i.test(settings.google_analytics_id || '') ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${escapeHTML(settings.google_analytics_id)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${escapeHTML(settings.google_analytics_id)}',{anonymize_ip:true});</script>` : '';
  return `<title>${escapeHTML(title)}</title>
<meta name="description" content="${escapeHTML(description)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="author" content="Amine ELKARTITE">
<link rel="canonical" href="${escapeHTML(canonical)}">
<meta property="og:type" content="${type}"><meta property="og:title" content="${escapeHTML(title)}"><meta property="og:description" content="${escapeHTML(description)}"><meta property="og:url" content="${escapeHTML(canonical)}"><meta property="og:image" content="${escapeHTML(image)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Portfolio Amine ELKARTITE - Développeur Full-Stack"><meta property="og:site_name" content="${escapeHTML(settings.site_name)}"><meta property="og:locale" content="fr_FR">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHTML(title)}"><meta name="twitter:description" content="${escapeHTML(description)}"><meta name="twitter:image" content="${escapeHTML(image)}">
<link rel="preload" href="/assets/fonts/InterVariable.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/images/amine-elkartite-full-stack-developer.webp" as="image" fetchpriority="high">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"><link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest">
${verification}${schemas.map(schema => `<script type="application/ld+json">${jsonScript(schema)}</script>`).join('')}${analytics}`;
}

function inject(html, meta) {
  return html.replace(/<title>[\s\S]*?<\/title>/i,'').replace(/<meta\s+name="description"[^>]*>/gi,'').replace(/<meta\s+property="og:[^"]+"[^>]*>/gi,'').replace(/<meta\s+name="twitter:[^"]+"[^>]*>/gi,'').replace(/<link\s+rel="icon"[^>]*>/gi,'').replace('</head>',`${meta}</head>`);
}

export async function renderPublicPage(pageKey) {
  const [settings,page] = await Promise.all([getSeoSettings(),getPageSeo(pageKey)]);
  const base = settings.site_url.replace(/\/$/,'');
  const title = page.seo_title || settings.default_title;
  const description = page.seo_description || settings.default_description;
  const canonical = absolute(page.canonical_url || paths[pageKey],base+'/');
  const image = absolute(page.og_image || settings.default_og_image,base+'/');
  const [settingsRows,html] = await Promise.all([pool.query("SELECT setting_key,setting_value FROM settings WHERE setting_key IN ('linkedin_url','github_url','instagram_url')"),readFile(frontend+pageFiles[pageKey],'utf8')]);
  const socials = settingsRows[0].map(row=>row.setting_value).filter(Boolean);
  const person = {'@context':'https://schema.org','@type':'Person',name:'Amine ELKARTITE',url:base,image:absolute('/assets/images/profile.webp',base+'/'),jobTitle:'Full-Stack Developer',email:'mailto:amineelkartite@gmail.com',telephone:'+212704879403',address:{'@type':'PostalAddress',addressCountry:'MA'},knowsAbout:['HTML5','CSS3','JavaScript','Node.js','Express.js','PHP','Laravel','MySQL','MongoDB','React','Next.js','Web Development','REST APIs'],...(socials.length?{sameAs:socials}:{})};
  const website = {'@context':'https://schema.org','@type':'WebSite',name:`${settings.site_name} Portfolio`,url:base,inLanguage:'fr-FR'};
  const service = {'@context':'https://schema.org','@type':'ProfessionalService',name:'Amine ELKARTITE - Développement Web',url:base,email:'amineelkartite@gmail.com',telephone:'+212704879403',areaServed:{'@type':'Country',name:'Morocco'},description:settings.default_description};
  return inject(html,metadata({title,description,canonical,image,settings,schemas:[person,website,service]}));
}

export async function renderProject(project) {
  const settings = await getSeoSettings();
  const base = settings.site_url.replace(/\/$/,'');
  const canonical = `${base}/projects/${encodeURIComponent(project.slug)}`;
  const title = project.seo_title || `${project.title} | Projet réalisé par Amine ELKARTITE`;
  const description = project.seo_description || `Découvrez ${project.title}, ${project.description.toLocaleLowerCase('fr')} Projet réalisé par Amine ELKARTITE.`.slice(0,320);
  const socialCandidate = project.og_image || (/\.(?:jpe?g|png|webp|avif)$/i.test(project.thumbnail || '') ? project.thumbnail : settings.default_og_image);
  const image = absolute(socialCandidate,base+'/');
  const technologies = Array.isArray(project.technologies) ? project.technologies : JSON.parse(project.technologies || '[]');
  const breadcrumb = {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Accueil',item:base+'/'},{'@type':'ListItem',position:2,name:'Projets',item:base+'/projects'},{'@type':'ListItem',position:3,name:project.title}]};
  const creative = {'@context':'https://schema.org','@type':'CreativeWork',name:project.title,url:canonical,description,image,creator:{'@type':'Person',name:'Amine ELKARTITE'},keywords:technologies.join(', ')};
  let html = await readFile(frontend+'project.html','utf8');
  const links = `${project.live_url ? `<a class="button" href="${escapeHTML(project.live_url)}" target="_blank" rel="noopener noreferrer">Voir le projet en ligne</a>` : ''}${project.github_url ? `<a class="button secondary" href="${escapeHTML(project.github_url)}" target="_blank" rel="noopener noreferrer">Voir le code source</a>` : ''}`;
  html = html.replaceAll('{{TITLE}}',escapeHTML(project.title)).replace('{{CATEGORY}}',escapeHTML(project.category)).replace('{{DESCRIPTION}}',escapeHTML(project.description)).replace('{{LONG_DESCRIPTION}}',escapeHTML(project.long_description || project.description)).replace('{{IMAGE}}',escapeHTML(project.thumbnail || '/assets/images/og-cover.jpg')).replace('{{TECHNOLOGIES}}',technologies.map(item=>`<span class="badge">${escapeHTML(item)}</span>`).join('')).replace('{{PROJECT_LINKS}}',links);
  return inject(html,metadata({title,description,canonical,image,type:'article',settings,schemas:[breadcrumb,creative]}));
}
