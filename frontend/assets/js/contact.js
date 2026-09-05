import {apiPost,toast} from './api.js';
const form=document.querySelector('#contact-form'),message=form.elements.message;
message.addEventListener('input',()=>{form.querySelector('.character-count').textContent=`${message.value.length}/5000`;});
const subject=new URLSearchParams(location.search).get('subject');
if(subject){let option=[...form.elements.subject.options].find(o=>o.value.toLocaleLowerCase()===subject.toLocaleLowerCase());if(!option){option=new Option(subject,subject);form.elements.subject.add(option);}option.selected=true;}
form.addEventListener('submit',async event=>{
 event.preventDefault();if(!form.reportValidity())return;
 const data=Object.fromEntries(new FormData(form));for(const key in data)data[key]=data[key].trim();
 if(Object.values(data).some(v=>!v)){toast('Veuillez remplir tous les champs.',true);return;}
 const button=form.querySelector('button[type="submit"]'),status=document.querySelector('#form-status');
 button.disabled=true;button.setAttribute('aria-busy','true');status.textContent='Envoi en cours…';
 try{await apiPost('/messages',data);form.reset();form.querySelector('.character-count').textContent='0/5000';status.textContent='Votre message a été envoyé avec succès.';toast(status.textContent);}
 catch(error){status.textContent=error.name==='TimeoutError'?'Le serveur met trop de temps à répondre. Réessayez.':error.message;toast(status.textContent,true);}
 finally{button.disabled=false;button.removeAttribute('aria-busy');}
});
