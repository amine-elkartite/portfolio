import {apiRequest,jsonBody} from './client';
import type {Settings,User} from '../types/api';

export const settingsApi={
  me:()=>apiRequest<User&{avatar?:string|null}>('/auth/me'),
  get:()=>apiRequest<Settings>('/settings'),
  update:(payload:{availability:boolean;linkedin_url?:string;github_url?:string;instagram_url?:string})=>apiRequest<null>('/settings',{method:'PUT',body:jsonBody(payload)}),
  changePassword:(payload:{current_password:string;new_password:string})=>apiRequest<null>('/settings/password',{method:'PUT',body:jsonBody(payload)}),
  updateSeo:(payload:Record<string,unknown>)=>apiRequest<null>('/settings/seo',{method:'PUT',body:jsonBody(payload)}),
  updatePageSeo:(pages:Array<Record<string,unknown>>)=>apiRequest<null>('/settings/seo/pages',{method:'PUT',body:jsonBody({pages})})
};
