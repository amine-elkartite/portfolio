import {pool} from '../config/database.js';
import {ok} from './crud.controller.js';
export async function stats(req,res) {
  const [[totals],[distribution],[revenue],[projects],[messages],[tasks]]=await Promise.all([
    pool.query(`SELECT (SELECT COUNT(*) FROM projects) projects, (SELECT COUNT(*) FROM clients) clients, (SELECT COALESCE(SUM(amount),0) FROM invoices WHERE status='paid') revenue, (SELECT COUNT(*) FROM projects WHERE status='completed') completed, (SELECT COUNT(*) FROM messages WHERE status='unread') unread`),
    pool.query('SELECT category,COUNT(*) count FROM projects GROUP BY category'),
    pool.query(`SELECT DATE_FORMAT(paid_at,'%Y-%m') month,SUM(amount) amount FROM invoices WHERE status='paid' AND paid_at>=DATE_SUB(DATE_FORMAT(UTC_DATE(),'%Y-%m-01'),INTERVAL 5 MONTH) GROUP BY month ORDER BY month`),
    pool.query('SELECT id,title,category,status,created_at FROM projects ORDER BY created_at DESC LIMIT 5'),
    pool.query('SELECT * FROM messages ORDER BY created_at DESC LIMIT 5'),
    pool.query(`SELECT * FROM tasks WHERE due_date=UTC_DATE() ORDER BY status,priority DESC LIMIT 10`)
  ]);
  return ok(res,{...totals[0],distribution,revenue_history:revenue,recent_projects:projects,recent_messages:messages,today_tasks:tasks});
}
