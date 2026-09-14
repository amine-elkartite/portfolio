import React from 'react';
import {Pressable,Text,View} from 'react-native';
import {router} from 'expo-router';
import {BarChart3,FileSearch,FileText,Receipt,Settings,ShieldCheck,UserRound,Wrench,GraduationCap,CheckSquare2} from 'lucide-react-native';
import {Card,Screen,Title} from '../../src/components/ui';
import {useTheme} from '../../src/theme/ThemeProvider';

type MenuItem={title:string;subtitle:string;href:string;icon:React.ComponentType<{size?:number;color?:string}>};
const items:MenuItem[]=[
  {title:'Services',subtitle:'Manage your portfolio services',href:'/resource/services',icon:Wrench},
  {title:'Skills',subtitle:'Technologies and proficiency',href:'/resource/skills',icon:GraduationCap},
  {title:'Tasks',subtitle:'To do, in progress and completed',href:'/resource/tasks',icon:CheckSquare2},
  {title:'Quotes',subtitle:'Client quote management',href:'/resource/quotes',icon:FileText},
  {title:'Invoices',subtitle:'Invoices and paid revenue',href:'/resource/invoices',icon:Receipt},
  {title:'Statistics',subtitle:'Portfolio business overview',href:'/statistics',icon:BarChart3},
  {title:'SEO',subtitle:'Search and social metadata',href:'/seo',icon:FileSearch},
  {title:'Settings',subtitle:'Security, notifications and appearance',href:'/settings',icon:Settings},
  {title:'Profile',subtitle:'Admin account and sessions',href:'/profile',icon:UserRound},
  {title:'Security',subtitle:'Biometrics and active devices',href:'/settings/security',icon:ShieldCheck}
];

export default function MoreScreen(){const {colors}=useTheme();return <Screen><Title subtitle="All portfolio administration tools.">More</Title>{items.map(item=>{const Icon=item.icon;return <Pressable key={item.title} onPress={()=>router.push(item.href as never)}><Card><View style={{flexDirection:'row',alignItems:'center',gap:13}}><View style={{width:42,height:42,borderRadius:13,backgroundColor:colors.input,alignItems:'center',justifyContent:'center'}}><Icon size={20} color={colors.text}/></View><View style={{flex:1}}><Text style={{color:colors.text,fontSize:15,fontWeight:'800'}}>{item.title}</Text><Text style={{color:colors.textMuted,fontSize:12,marginTop:3}}>{item.subtitle}</Text></View><Text style={{color:colors.textMuted,fontSize:20}}>›</Text></View></Card></Pressable>;})}</Screen>;}
