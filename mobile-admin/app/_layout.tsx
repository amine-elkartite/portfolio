import React from 'react';
import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {QueryClientProvider} from '@tanstack/react-query';
import {queryClient} from '../src/query/queryClient';
import {ThemeProvider,useTheme} from '../src/theme/ThemeProvider';
import {AuthProvider} from '../src/auth/AuthProvider';
import {NotificationProvider} from '../src/notifications/NotificationProvider';

function Navigation(){
  const {colors,isDark}=useTheme();
  return <>
    <StatusBar style={isDark?'light':'dark'}/>
    <Stack screenOptions={{headerStyle:{backgroundColor:colors.surface},headerTintColor:colors.text,contentStyle:{backgroundColor:colors.background},headerShadowVisible:false}}>
      <Stack.Screen name="index" options={{headerShown:false}}/>
      <Stack.Screen name="login" options={{headerShown:false}}/>
      <Stack.Screen name="unlock" options={{headerShown:false}}/>
      <Stack.Screen name="(tabs)" options={{headerShown:false}}/>
      <Stack.Screen name="messages/[id]" options={{title:'Message'}}/>
      <Stack.Screen name="projects/new" options={{title:'New Project'}}/>
      <Stack.Screen name="projects/[id]" options={{title:'Edit Project'}}/>
      <Stack.Screen name="resource/[resource]/index" options={{title:'Manage'}}/>
      <Stack.Screen name="resource/[resource]/[id]" options={{title:'Edit'}}/>
      <Stack.Screen name="settings/index" options={{title:'Settings'}}/>
      <Stack.Screen name="settings/general" options={{title:'Website & Social'}}/>
      <Stack.Screen name="settings/security" options={{title:'Security'}}/>
      <Stack.Screen name="settings/notifications" options={{title:'Notifications'}}/>
      <Stack.Screen name="settings/appearance" options={{title:'Appearance'}}/>
      <Stack.Screen name="settings/about" options={{title:'About'}}/>
      <Stack.Screen name="profile" options={{title:'Profile'}}/>
      <Stack.Screen name="statistics" options={{title:'Statistics'}}/>
      <Stack.Screen name="seo" options={{title:'SEO'}}/>
    </Stack>
  </>;
}

export default function RootLayout(){
  return <SafeAreaProvider><QueryClientProvider client={queryClient}><ThemeProvider><AuthProvider><NotificationProvider><Navigation/></NotificationProvider></AuthProvider></ThemeProvider></QueryClientProvider></SafeAreaProvider>;
}
