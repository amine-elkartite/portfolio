import Model from '../models/Task.js';
import {crud} from './crud.controller.js';
export const controller=crud(Model,async data=>({...data,due_date:data.due_date||null}));
