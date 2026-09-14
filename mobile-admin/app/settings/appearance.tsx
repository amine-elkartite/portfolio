import React from 'react';
import {Pressable,Text,View} from 'react-native';
import {Redirect} from 'expo-router';
import {Check,Monitor,Moon,Sun} from 'lucide-react-native';
import {useAuth} from '../../src/auth/AuthProvider';
import {Card,Screen,Title} from '../../src/components/ui';
import {useTheme,type AppearancePreference} from '../../src/theme/ThemeProvider';

const options:Array<{value:AppearancePreference;label:string;description:string;icon:typeof Sun}>=[{value:'light',label:'Light',description:'Always use the light interface.',icon:Sun},{value:'dark',label:'Dark',description:'Always use the dark interface.',icon:Moon},{value:'system',label:'System',description:'Follow the phone appearance setting.',icon:Monitor}];
export default function AppearanceSettings(){const {authenticated,locked}=useAuth();const {colors,preference,setPreference}=useTheme();if(locked)return <Redirect href="/unlock"/>;if(!authenticated)return <Redirect href="/login"/>;return <Screen><Title subtitle="This preference is local to the mobile admin app.">Appearance</Title>{options.map(option=>{const Icon=option.icon;const selected=preference===option.value;return <Pressable key={option.value} onPress={()=>void setPreference(option.value)}><Card><View style={{flexDirection:'row',alignItems:'center',gap:14}}><Icon size={22} color={colors.text}/><View style={{flex:1}}><Text style={{color:colors.text,fontSize:16,fontWeight:'800'}}>{option.label}</Text><Text style={{color:colors.textMuted,fontSize:12,marginTop:4}}>{option.description}</Text></View>{selected?<Check size={22} color={colors.success}/>:null}</View></Card></Pressable>;})}</Screen>;}
