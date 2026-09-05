import { createModel } from './BaseModel.js';
export default createModel('messages', ["name", "email", "subject", "message", "status"], 'id DESC');
