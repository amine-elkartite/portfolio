import React,{useMemo,useState} from 'react';
import {Pressable,Text,TextInput,View} from 'react-native';
import {router} from 'expo-router';
import {useQuery} from '@tanstack/react-query';
import {resourcesApi,type ManagedResource} from '../../api/resources.api';
import {resourceConfigs} from './resourceConfig';
import {Card,EmptyState,ErrorState,LoadingState,PrimaryButton,Screen,Title} from '../../components/ui';
import {useTheme} from '../../theme/ThemeProvider';

type Row=Record<string,unknown>&{id:number};

export function ResourceList({resource,embedded=false}:{resource:ManagedResource;embedded?:boolean}){
  const config=resourceConfigs[resource];
  const {colors}=useTheme();
  const [search,setSearch]=useState('');
  const query=useQuery({queryKey:['resource',resource],queryFn:()=>resourcesApi.list<Row>(resource)});
  const rows=useMemo(()=>query.data?.filter(row=>Object.values(row).some(value=>String(value??'').toLowerCase().includes(search.toLowerCase())))||[],[query.data,search]);
  const body=<>
    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',gap:12}}><View style={{flex:1}}><Title subtitle={`Manage ${config.title.toLowerCase()} from the same portfolio database.`}>{config.title}</Title></View><View style={{width:108}}><PrimaryButton title="+ Add" onPress={()=>router.push(`/resource/${resource}/new`)}/></View></View>
    <TextInput value={search} onChangeText={setSearch} placeholder={`Search ${config.title.toLowerCase()}`} placeholderTextColor={colors.textMuted} style={{backgroundColor:colors.input,borderColor:colors.border,borderWidth:1,borderRadius:13,paddingHorizontal:14,minHeight:46,color:colors.text,marginBottom:14}}/>
    {query.isLoading?<LoadingState/>:query.isError?<ErrorState message={query.error instanceof Error?query.error.message:`Unable to load ${config.title}.`} onRetry={()=>void query.refetch()}/>:rows.length?rows.map(row=>{
      const primary=String(row[config.primary]??config.singular);const secondary=config.secondary?String(row[config.secondary]??''):'';const status=config.status?String(row[config.status]??''):'';
      return <Pressable key={row.id} onPress={()=>router.push(`/resource/${resource}/${row.id}`)}><Card><View style={{flexDirection:'row',justifyContent:'space-between',gap:12}}><View style={{flex:1}}><Text style={{color:colors.text,fontSize:16,fontWeight:'800'}} numberOfLines={1}>{primary}</Text>{secondary?<Text style={{color:colors.textMuted,marginTop:5}} numberOfLines={2}>{secondary}</Text>:null}</View>{status?<Text style={{fontSize:10,fontWeight:'800',color:status==='done'||status==='paid'||status==='accepted'?colors.success:colors.warning}}>{status.toUpperCase()}</Text>:null}</View></Card></Pressable>;
    }):<EmptyState title={`No ${config.title.toLowerCase()} found`}/>}</>;
  if(embedded)return <>{body}</>;
  return <Screen>{body}</Screen>;
}
