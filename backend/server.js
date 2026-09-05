import 'dotenv/config';
import {pool} from './config/database.js';
if(!process.env.JWT_SECRET || process.env.JWT_SECRET.length<32 || /replace|CHANGE_THIS/i.test(process.env.JWT_SECRET))throw new Error('Configurez JWT_SECRET avec au moins 32 caractères aléatoires.');
const {app}=await import('./app.js');
await pool.query('SELECT 1');
const server=app.listen(Number(process.env.PORT||5000),()=>console.log(`Portfolio : http://localhost:${process.env.PORT||5000}`));
server.on('error',error=>{console.error('Démarrage impossible :',error.message);process.exitCode=1;pool.end();});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{server.close(async()=>{await pool.end();process.exit(0);});setTimeout(()=>process.exit(1),10000).unref();});
