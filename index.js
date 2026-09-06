import express from 'express';
import {fileURLToPath} from 'node:url';

const app=express();
app.disable('x-powered-by');

const frontend=fileURLToPath(new URL('./frontend/',import.meta.url));
const publicPages={
  '/':'index.html',
  '/about':'about.html',
  '/services':'services.html',
  '/projects':'projects.html',
  '/skills':'skills.html',
  '/contact':'contact.html',
  '/privacy':'privacy.html'
};

app.get('/__health',(req,res)=>res.json({success:true,status:'public-ok'}));

for(const [route,file] of Object.entries(publicPages)){
  app.get(route,(req,res)=>res.sendFile(file,{root:frontend}));
}

app.get('/index.html',(req,res)=>res.redirect(301,'/'));
app.get('/about.html',(req,res)=>res.redirect(301,'/about'));
app.get('/services.html',(req,res)=>res.redirect(301,'/services'));
app.get('/projects.html',(req,res)=>res.redirect(301,'/projects'));
app.get('/skills.html',(req,res)=>res.redirect(301,'/skills'));
app.get('/contact.html',(req,res)=>res.redirect(301,'/contact'));
app.get('/privacy.html',(req,res)=>res.redirect(301,'/privacy'));
app.get('/project.html',(req,res)=>res.redirect(301,'/projects'));

app.use(express.static(frontend,{index:false,dotfiles:'deny',maxAge:process.env.NODE_ENV==='production'?'7d':0}));

let backendPromise;
function loadBackend(){
  backendPromise ||= import('./backend/app.js').then(module=>module.app);
  return backendPromise;
}

app.use(async(req,res,next)=>{
  try{
    const backend=await loadBackend();
    return backend(req,res,next);
  }catch(error){
    console.error('[backend-startup]',error.code||error.name,error.message);
    if(req.path.startsWith('/api/')) return res.status(503).json({success:false,message:'API temporairement indisponible.'});
    return next(error);
  }
});

app.use((error,req,res,next)=>{
  if(res.headersSent)return next(error);
  console.error('[root]',error.code||error.name,error.message);
  if(req.path.startsWith('/api/')) return res.status(500).json({success:false,message:'Service temporairement indisponible.'});
  return res.status(500).type('text').send('Service temporairement indisponible.');
});

export default app;
