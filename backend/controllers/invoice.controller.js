import Model from '../models/Invoice.js';
import {documentController} from './document.controller.js';
export const controller=documentController(Model,'invoices');
