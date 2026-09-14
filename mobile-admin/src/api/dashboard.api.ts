import {apiRequest} from './client';
import type {DashboardStats} from '../types/api';
export const dashboardApi={stats:()=>apiRequest<DashboardStats>('/dashboard/stats')};
