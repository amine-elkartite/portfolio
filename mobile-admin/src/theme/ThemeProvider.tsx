import React,{createContext,useContext,useEffect,useMemo,useState} from 'react';
import {useColorScheme} from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type AppearancePreference='light'|'dark'|'system';
type Palette={background:string;surface:string;surfaceRaised:string;text:string;textMuted:string;border:string;primary:string;primaryText:string;success:string;warning:string;danger:string;input:string};

const light:Palette={background:'#F5F6F8',surface:'#FFFFFF',surfaceRaised:'#FFFFFF',text:'#101318',textMuted:'#68707D',border:'#E2E5E9',primary:'#111827',primaryText:'#FFFFFF',success:'#177245',warning:'#A15C00',danger:'#B42318',input:'#F8F9FA'};
const dark:Palette={background:'#090B0E',surface:'#111419',surfaceRaised:'#171B21',text:'#F4F5F6',textMuted:'#9CA3AF',border:'#272C35',primary:'#F3F4F6',primaryText:'#111318',success:'#5DD39E',warning:'#F4B860',danger:'#FF7A70',input:'#15191F'};
const KEY='portfolio_admin_appearance';

type ThemeContextValue={colors:Palette;isDark:boolean;preference:AppearancePreference;setPreference:(value:AppearancePreference)=>Promise<void>};
const ThemeContext=createContext<ThemeContextValue|null>(null);

export function ThemeProvider({children}:{children:React.ReactNode}){
  const system=useColorScheme();
  const [preference,setPreferenceState]=useState<AppearancePreference>('system');
  useEffect(()=>{void SecureStore.getItemAsync(KEY).then(value=>{if(value==='light'||value==='dark'||value==='system')setPreferenceState(value);});},[]);
  const setPreference=async(value:AppearancePreference)=>{setPreferenceState(value);await SecureStore.setItemAsync(KEY,value);};
  const isDark=preference==='dark'||(preference==='system'&&system==='dark');
  const value=useMemo(()=>({colors:isDark?dark:light,isDark,preference,setPreference}),[isDark,preference]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(){const value=useContext(ThemeContext);if(!value)throw new Error('useTheme must be used inside ThemeProvider');return value;}
