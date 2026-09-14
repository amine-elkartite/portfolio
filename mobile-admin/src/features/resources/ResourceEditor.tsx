import React,{useEffect,useMemo,useState} from 'react';
import {Alert,Pressable,Switch,Text,View} from 'react-native';
import {router} from 'expo-router';
import {useQuery} from '@tanstack/react-query';
import {resourcesApi,type ManagedResource} from '../../api/resources.api';
import {resourceConfigs} from './resourceConfig';
import {queryClient} from '../../query/queryClient';
import {Card,ErrorState,Field,LoadingState,PrimaryButton,Screen,Title} from '../../components/ui';
import {useTheme} from '../../theme/ThemeProvider';

type Row=Record<string,unknown>&{id:number};
type FormState=Record<string,string|boolean>;

function initialState(resource:ManagedResource):FormState{
  return Object.fromEntries(resourceConfigs[resource].fields.map(field=>[field.key,field.kind==='boolean'?true:field.kind==='choice'?(field.choices?.[0]?.value||''):field.kind==='number'&&field.required?'0':'']));
}

export function ResourceEditor({resource,id}:{resource:ManagedResource;id:'new'|number}){
  const {colors}=useTheme();const config=resourceConfigs[resource];const editing=id!=='new';
  const query=useQuery({queryKey:['resource',resource,id],queryFn:()=>resourcesApi.one<Row>(resource,id as number),enabled:editing});
  const [values,setValues]=useState<FormState>(()=>initialState(resource));const [error,setError]=useState('');const [working,setWorking]=useState(false);
  useEffect(()=>{if(query.data){const next=initialState(resource);for(const field of config.fields){const value=query.data[field.key];next[field.key]=field.kind==='boolean'?Boolean(value):value==null?'':String(value);}setValues(next);}},[query.data,resource]);
  const missing=useMemo(()=>config.fields.filter(field=>field.required&&field.kind!=='boolean'&&!String(values[field.key]??'').trim()).map(field=>field.label),[config.fields,values]);
  if(editing&&query.isLoading)return <Screen><LoadingState/></Screen>;
  if(editing&&(query.isError||!query.data))return <Screen><ErrorState message={query.error instanceof Error?query.error.message:`${config.singular} not found.`} onRetry={()=>void query.refetch()}/></Screen>;
  const set=(key:string,value:string|boolean)=>setValues(current=>({...current,[key]:value}));
  const submit=async()=>{if(missing.length){setError(`Required: ${missing.join(', ')}`);return;}setWorking(true);setError('');const payload:Record<string,unknown>={};for(const field of config.fields){const value=values[field.key];if(field.kind==='boolean')payload[field.key]=Boolean(value);else if(field.kind==='number'){if(String(value).trim()!=='')payload[field.key]=Number(value);}else if(String(value??'').trim()!=='')payload[field.key]=String(value).trim();else payload[field.key]='';}try{if(editing)await resourcesApi.update(resource,id as number,payload);else await resourcesApi.create(resource,payload);await Promise.all([queryClient.invalidateQueries({queryKey:['resource',resource]}),queryClient.invalidateQueries({queryKey:['dashboard']})]);router.back();}catch(e){setError(e instanceof Error?e.message:`Unable to save ${config.singular.toLowerCase()}.`);}finally{setWorking(false);}};
  const remove=()=>{if(!editing)return;Alert.alert(`Delete ${config.singular.toLowerCase()}?`,'This action cannot be undone.',[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:async()=>{setWorking(true);try{await resourcesApi.remove(resource,id as number);await Promise.all([queryClient.invalidateQueries({queryKey:['resource',resource]}),queryClient.invalidateQueries({queryKey:['dashboard']})]);router.back();}catch(e){setError(e instanceof Error?e.message:'Unable to delete.');}finally{setWorking(false);}}}]);};
  return <Screen><Title subtitle={`Connected to the existing ${resource} API.`}>{editing?`Edit ${config.singular}`:`New ${config.singular}`}</Title><Card>{config.fields.map(field=>{
    const value=values[field.key];
    if(field.kind==='boolean')return <View key={field.key} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:14}}><Text style={{color:colors.text,fontWeight:'700'}}>{field.label}</Text><Switch value={Boolean(value)} onValueChange={next=>set(field.key,next)}/></View>;
    if(field.kind==='choice')return <View key={field.key} style={{marginBottom:14}}><Text style={{color:colors.text,fontSize:13,fontWeight:'700',marginBottom:7}}>{field.label}</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{field.choices?.map(choice=><Pressable key={choice.value} onPress={()=>set(field.key,choice.value)} style={{paddingHorizontal:10,paddingVertical:7,borderWidth:1,borderRadius:999,borderColor:value===choice.value?colors.primary:colors.border,backgroundColor:value===choice.value?colors.primary:colors.surface}}><Text style={{fontSize:12,fontWeight:'700',color:value===choice.value?colors.primaryText:colors.text}}>{choice.label}</Text></Pressable>)}</View></View>;
    return <Field key={field.key} label={field.label} value={String(value??'')} onChangeText={next=>set(field.key,next)} multiline={field.kind==='multiline'} keyboardType={field.kind==='number'?'numeric':field.kind==='email'?'email-address':'default'} autoCapitalize={field.kind==='email'?'none':'sentences'}/>;
  })}{error?<Text accessibilityRole="alert" style={{color:colors.danger,marginBottom:8}}>{error}</Text>:null}<PrimaryButton title={editing?'Save Changes':`Create ${config.singular}`} loading={working} onPress={()=>void submit()}/>{editing?<PrimaryButton title={`Delete ${config.singular}`} variant="danger" disabled={working} onPress={remove}/>:null}</Card></Screen>;
}
