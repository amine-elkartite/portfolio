import type {ApiResponse} from '../types/api';

const rawBase=(process.env.EXPO_PUBLIC_API_BASE_URL||'http://127.0.0.1:5000/api').replace(/\/$/,'');
let accessToken:string|null=null;
let refreshHandler:(()=>Promise<string|null>)|null=null;
let unauthorizedHandler:(()=>void)|null=null;
let refreshFlight:Promise<string|null>|null=null;

export class ApiError extends Error{
  status:number;
  errors?:Array<{field:string;message:string}>;
  constructor(status:number,message:string,errors?:Array<{field:string;message:string}>){super(message);this.status=status;this.errors=errors;}
}

export function setApiAccessToken(token:string|null){accessToken=token;}
export function configureApiAuth(options:{refresh:()=>Promise<string|null>;onUnauthorized:()=>void}){refreshHandler=options.refresh;unauthorizedHandler=options.onUnauthorized;}

async function parseJson(response:Response){
  const text=await response.text();
  if(!text)return null;
  try{return JSON.parse(text);}catch{return null;}
}

export async function apiRequest<T>(path:string,options:RequestInit&{skipRefresh?:boolean;auth?:boolean}={}):Promise<T>{
  const {skipRefresh=false,auth=true,...requestOptions}=options;
  const headers=new Headers(requestOptions.headers||{});
  const isForm=typeof FormData!=='undefined'&&requestOptions.body instanceof FormData;
  if(requestOptions.body&&!isForm&&!headers.has('Content-Type'))headers.set('Content-Type','application/json');
  if(auth&&accessToken)headers.set('Authorization',`Bearer ${accessToken}`);
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),15000);
  let response:Response;
  try{response=await fetch(`${rawBase}${path}`,{...requestOptions,headers,signal:controller.signal});}
  catch(error){if(error instanceof Error&&error.name==='AbortError')throw new ApiError(0,'La requête a expiré.');throw new ApiError(0,'Impossible de joindre le serveur. Vérifiez votre connexion.');}
  finally{clearTimeout(timeout);}
  if(response.status===401&&auth&&!skipRefresh&&refreshHandler){
    refreshFlight??=refreshHandler().finally(()=>{refreshFlight=null;});
    const nextToken=await refreshFlight;
    if(nextToken){accessToken=nextToken;return apiRequest<T>(path,{...options,skipRefresh:true});}
    unauthorizedHandler?.();
  }
  const payload=await parseJson(response) as ApiResponse<T>|null;
  if(!response.ok||!payload?.success)throw new ApiError(response.status,payload?.message||`Erreur HTTP ${response.status}`,payload?.errors);
  return payload.data;
}

export function jsonBody(value:unknown){return JSON.stringify(value);}
export const API_BASE_URL=rawBase;
