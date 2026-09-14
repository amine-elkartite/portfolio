import React from 'react';
import {ActivityIndicator,Pressable,ScrollView,StyleSheet,Text,TextInput,View,type KeyboardTypeOptions,type TextInputProps} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeProvider';

export function Screen({children,scroll=true,padded=true}:{children:React.ReactNode;scroll?:boolean;padded?:boolean}){
  const {colors}=useTheme();
  const content=<View style={[styles.content,padded&&styles.padded]}>{children}</View>;
  return <SafeAreaView edges={['top','left','right']} style={[styles.flex,{backgroundColor:colors.background}]}>{scroll?<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.grow}>{content}</ScrollView>:content}</SafeAreaView>;
}

export function Title({children,subtitle}:{children:React.ReactNode;subtitle?:string}){const {colors}=useTheme();return <View style={styles.titleWrap}><Text style={[styles.title,{color:colors.text}]}>{children}</Text>{subtitle?<Text style={[styles.subtitle,{color:colors.textMuted}]}>{subtitle}</Text>:null}</View>;}

export function Card({children,style}:{children:React.ReactNode;style?:object}){const {colors}=useTheme();return <View style={[styles.card,{backgroundColor:colors.surface,borderColor:colors.border},style]}>{children}</View>;}

export function PrimaryButton({title,onPress,loading=false,disabled=false,variant='primary'}:{title:string;onPress:()=>void;loading?:boolean;disabled?:boolean;variant?:'primary'|'secondary'|'danger'}){
  const {colors}=useTheme();const background=variant==='primary'?colors.primary:variant==='danger'?colors.danger:colors.surfaceRaised;const foreground=variant==='primary'?colors.primaryText:variant==='danger'?'#fff':colors.text;
  return <Pressable accessibilityRole="button" disabled={disabled||loading} onPress={onPress} style={({pressed})=>[styles.button,{backgroundColor:background,borderColor:variant==='secondary'?colors.border:background,opacity:disabled||loading?.55:pressed?.75:1}]}>{loading?<ActivityIndicator color={foreground}/>:<Text style={[styles.buttonText,{color:foreground}]}>{title}</Text>}</Pressable>;
}

export function Field({label,error,keyboardType='default',...props}:TextInputProps&{label:string;error?:string;keyboardType?:KeyboardTypeOptions}){const {colors}=useTheme();return <View style={styles.fieldWrap}><Text style={[styles.label,{color:colors.text}]}>{label}</Text><TextInput placeholderTextColor={colors.textMuted} keyboardType={keyboardType} {...props} style={[styles.input,{backgroundColor:colors.input,borderColor:error?colors.danger:colors.border,color:colors.text},props.multiline&&styles.multiline,props.style]}/>{error?<Text style={[styles.error,{color:colors.danger}]}>{error}</Text>:null}</View>;}

export function StatCard({label,value,hint}:{label:string;value:string|number;hint?:string}){const {colors}=useTheme();return <Card style={styles.statCard}><Text style={[styles.statLabel,{color:colors.textMuted}]}>{label}</Text><Text style={[styles.statValue,{color:colors.text}]}>{value}</Text>{hint?<Text style={[styles.statHint,{color:colors.textMuted}]}>{hint}</Text>:null}</Card>;}

export function EmptyState({title,description}:{title:string;description?:string}){const {colors}=useTheme();return <View style={styles.empty}><Text style={[styles.emptyTitle,{color:colors.text}]}>{title}</Text>{description?<Text style={[styles.emptyText,{color:colors.textMuted}]}>{description}</Text>:null}</View>;}

export function LoadingState(){const {colors}=useTheme();return <View style={styles.loading}><ActivityIndicator size="large" color={colors.primary}/></View>;}

export function ErrorState({message,onRetry}:{message:string;onRetry?:()=>void}){return <Card><Text style={{fontWeight:'700',fontSize:16,marginBottom:8}}>Something went wrong</Text><Text style={{marginBottom:12}}>{message}</Text>{onRetry?<PrimaryButton title="Try Again" onPress={onRetry}/>:null}</Card>;}

export function Divider(){const {colors}=useTheme();return <View style={{height:1,backgroundColor:colors.border,marginVertical:14}}/>;}

export const styles=StyleSheet.create({
  flex:{flex:1},grow:{flexGrow:1},content:{flex:1},padded:{padding:18,paddingBottom:34},titleWrap:{marginBottom:20},title:{fontSize:30,fontWeight:'800',letterSpacing:-.7},subtitle:{fontSize:14,lineHeight:20,marginTop:5},card:{borderWidth:1,borderRadius:18,padding:16,marginBottom:12},button:{minHeight:48,borderRadius:14,borderWidth:1,alignItems:'center',justifyContent:'center',paddingHorizontal:16,marginVertical:5},buttonText:{fontSize:15,fontWeight:'700'},fieldWrap:{marginBottom:14},label:{fontSize:13,fontWeight:'700',marginBottom:7},input:{minHeight:48,borderRadius:13,borderWidth:1,paddingHorizontal:14,fontSize:15},multiline:{minHeight:110,paddingTop:12,textAlignVertical:'top'},error:{fontSize:12,marginTop:5},statCard:{flex:1,minWidth:145},statLabel:{fontSize:12,fontWeight:'600'},statValue:{fontSize:25,fontWeight:'800',marginTop:5},statHint:{fontSize:11,marginTop:4},empty:{paddingVertical:42,alignItems:'center'},emptyTitle:{fontSize:17,fontWeight:'700'},emptyText:{fontSize:13,textAlign:'center',marginTop:7,maxWidth:280},loading:{padding:50,alignItems:'center'},errorText:{fontSize:12}
});
