import React from 'react';
import {Pressable,Text,View} from 'react-native';
import {Redirect,router} from 'expo-router';
import {Bell,CircleHelp,Globe2,MonitorCog,Search,ShieldCheck} from 'lucide-react-native';
import {Card,Screen,Title} from '../../src/components/ui';
import {useAuth} from '../../src/auth/AuthProvider';
import {useTheme} from '../../src/theme/ThemeProvider';

const items=[
  {title:'Website & Social',subtitle:'Availability and public social links',href:'/settings/general',icon:Globe2},
  {title:'Security',subtitle:'Password, biometrics and active devices',href:'/settings/security',icon:ShieldCheck},
  {title:'Notifications',subtitle:'New contact message alerts and badges',href:'/settings/notifications',icon:Bell},
  {title:'Appearance',subtitle:'Light, dark or system theme',href:'/settings/appearance',icon:MonitorCog},
  {title:'SEO',subtitle:'Website and page metadata',href:'/seo',icon:Search},
  {title:'About',subtitle:'Application version and architecture',href:'/settings/about',icon:CircleHelp}
] as const;
export default function SettingsScreen(){const {authenticated,locked}=useAuth();const {colors}=useTheme();if(locked)return <Redirect href="/unlock"/>;if(!authenticated)return <Redirect href="/login"/>;return <Screen><Title subtitle="Application and portfolio administration preferences.">Settings</Title>{items.map(item=>{const Icon=item.icon;return <Pressable key={item.title} onPress={()=>router.push(item.href)}><Card><View style={{flexDirection:'row',alignItems:'center',gap:13}}><View style={{width:42,height:42,borderRadius:13,backgroundColor:colors.input,alignItems:'center',justifyContent:'center'}}><Icon size={20} color={colors.text}/></View><View style={{flex:1}}><Text style={{color:colors.text,fontSize:15,fontWeight:'800'}}>{item.title}</Text><Text style={{color:colors.textMuted,fontSize:12,marginTop:3}}>{item.subtitle}</Text></View><Text style={{color:colors.textMuted,fontSize:20}}>›</Text></View></Card></Pressable>;})}</Screen>;}
