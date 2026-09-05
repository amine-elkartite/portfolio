import 'dotenv/config';
import bcrypt from 'bcrypt';
import {randomBytes} from 'node:crypto';
import {pool} from '../config/database.js';
// No default credential or hash is shipped. Existing accounts are never overwritten.
const email='amineelkartite@gmail.com';
try{
 const [users]=await pool.execute('SELECT id FROM users WHERE email=?',[email]);
 if(users.length)throw new Error('Ce compte existe déjà. Utilisez les paramètres pour changer le mot de passe.');
 const password=process.env.ADMIN_PASSWORD||randomBytes(18).toString('base64url');
 if(password.length<12||Buffer.byteLength(password,'utf8')>72)throw new Error('Mot de passe : 12 à 72 octets requis.');
 await pool.execute('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)',['Amine ELKARTITE',email,await bcrypt.hash(password,12),'admin']);
 console.log(`Compte créé : ${email}`);
 if(!process.env.ADMIN_PASSWORD) console.log(`Mot de passe généré (à conserver dans votre gestionnaire) : ${password}`);
}finally{await pool.end();}
