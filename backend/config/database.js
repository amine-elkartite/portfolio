import mysql from 'mysql2/promise';
import 'dotenv/config';

const firstEnv=(...names)=>names.map(name=>process.env[name]).find(value=>value!==undefined&&value!=='');
const connectionUri=firstEnv('DATABASE_URL','MYSQL_URL','MYSQL_URI','MYSQL_SERVICE_URI');
let uri;
try { if(connectionUri) uri=new URL(connectionUri); } catch { uri=undefined; }

const decode=value=>{try{return decodeURIComponent(value||'');}catch{return value||'';}};
const uriDatabase=uri?.pathname?.replace(/^\//,'')||'';
const host=firstEnv('DB_HOST','MYSQL_HOST')||uri?.hostname||'127.0.0.1';
const port=Number(firstEnv('DB_PORT','MYSQL_PORT')||uri?.port||3306);
const user=firstEnv('DB_USER','MYSQL_USER','MYSQL_USERNAME')||decode(uri?.username)||'portfolio_app';
const password=firstEnv('DB_PASSWORD','MYSQL_PASSWORD')||decode(uri?.password)||'';
const database=firstEnv('DB_NAME','MYSQL_DATABASE')||uriDatabase||'portfolio_db';
const requestedSsl=firstEnv('DB_SSL_MODE','MYSQL_SSL_MODE')||uri?.searchParams?.get('ssl-mode')||uri?.searchParams?.get('sslmode')||(host.endsWith('.aivencloud.com')?'REQUIRED':'');
const sslMode=String(requestedSsl||'').toUpperCase();
const ssl=sslMode?{
  rejectUnauthorized:['VERIFY_CA','VERIFY_IDENTITY'].includes(sslMode),
  ...(process.env.DB_SSL_CA?{ca:process.env.DB_SSL_CA.replace(/\\n/g,'\n')}:{})
}:undefined;

export const databaseConfig={
  host,port,user,password,database,
  ...(process.env.DB_SOCKET?{socketPath:process.env.DB_SOCKET}:{}),
  ...(ssl?{ssl}:{}),
  waitForConnections:true,
  connectionLimit:Number(process.env.DB_CONNECTION_LIMIT||10),
  charset:'utf8mb4',timezone:'Z',decimalNumbers:true,
};

export const databaseDiagnostics={
  host,port,database,sslMode:sslMode||'DISABLED',
  hasPassword:Boolean(password),
  source:connectionUri?'connection-uri':firstEnv('DB_HOST','DB_USER','DB_NAME')?'DB_*':firstEnv('MYSQL_HOST','MYSQL_USER','MYSQL_USERNAME','MYSQL_DATABASE')?'MYSQL_*':'defaults'
};

export const pool=mysql.createPool(databaseConfig);
