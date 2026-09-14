import {apiRequest,jsonBody} from './client';

export type ManagedResource='services'|'skills'|'clients'|'tasks'|'quotes'|'invoices';

function listPath(resource:ManagedResource){return resource==='services'?'/services/manage':`/${resource}`;}

export const resourcesApi={
  list<T>(resource:ManagedResource){return apiRequest<T[]>(listPath(resource));},
  one<T>(resource:ManagedResource,id:number){return apiRequest<T>(`/${resource}/${id}`);},
  create<T>(resource:ManagedResource,payload:unknown){return apiRequest<T>(`/${resource}`,{method:'POST',body:jsonBody(payload)});},
  update<T>(resource:ManagedResource,id:number,payload:unknown){return apiRequest<T>(`/${resource}/${id}`,{method:'PUT',body:jsonBody(payload)});},
  remove(resource:ManagedResource,id:number){return apiRequest<null>(`/${resource}/${id}`,{method:'DELETE'});}
};
