import { createModel } from './BaseModel.js';
export default createModel('quotes', ["number", "client_id", "title", "amount", "status", "due_date", "notes"], 'id DESC');
