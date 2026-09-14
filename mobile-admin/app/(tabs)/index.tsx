import React from 'react';
import {Pressable,Text,View} from 'react-native';
import {router} from 'expo-router';
import {useQuery} from '@tanstack/react-query';
import {dashboardApi} from '../../src/api/dashboard.api';
import {Card,EmptyState,ErrorState,LoadingState,PrimaryButton,Screen,StatCard,Title} from '../../src/components/ui';
import {useTheme} from '../../src/theme/ThemeProvider';

const money=new Intl.NumberFormat('fr-MA',{style:'currency',currency:'MAD',maximumFractionDigits:0});

export default function DashboardScreen(){
  const {colors}=useTheme();
  const query=useQuery({queryKey:['dashboard'],queryFn:dashboardApi.stats});
  if(query.isLoading)return <Screen><Title>Dashboard</Title><LoadingState/></Screen>;
  if(query.isError||!query.data)return <Screen><Title>Dashboard</Title><ErrorState message={query.error instanceof Error?query.error.message:'Unable to load dashboard.'} onRetry={()=>void query.refetch()}/></Screen>;
  const d=query.data;
  return <Screen>
    <Title subtitle="Live data from your portfolio backend.">Dashboard</Title>
    <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>
      <StatCard label="Projects" value={d.projects}/><StatCard label="Clients" value={d.clients}/><StatCard label="Unread messages" value={d.unread}/><StatCard label="Paid revenue" value={money.format(d.revenue)}/>
    </View>
    <View style={{marginVertical:8}}><Text style={{fontSize:18,fontWeight:'800',color:colors.text,marginBottom:10}}>Quick actions</Text><View style={{flexDirection:'row',gap:10}}><View style={{flex:1}}><PrimaryButton title="+ Project" onPress={()=>router.push('/projects/new')}/></View><View style={{flex:1}}><PrimaryButton title="Messages" variant="secondary" onPress={()=>router.push('/(tabs)/messages')}/></View></View></View>
    <Text style={{fontSize:18,fontWeight:'800',color:colors.text,marginTop:12,marginBottom:10}}>Recent messages</Text>
    {d.recent_messages.length?d.recent_messages.map(message=><Pressable key={message.id} onPress={()=>router.push(`/messages/${message.id}`)}><Card><View style={{flexDirection:'row',justifyContent:'space-between',gap:10}}><View style={{flex:1}}><Text style={{fontSize:15,fontWeight:message.status==='unread'?'800':'600',color:colors.text}} numberOfLines={1}>{message.name}</Text><Text style={{color:colors.textMuted,marginTop:4}} numberOfLines={1}>{message.subject}</Text></View><Text style={{fontSize:11,fontWeight:'700',color:message.status==='unread'?colors.danger:colors.textMuted}}>{message.status.toUpperCase()}</Text></View></Card></Pressable>):<EmptyState title="No messages yet"/>}
    <Text style={{fontSize:18,fontWeight:'800',color:colors.text,marginTop:12,marginBottom:10}}>{"Today's tasks"}</Text>
    {d.today_tasks.length?d.today_tasks.map(task=><Card key={task.id}><Text style={{fontSize:15,fontWeight:'700',color:colors.text}}>{task.title}</Text><Text style={{color:colors.textMuted,marginTop:5}}>{task.status.replace('_',' ')} · {task.priority} priority</Text></Card>):<EmptyState title="No tasks for today"/>}
  </Screen>;
}
