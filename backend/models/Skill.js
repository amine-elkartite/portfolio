import { createModel } from './BaseModel.js';
export default createModel('skills', ["name", "category", "percentage", "icon", "order_position"], 'order_position ASC, id ASC');
