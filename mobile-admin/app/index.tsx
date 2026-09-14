import React from 'react';
import {Redirect} from 'expo-router';
import {LoadingState,Screen} from '../src/components/ui';
import {useAuth} from '../src/auth/AuthProvider';

export default function Index(){
  const {booting,authenticated,locked,user}=useAuth();
  if(booting)return <Screen scroll={false}><LoadingState/></Screen>;
  if(locked)return <Redirect href="/unlock"/>;
  if(authenticated&&user)return <Redirect href="/(tabs)"/>;
  return <Redirect href="/login"/>;
}
