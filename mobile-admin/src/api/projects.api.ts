import {apiRequest} from './client';
import type {Project} from '../types/api';

export type ProjectInput={
  title:string;description:string;long_description?:string;category:string;technologies:string[];github_url?:string;live_url?:string;status:Project['status'];featured:boolean;seo_title?:string;seo_description?:string;og_image?:string;
};

export type ProjectImage={uri:string;name:string;type:string};

function formData(input:ProjectInput,image?:ProjectImage|null){
  const form=new FormData();
  form.append('title',input.title);
  form.append('description',input.description);
  form.append('long_description',input.long_description||'');
  form.append('category',input.category);
  form.append('technologies',input.technologies.join(', '));
  form.append('github_url',input.github_url||'');
  form.append('live_url',input.live_url||'');
  form.append('status',input.status);
  form.append('featured',String(input.featured));
  form.append('seo_title',input.seo_title||'');
  form.append('seo_description',input.seo_description||'');
  form.append('og_image',input.og_image||'');
  if(image)form.append('thumbnail',{uri:image.uri,name:image.name,type:image.type} as unknown as Blob);
  return form;
}

export const projectsApi={
  list:()=>apiRequest<Project[]>('/projects/manage'),
  one:(id:number)=>apiRequest<Project>(`/projects/manage/${id}`),
  create:(input:ProjectInput,image?:ProjectImage|null)=>apiRequest<Project>('/projects',{method:'POST',body:formData(input,image)}),
  update:(id:number,input:ProjectInput,image?:ProjectImage|null)=>apiRequest<Project>(`/projects/${id}`,{method:'PUT',body:formData(input,image)}),
  remove:(id:number)=>apiRequest<null>(`/projects/${id}`,{method:'DELETE'})
};
