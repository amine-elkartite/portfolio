import Model from '../models/Quote.js';
import {crud} from './crud.controller.js';
export const controller=crud(Model,async data=>({...data,due_date:data.due_date||null,client_id:data.client_id||null}));
