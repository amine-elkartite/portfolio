import Model from '../models/Invoice.js';
import {crud} from './crud.controller.js';
export const controller=crud(Model,async data=>({...data,due_date:data.due_date||null,client_id:data.client_id||null,paid_at:data.status==='paid' ? data.paid_at||new Date().toISOString().slice(0,10) : null}));
