import React,{useEffect,useState} from 'react';
import {Alert,Image,Pressable,Switch,Text,View} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {Controller,useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {router} from 'expo-router';
import {projectsApi,type ProjectImage,type ProjectInput} from '../../api/projects.api';
import {API_BASE_URL,ApiError} from '../../api/client';
import type {Project} from '../../types/api';
import {queryClient} from '../../query/queryClient';
import {Card,Field,PrimaryButton,Screen,Title} from '../../components/ui';
import {useTheme} from '../../theme/ThemeProvider';

const categories=['Sites Web','E-commerce','Applications Web','Applications Mobiles','APIs','Autres'] as const;
const statuses=['draft','published','in_progress','completed'] as const;
const optionalUrl=z.union([z.literal(''),z.string().url('Enter a valid https:// or http:// URL.')]);
const schema=z.object({title:z.string().trim().min(1).max(150),description:z.string().trim().min(1).max(500),long_description:z.string().max(10000),category:z.enum(categories),technologies:z.string().trim().min(1,'Add at least one technology.'),github_url:optionalUrl,live_url:optionalUrl,status:z.enum(statuses),featured:z.boolean(),seo_title:z.string().max(255),seo_description:z.string().max(320),og_image:z.string().max(255)});
type Values=z.infer<typeof schema>;

function techText(value:Project['technologies']|undefined){if(Array.isArray(value))return value.join(', ');if(typeof value==='string'){try{const parsed=JSON.parse(value);if(Array.isArray(parsed))return parsed.join(', ');}catch{}return value;}return '';}
function assetUrl(path?:string|null){return path?(path.startsWith('http')?path:API_BASE_URL.replace(/\/api$/,'')+path):null;}

export function ProjectEditor({project}:{project?:Project}){
  const {colors}=useTheme();
  const [image,setImage]=useState<ProjectImage|null>(null);
  const [error,setError]=useState('');
  const [working,setWorking]=useState(false);
  const {control,handleSubmit,reset,formState:{errors}}=useForm<Values>({resolver:zodResolver(schema),defaultValues:{title:'',description:'',long_description:'',category:'Sites Web',technologies:'',github_url:'',live_url:'',status:'draft',featured:false,seo_title:'',seo_description:'',og_image:''}});
  useEffect(()=>{if(project)reset({title:project.title,description:project.description,long_description:project.long_description||'',category:categories.includes(project.category as typeof categories[number])?project.category as typeof categories[number]:'Autres',technologies:techText(project.technologies),github_url:project.github_url||'',live_url:project.live_url||'',status:project.status,featured:Boolean(project.featured),seo_title:project.seo_title||'',seo_description:project.seo_description||'',og_image:project.og_image||''});},[project,reset]);

  const pickImage=async()=>{const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],quality:.9,allowsEditing:false});if(result.canceled)return;const asset=result.assets[0];if(!asset)return;if(asset.fileSize&&asset.fileSize>5*1024*1024){setError('Image must be 5 MB or smaller.');return;}setImage({uri:asset.uri,name:asset.fileName||`project-${Date.now()}.jpg`,type:asset.mimeType||'image/jpeg'});};
  const submit=handleSubmit(async values=>{setWorking(true);setError('');const payload:ProjectInput={...values,technologies:values.technologies.split(',').map(v=>v.trim()).filter(Boolean)};try{if(project)await projectsApi.update(project.id,payload,image);else await projectsApi.create(payload,image);await Promise.all([queryClient.invalidateQueries({queryKey:['projects']}),queryClient.invalidateQueries({queryKey:['dashboard']})]);router.back();}catch(e){setError(e instanceof ApiError||e instanceof Error?e.message:'Unable to save project.');}finally{setWorking(false);}});
  const remove=()=>{if(!project)return;Alert.alert('Delete project?',`Delete “${project.title}”? This cannot be undone.`,[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:async()=>{setWorking(true);try{await projectsApi.remove(project.id);await Promise.all([queryClient.invalidateQueries({queryKey:['projects']}),queryClient.invalidateQueries({queryKey:['dashboard']})]);router.back();}catch(e){setError(e instanceof Error?e.message:'Unable to delete project.');}finally{setWorking(false);}}}]);};

  return <Screen><Title subtitle="Changes are saved to the same backend used by the public portfolio.">{project?'Edit Project':'New Project'}</Title>
    <Card>
      {(image?.uri||assetUrl(project?.thumbnail))?<Image source={{uri:image?.uri||assetUrl(project?.thumbnail)!}} style={{width:'100%',height:180,borderRadius:14,backgroundColor:colors.input,marginBottom:10}}/>:null}
      <PrimaryButton title={image?'Change Image':'Choose Project Image'} variant="secondary" onPress={()=>void pickImage()}/>
    </Card>
    <Card>
      <Controller control={control} name="title" render={({field:{value,onChange}})=><Field label="Title" value={value} onChangeText={onChange} error={errors.title?.message}/>}/>
      <Controller control={control} name="description" render={({field:{value,onChange}})=><Field label="Short description" value={value} onChangeText={onChange} multiline error={errors.description?.message}/>}/>
      <Controller control={control} name="long_description" render={({field:{value,onChange}})=><Field label="Long description" value={value} onChangeText={onChange} multiline error={errors.long_description?.message}/>}/>
      <Text style={{fontSize:13,fontWeight:'700',color:colors.text,marginBottom:7}}>Category</Text><Controller control={control} name="category" render={({field:{value,onChange}})=><View style={{flexDirection:'row',flexWrap:'wrap',gap:6,marginBottom:14}}>{categories.map(item=><Pressable key={item} onPress={()=>onChange(item)} style={{paddingHorizontal:10,paddingVertical:7,borderRadius:999,borderWidth:1,borderColor:value===item?colors.primary:colors.border,backgroundColor:value===item?colors.primary:colors.surface}}><Text style={{color:value===item?colors.primaryText:colors.text,fontSize:12,fontWeight:'700'}}>{item}</Text></Pressable>)}</View>}/>
      <Controller control={control} name="technologies" render={({field:{value,onChange}})=><Field label="Technologies (comma separated)" value={value} onChangeText={onChange} error={errors.technologies?.message}/>}/>
      <Controller control={control} name="github_url" render={({field:{value,onChange}})=><Field label="GitHub URL" value={value} onChangeText={onChange} autoCapitalize="none" error={errors.github_url?.message}/>}/>
      <Controller control={control} name="live_url" render={({field:{value,onChange}})=><Field label="Live URL" value={value} onChangeText={onChange} autoCapitalize="none" error={errors.live_url?.message}/>}/>
      <Text style={{fontSize:13,fontWeight:'700',color:colors.text,marginBottom:7}}>Status</Text><Controller control={control} name="status" render={({field:{value,onChange}})=><View style={{flexDirection:'row',flexWrap:'wrap',gap:6,marginBottom:14}}>{statuses.map(item=><Pressable key={item} onPress={()=>onChange(item)} style={{paddingHorizontal:10,paddingVertical:7,borderRadius:999,borderWidth:1,borderColor:value===item?colors.primary:colors.border,backgroundColor:value===item?colors.primary:colors.surface}}><Text style={{color:value===item?colors.primaryText:colors.text,fontSize:12,fontWeight:'700'}}>{item.replace('_',' ')}</Text></Pressable>)}</View>}/>
      <Controller control={control} name="featured" render={({field:{value,onChange}})=><View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:14}}><Text style={{fontSize:14,fontWeight:'700',color:colors.text}}>Featured project</Text><Switch value={value} onValueChange={onChange}/></View>}/>
      <Controller control={control} name="seo_title" render={({field:{value,onChange}})=><Field label="SEO title" value={value} onChangeText={onChange} error={errors.seo_title?.message}/>}/>
      <Controller control={control} name="seo_description" render={({field:{value,onChange}})=><Field label="SEO description" value={value} onChangeText={onChange} multiline error={errors.seo_description?.message}/>}/>
      <Controller control={control} name="og_image" render={({field:{value,onChange}})=><Field label="Open Graph image path/URL" value={value} onChangeText={onChange} error={errors.og_image?.message}/>}/>
      {error?<Text accessibilityRole="alert" style={{color:colors.danger,marginBottom:8}}>{error}</Text>:null}
      <PrimaryButton title={project?'Save Changes':'Create Project'} loading={working} onPress={()=>void submit()}/>
      {project?<PrimaryButton title="Delete Project" variant="danger" disabled={working} onPress={remove}/>:null}
    </Card>
  </Screen>;
}
