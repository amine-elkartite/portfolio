import React,{useMemo,useState} from 'react';
import {Pressable,Text,TextInput,View} from 'react-native';
import {router} from 'expo-router';
import {useQuery} from '@tanstack/react-query';
import {messagesApi} from '../../src/api/messages.api';
import type {Message} from '../../src/types/api';
import {Card,EmptyState,ErrorState,LoadingState,Screen,Title} from '../../src/components/ui';
import {useTheme} from '../../src/theme/ThemeProvider';

const filters=['all','unread','read','replied'] as const;

export default function MessagesScreen(){
  const {colors}=useTheme();
  const [filter,setFilter]=useState<typeof filters[number]>('all');
  const [search,setSearch]=useState('');
  const query=useQuery({queryKey:['messages'],queryFn:messagesApi.list});
  const rows=useMemo(()=>query.data?.filter(message=>(filter==='all'||message.status===filter)&&`${message.name} ${message.email} ${message.subject} ${message.message}`.toLowerCase().includes(search.toLowerCase()))||[],[query.data,filter,search]);
  return <Screen>
    <Title subtitle="Messages submitted through your portfolio contact form.">Messages</Title>
    <TextInput value={search} onChangeText={setSearch} placeholder="Search messages" placeholderTextColor={colors.textMuted} style={{backgroundColor:colors.input,borderColor:colors.border,borderWidth:1,borderRadius:13,paddingHorizontal:14,minHeight:46,color:colors.text,marginBottom:10}}/>
    <View style={{flexDirection:'row',gap:7,marginBottom:14}}>{filters.map(item=><Pressable key={item} onPress={()=>setFilter(item)} style={{flex:1,paddingVertical:8,borderRadius:12,alignItems:'center',backgroundColor:filter===item?colors.primary:colors.surface,borderColor:filter===item?colors.primary:colors.border,borderWidth:1}}><Text style={{fontSize:11,fontWeight:'800',color:filter===item?colors.primaryText:colors.text}}>{item.toUpperCase()}</Text></Pressable>)}</View>
    {query.isLoading?<LoadingState/>:query.isError?<ErrorState message={query.error instanceof Error?query.error.message:'Unable to load messages.'} onRetry={()=>void query.refetch()}/>:rows.length?rows.map((message:Message)=><Pressable key={message.id} onPress={()=>router.push(`/messages/${message.id}`)}><Card><View style={{flexDirection:'row',alignItems:'flex-start',gap:10}}><View style={{width:9,height:9,borderRadius:9,marginTop:5,backgroundColor:message.status==='unread'?colors.danger:'transparent'}}/><View style={{flex:1}}><View style={{flexDirection:'row',justifyContent:'space-between',gap:10}}><Text style={{color:colors.text,fontSize:15,fontWeight:message.status==='unread'?'800':'600'}} numberOfLines={1}>{message.name}</Text><Text style={{fontSize:10,fontWeight:'700',color:colors.textMuted}}>{message.status.toUpperCase()}</Text></View><Text style={{color:colors.text,fontSize:13,fontWeight:'600',marginTop:4}} numberOfLines={1}>{message.subject}</Text><Text style={{color:colors.textMuted,fontSize:12,lineHeight:17,marginTop:4}} numberOfLines={2}>{message.message}</Text></View></View></Card></Pressable>):<EmptyState title="No messages found" description="New website messages will appear here and can trigger a phone notification."/>}
  </Screen>;
}
