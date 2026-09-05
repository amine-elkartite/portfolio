import { createModel } from './BaseModel.js';
export default createModel('services', ["title", "description", "icon", "order_position", "active"], 'order_position ASC, id ASC');
