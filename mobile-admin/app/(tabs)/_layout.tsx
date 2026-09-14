import React from 'react';
import {Redirect,Tabs} from 'expo-router';
import {BriefcaseBusiness,FolderKanban,LayoutDashboard,Menu,MessageSquare} from 'lucide-react-native';
import {useQuery} from '@tanstack/react-query';
import {useAuth} from '../../src/auth/AuthProvider';
import {messagesApi} from '../../src/api/messages.api';
import {useTheme} from '../../src/theme/ThemeProvider';
import {LoadingState,Screen} from '../../src/components/ui';

export default function TabsLayout(){
  const {booting,locked,authenticated}=useAuth();
  const {colors}=useTheme();
  const unread=useQuery({queryKey:['messages','unread-count'],queryFn:messagesApi.unreadCount,enabled:authenticated,refetchInterval:60_000});
  if(booting)return <Screen scroll={false}><LoadingState/></Screen>;
  if(locked)return <Redirect href="/unlock"/>;
  if(!authenticated)return <Redirect href="/login"/>;
  return <Tabs screenOptions={{headerShown:false,tabBarActiveTintColor:colors.text,tabBarInactiveTintColor:colors.textMuted,tabBarStyle:{backgroundColor:colors.surface,borderTopColor:colors.border,height:68,paddingBottom:8,paddingTop:7},tabBarLabelStyle:{fontSize:11,fontWeight:'600'}}}>
    <Tabs.Screen name="index" options={{title:'Dashboard',tabBarIcon:({color,size})=><LayoutDashboard color={color} size={size}/>}}/>
    <Tabs.Screen name="projects" options={{title:'Projects',tabBarIcon:({color,size})=><FolderKanban color={color} size={size}/>}}/>
    <Tabs.Screen name="messages" options={{title:'Messages',tabBarBadge:(unread.data?.count||0)>0?unread.data?.count:undefined,tabBarIcon:({color,size})=><MessageSquare color={color} size={size}/>}}/>
    <Tabs.Screen name="clients" options={{title:'Clients',tabBarIcon:({color,size})=><BriefcaseBusiness color={color} size={size}/>}}/>
    <Tabs.Screen name="more" options={{title:'More',tabBarIcon:({color,size})=><Menu color={color} size={size}/>}}/>
  </Tabs>;
}
