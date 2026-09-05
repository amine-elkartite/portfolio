import {apiGet,apiPut,icons} from './api.js';
const me=await apiGet('/auth/me').catch(()=>null);if(!me)location.assign('/admin/login.html');
if(me){document.querySelector('#profile-name').textContent=me.name;document.querySelector('#profile-email').textContent=me.email;}
document.querySelectorAll('[data-password]').forEach(button=>button.addEventListener('click',async()=>{const current_password=prompt('Mot de passe actuel');const new_password=prompt('Nouveau mot de passe (12 caractères minimum)');if(!current_password||!new_password)return;try{await apiPut('/settings/password',{current_password,new_password});location.assign('/admin/login.html');}catch(error){alert(error.message);}}));icons();
