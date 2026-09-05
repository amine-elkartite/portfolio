import Model from '../models/Quote.js';
import {documentController} from './document.controller.js';
export const controller=documentController(Model,'quotes');
