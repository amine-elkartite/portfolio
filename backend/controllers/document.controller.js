import {pool} from '../config/database.js';
import {ok} from './crud.controller.js';
import {createDocumentPdf} from '../services/documentPdf.service.js';

const specs={quotes:{prefix:'DEV',label:'devis'},invoices:{prefix:'FAC',label:'facture'}};
const missing=(res,label)=>res.status(404).json({success:false,message:`${label} introuvable.`});

async function nextNumber(table) {
  const spec=specs[table], year=new Date().getUTCFullYear(), lock=`${table}-number-${year}`;
  const conn=await pool.getConnection();
  try {
    const [[lockRow]]=await conn.query('SELECT GET_LOCK(?, 10) AS locked',[lock]); if(lockRow.locked!==1) throw Object.assign(new Error('Numérotation indisponible.'),{status:503});
    const [[row]]=await conn.query(`SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(number,'-',-1) AS UNSIGNED)),0)+1 AS value FROM ${table} WHERE number LIKE ?`,[`${spec.prefix}-${year}-%`]);
    return `${spec.prefix}-${year}-${String(row.value).padStart(4,'0')}`;
  } finally { await conn.query('SELECT RELEASE_LOCK(?)',[lock]).catch(()=>{}); conn.release(); }
}

export function documentController(Model,table) {
  const spec=specs[table];
  const normalize=data=>({...data,client_id:data.client_id||null,due_date:data.due_date||null,...(table==='invoices'?{paid_at:data.status==='paid'?(data.paid_at||new Date().toISOString().slice(0,10)):null}:{})});
  return {
    async list(req,res){return ok(res,await Model.all());},
    async get(req,res){const row=await Model.find(req.params.id);return row?ok(res,row):missing(res,spec.label);},
    async next(req,res){return ok(res,{number:await nextNumber(table)});},
    async create(req,res){const row=await Model.create({...normalize(req.validated),number:await nextNumber(table)});return ok(res,row,`${spec.label[0].toUpperCase()+spec.label.slice(1)} créé.`,201);},
    async update(req,res){const existing=await Model.find(req.params.id);if(!existing)return missing(res,spec.label);const row=await Model.update(existing.id,{...normalize(req.validated),number:existing.number});return ok(res,row,'Modifications enregistrées.');},
    async remove(req,res){if(!await Model.remove(req.params.id))return missing(res,spec.label);return ok(res,null,`${spec.label[0].toUpperCase()+spec.label.slice(1)} supprimé.`);},
    async pdf(req,res){const [rows]=await pool.execute(`SELECT d.*,c.name AS client_name,c.company AS client_company,c.email AS client_email,c.phone AS client_phone FROM ${table} d LEFT JOIN clients c ON c.id=d.client_id WHERE d.id=?`,[req.params.id]);const row=rows[0];if(!row)return missing(res,spec.label);const pdf=await createDocumentPdf(table==='invoices'?'invoice':'quote',row,{name:row.client_name,company:row.client_company,email:row.client_email,phone:row.client_phone});res.type('application/pdf').set('Content-Disposition',`attachment; filename="${spec.prefix}-${row.number}.pdf"`).send(pdf);}
  };
}
