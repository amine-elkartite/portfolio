import { createModel } from './BaseModel.js';
export default createModel('tasks', ["title", "description", "status", "priority", "due_date"], 'id DESC');
