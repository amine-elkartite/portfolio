import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { del, put } from '@vercel/blob';
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const directory = fileURLToPath(new URL('../uploads/projects/', import.meta.url));
const blobEnabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
export const upload = multer({storage:multer.memoryStorage(),limits:{fileSize:4.5*1024*1024,files:1,fields:20,parts:21},fileFilter(req,file,cb) {
  const valid = ['image/jpeg','image/png','image/webp'].includes(file.mimetype) && /\.(jpe?g|png|webp)$/i.test(file.originalname);
  cb(valid ? null : Object.assign(new Error('Image JPG, PNG ou WebP requise.'),{status:422}),valid);
}});
export async function saveImage(file) {
  if (!file) return undefined;
  const b=file.buffer;
  const ext=b.length>3 && b[0]===255 && b[1]===216 && b[2]===255 ? 'jpg' : b.length>8 && b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? 'png' : b.length>12 && b.toString('ascii',0,4)==='RIFF' && b.toString('ascii',8,12)==='WEBP' ? 'webp' : null;
  if (!ext) throw Object.assign(new Error('Le contenu du fichier ne correspond pas à une image autorisée.'),{status:422});
  const filename=`${randomUUID()}.${ext}`;
  if (blobEnabled()) {
    const blob=await put(`projects/${filename}`,b,{access:'public',addRandomSuffix:false,contentType:file.mimetype});
    return blob.url;
  }
  if (process.env.VERCEL==='1') throw Object.assign(new Error('Le stockage des images n’est pas configuré.'),{status:503});
  await mkdir(directory,{recursive:true});
  await writeFile(directory+filename,b,{flag:'wx'});
  return '/uploads/projects/'+filename;
}
// Only remove generated upload names; never remove bundled assets or arbitrary paths.
export async function removeImage(url) {
  if (/^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\/projects\/[a-f0-9-]+\.(jpg|png|webp)$/.test(url || '')) {
    try { await del(url); } catch (error) { console.error('[upload cleanup]',error.code || error.name); }
    return;
  }
  if (!/^\/uploads\/projects\/[a-f0-9-]+\.(jpg|png|webp)$/.test(url || '')) return;
  const {unlink} = await import('node:fs/promises');
  try { await unlink(directory + url.split('/').at(-1)); }
  catch (error) { if (error.code !== 'ENOENT') console.error('[upload cleanup]',error.code); }
}
