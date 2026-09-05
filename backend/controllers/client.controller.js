import Model from '../models/Client.js';
import {crud} from './crud.controller.js';
export const controller=crud(Model);
