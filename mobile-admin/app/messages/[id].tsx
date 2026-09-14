import React,{useEffect,useState} from 'react';
import {Alert,Linking,Text,View} from 'react-native';
import {Redirect,router,useLocalSearchParams} from 'expo-router';
import {useMutation,useQuery} from '@tanstack/react-query';
import {messagesApi} from '../../src/api/messages.api';
import {queryClient} from '../../src/query/queryClient';
import {Card,Divider,ErrorState,LoadingState,PrimaryButton,Screen,Title} from '../../src/components/ui';
import {useTheme} from '../../src/theme/ThemeProvider';
import {useAuth} from '../../src/auth/AuthProvider';
import type {Message} from '../../src/types/api';

export default function MessageDetail(){
  const {authenticated,locked}=useAuth();
  const {colors}=useTheme();
  const {id:rawId}=useLocalSearchParams<{id:string}>();const id=Number(rawId);
  const [actionError,setActionError]=useState('');
  const query=useQuery({queryKey:['messages',id],queryFn:()=>messagesApi.one(id),enabled:authenticated&&Number.isFinite(id)&&id>0});
  const invalidate=async()=>{await Promise.all([queryClient.invalidateQueries({queryKey:['messages']}),queryClient.invalidateQueries({queryKey:['messages','unread-count']}),queryClient.invalidateQueries({queryKey:['dashboard']})]);};
  const statusMutation=useMutation({mutationFn:(status:Message['status'])=>messagesApi.setStatus(id,status),onSuccess:async()=>{await invalidate();},onError:error=>setActionError(error instanceof Error?error.message:'Unable to update message.')});
  useEffect(()=>{if(query.data?.status==='unread'&&!statusMutation.isPending)statusMutation.mutate('read');},[query.data?.status]);
  if(locked)return <Redirect href="/unlock"/>;if(!authenticated)return <Redirect href="/login"/>;
  if(query.isLoading)return <Screen><LoadingState/></Screen>;
  if(query.isError||!query.data)return <Screen><ErrorState message={query.error instanceof Error?query.error.message:'Message not found.'} onRetry={()=>void query.refetch()}/></Screen>;
  const message=query.data;
  const remove=()=>Alert.alert('Delete message?',`Delete the message from ${message.name}?`,[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:async()=>{try{await messagesApi.remove(id);await invalidate();router.back();}catch(error){setActionError(error instanceof Error?error.message:'Unable to delete message.');}}}]);
  return <Screen>
    <Title subtitle={new Date(message.created_at).toLocaleString()}>{message.subject}</Title>
    <Card><Text style={{color:colors.textMuted,fontSize:12,fontWeight:'700'}}>FROM</Text><Text style={{color:colors.text,fontSize:18,fontWeight:'800',marginTop:5}}>{message.name}</Text><Text style={{color:colors.textMuted,marginTop:3}}>{message.email}</Text><Divider/><Text selectable style={{color:colors.text,fontSize:15,lineHeight:24}}>{message.message}</Text></Card>
    <Card><Text style={{color:colors.textMuted,fontSize:12,fontWeight:'700',marginBottom:8}}>STATUS</Text><Text style={{color:message.status==='unread'?colors.danger:message.status==='replied'?colors.success:colors.text,fontWeight:'800'}}>{message.status.toUpperCase()}</Text><View style={{marginTop:10}}><PrimaryButton title="Mark Unread" variant="secondary" disabled={statusMutation.isPending} onPress={()=>statusMutation.mutate('unread')}/><PrimaryButton title="Mark Replied" variant="secondary" disabled={statusMutation.isPending} onPress={()=>statusMutation.mutate('replied')}/><PrimaryButton title="Reply by Email" onPress={()=>void Linking.openURL(`mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`)}/></View></Card>
    {actionError?<Text accessibilityRole="alert" style={{color:colors.danger,marginBottom:10}}>{actionError}</Text>:null}
    <PrimaryButton title="Delete Message" variant="danger" onPress={remove}/>
  </Screen>;
}
