import { createModel } from './BaseModel.js';
export default createModel('clients', ["name", "company", "email", "phone", "notes"], 'id DESC');
