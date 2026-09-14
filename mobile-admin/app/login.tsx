import React,{useState} from 'react';
import {KeyboardAvoidingView,Platform,Text,View} from 'react-native';
import {Redirect,router} from 'expo-router';
import {Controller,useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useAuth} from '../src/auth/AuthProvider';
import {ApiError} from '../src/api/client';
import {Card,Field,PrimaryButton,Screen,Title} from '../src/components/ui';
import {useTheme} from '../src/theme/ThemeProvider';

const schema=z.object({email:z.string().email('Enter a valid email.'),password:z.string().min(1,'Password is required.').max(72)});
type FormValues=z.infer<typeof schema>;

export default function LoginScreen(){
  const {authenticated,locked,login}=useAuth();
  const {colors}=useTheme();
  const [error,setError]=useState('');
  const {control,handleSubmit,formState:{errors,isSubmitting}}=useForm<FormValues>({resolver:zodResolver(schema),defaultValues:{email:'',password:''}});
  if(locked)return <Redirect href="/unlock"/>;
  if(authenticated)return <Redirect href="/(tabs)"/>;
  const submit=handleSubmit(async values=>{setError('');try{await login(values);router.replace('/(tabs)');}catch(e){setError(e instanceof ApiError||e instanceof Error?e.message:'Unable to sign in.');}});
  return <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
    <Screen>
      <View style={{paddingTop:54,paddingBottom:24}}><Text style={{fontSize:13,fontWeight:'800',letterSpacing:2,color:colors.textMuted}}>PORTFOLIO ADMIN</Text></View>
      <Title subtitle="Manage projects, clients, messages and your portfolio securely from your phone.">Welcome back</Title>
      <Card>
        <Controller control={control} name="email" render={({field:{value,onChange,onBlur}})=><Field label="Email" value={value} onChangeText={onChange} onBlur={onBlur} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="username" error={errors.email?.message}/>}/>
        <Controller control={control} name="password" render={({field:{value,onChange,onBlur}})=><Field label="Password" value={value} onChangeText={onChange} onBlur={onBlur} secureTextEntry textContentType="password" error={errors.password?.message}/>}/>
        {error?<Text accessibilityRole="alert" style={{color:colors.danger,fontSize:13,marginBottom:10}}>{error}</Text>:null}
        <PrimaryButton title="Sign In" onPress={()=>void submit()} loading={isSubmitting}/>
      </Card>
      <Text style={{color:colors.textMuted,textAlign:'center',fontSize:12,lineHeight:18,marginTop:8}}>Biometric sign-in becomes available after you enable it in Settings → Security.</Text>
    </Screen>
  </KeyboardAvoidingView>;
}
