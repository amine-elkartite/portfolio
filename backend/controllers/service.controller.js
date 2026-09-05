import Model from '../models/Service.js';
import {crud} from './crud.controller.js';
export const controller=crud(Model);
