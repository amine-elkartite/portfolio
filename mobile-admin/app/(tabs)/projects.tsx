import React,{useMemo,useState} from 'react';
import {Image,Pressable,Text,TextInput,View} from 'react-native';
import {router} from 'expo-router';
import {useQuery} from '@tanstack/react-query';
import {projectsApi} from '../../src/api/projects.api';
import {API_BASE_URL} from '../../src/api/client';
import {Card,EmptyState,ErrorState,LoadingState,PrimaryButton,Screen,Title} from '../../src/components/ui';
import {useTheme} from '../../src/theme/ThemeProvider';

function imageUrl(path?:string|null){if(!path)return null;if(/^https?:\/\//.test(path))return path;return API_BASE_URL.replace(/\/api$/,'')+path;}

export default function ProjectsScreen(){
  const {colors}=useTheme();
  const [search,setSearch]=useState('');
  const [status,setStatus]=useState<'all'|'draft'|'published'|'in_progress'|'completed'>('all');
  const query=useQuery({queryKey:['projects'],queryFn:projectsApi.list});
  const rows=useMemo(()=>query.data?.filter(project=>(status==='all'||project.status===status)&&(`${project.title} ${project.category} ${project.description}`).toLowerCase().includes(search.toLowerCase()))||[],[query.data,search,status]);
  return <Screen>
    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',gap:12}}><View style={{flex:1}}><Title subtitle="Create, publish and update portfolio projects.">Projects</Title></View><View style={{width:112}}><PrimaryButton title="+ Add" onPress={()=>router.push('/projects/new')}/></View></View>
    <TextInput value={search} onChangeText={setSearch} placeholder="Search projects" placeholderTextColor={colors.textMuted} style={{backgroundColor:colors.input,borderColor:colors.border,borderWidth:1,borderRadius:13,paddingHorizontal:14,minHeight:46,color:colors.text,marginBottom:10}}/>
    <View style={{flexDirection:'row',flexWrap:'wrap',gap:7,marginBottom:14}}>{(['all','published','draft','in_progress','completed'] as const).map(item=><Pressable key={item} onPress={()=>setStatus(item)} style={{paddingHorizontal:11,paddingVertical:7,borderRadius:999,backgroundColor:status===item?colors.primary:colors.surface,borderWidth:1,borderColor:status===item?colors.primary:colors.border}}><Text style={{fontSize:12,fontWeight:'700',color:status===item?colors.primaryText:colors.text}}>{item.replace('_',' ')}</Text></Pressable>)}</View>
    {query.isLoading?<LoadingState/>:query.isError?<ErrorState message={query.error instanceof Error?query.error.message:'Unable to load projects.'} onRetry={()=>void query.refetch()}/>:rows.length?rows.map(project=>{
      const uri=imageUrl(project.thumbnail);return <Pressable key={project.id} onPress={()=>router.push(`/projects/${project.id}`)}><Card><View style={{flexDirection:'row',gap:13}}>{uri?<Image source={{uri}} style={{width:82,height:72,borderRadius:12,backgroundColor:colors.input}}/>:<View style={{width:82,height:72,borderRadius:12,backgroundColor:colors.input}}/>}<View style={{flex:1}}><View style={{flexDirection:'row',justifyContent:'space-between',gap:8}}><Text numberOfLines={1} style={{flex:1,color:colors.text,fontSize:16,fontWeight:'800'}}>{project.title}</Text><Text style={{fontSize:10,fontWeight:'800',color:project.status==='published'?colors.success:colors.warning}}>{project.status.toUpperCase()}</Text></View><Text style={{color:colors.textMuted,marginTop:5}}>{project.category}</Text><Text numberOfLines={2} style={{color:colors.textMuted,fontSize:12,marginTop:5,lineHeight:17}}>{project.description}</Text></View></View></Card></Pressable>;
    }):<EmptyState title="No projects found" description="Change the filters or create a new project."/>}
  </Screen>;
}
