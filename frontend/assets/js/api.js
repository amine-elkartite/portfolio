// Same-origin API: no hard-coded development host and no token in localStorage.
export const API_URL = '/api';
export async function request(path, options = {}) {
  const isForm = options.body instanceof FormData;
  const response = await fetch(API_URL + path, {
    ...options, credentials: 'same-origin',
    headers: { ...(!isForm && options.body ? {'Content-Type':'application/json'} : {}), 'X-Requested-With':'Portfolio', ...options.headers },
    body: options.body ? isForm ? options.body : JSON.stringify(options.body) : undefined,
    signal: options.signal || AbortSignal.timeout(20000)
  });
  let result;
  try { result = await response.json(); } catch { throw new Error('Le serveur ne répond pas. Veuillez réessayer.'); }
  if (!response.ok || !result.success) {
    const error = new Error(result.message || 'Une erreur est survenue.');
    error.status = response.status; error.fields = result.errors; throw error;
  }
  return result.data;
}
export const apiGet = path => request(path);
export const apiPost = (path,body) => request(path,{method:'POST',body});
export const apiPut = (path,body) => request(path,{method:'PUT',body});
export const apiPatch = (path,body) => request(path,{method:'PATCH',body});
export const apiDelete = path => request(path,{method:'DELETE'});
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeURL(value, local = false) {
  if (local && /^\/(?!\/)[a-zA-Z0-9/_.-]+$/.test(value || '')) return value;
  try { const url = new URL(value); return ['https:','http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
}
export function icons() { window.lucide?.createIcons(); }
export const icon = name => `<i data-lucide="${escapeHTML(/^[a-z0-9-]+$/.test(name) ? name : 'code-xml')}" aria-hidden="true"></i>`;
export function toast(message,error=false) {
  const region=document.querySelector('#toast-region'); if(!region)return;
  const item=document.createElement('div');item.className='toast'+(error?' error':'');item.textContent=message;
  region.append(item);setTimeout(()=>item.remove(),6500);
}
export function errorState(container,error,retry) {
  container.innerHTML=`<div class="panel empty-state"><h2>Contenu indisponible</h2><p>${escapeHTML(error.message)}</p><button class="button">Réessayer</button></div>`;
  container.querySelector('button').addEventListener('click',retry);
}
export function openDialog(content) {
  const dialog=document.querySelector('#detail-dialog');
  dialog.querySelector('.dialog-content').innerHTML=content;icons();dialog.showModal();
}
export function initDialog() {
  const dialog=document.querySelector('#detail-dialog');if(!dialog)return;
  dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
}
