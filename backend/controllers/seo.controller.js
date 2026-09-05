import {pool} from '../config/database.js';
import {getSeoSettings,xmlEscape} from '../services/seo.service.js';

export async function sitemap(req,res) {
  const settings = await getSeoSettings();
  const base = settings.site_url.replace(/\/$/,'');
  const [projects] = await pool.query("SELECT slug,updated_at FROM projects WHERE status='published' ORDER BY updated_at DESC");
  const pages = [['/',1,'weekly'],['/about',.8,'monthly'],['/services',.9,'monthly'],['/projects',.9,'weekly'],['/skills',.8,'monthly'],['/contact',.8,'monthly']];
  const entries = pages.map(([path,priority,frequency])=>`<url><loc>${xmlEscape(base+path)}</loc><changefreq>${frequency}</changefreq><priority>${priority.toFixed(1)}</priority></url>`).concat(projects.map(project=>`<url><loc>${xmlEscape(`${base}/projects/${project.slug}`)}</loc><lastmod>${new Date(project.updated_at).toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`));
  res.type('application/xml').set('Cache-Control','public, max-age=3600').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join('')}</urlset>`);
}

export async function robots(req,res) {
  const settings = await getSeoSettings();
  res.type('text/plain').set('Cache-Control','public, max-age=3600').send(`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: ${settings.site_url.replace(/\/$/,'')}/sitemap.xml\n`);
}
