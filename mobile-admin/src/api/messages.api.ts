import {apiRequest,jsonBody} from './client';
import type {Message} from '../types/api';
export const messagesApi={
  list:()=>apiRequest<Message[]>('/messages'),
  one:(id:number)=>apiRequest<Message>(`/messages/${id}`),
  unreadCount:()=>apiRequest<{count:number}>('/messages/unread-count'),
  setStatus:(id:number,status:Message['status'])=>apiRequest<Message>(`/messages/${id}/status`,{method:'PATCH',body:jsonBody({status})}),
  remove:(id:number)=>apiRequest<null>(`/messages/${id}`,{method:'DELETE'})
};
