import express from 'express';
import {app as portfolio} from './backend/app.js';

const app=express();
app.use(portfolio);
export default app;
