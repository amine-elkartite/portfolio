import { createModel } from './BaseModel.js';
export default createModel('invoices', ["number", "client_id", "title", "amount", "status", "due_date", "paid_at", "notes"], 'id DESC');
