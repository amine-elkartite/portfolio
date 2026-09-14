import React from 'react';
import {Text} from 'react-native';
import Constants from 'expo-constants';
import {Redirect} from 'expo-router';
import {useAuth} from '../../src/auth/AuthProvider';
import {Card,Screen,Title} from '../../src/components/ui';
import {useTheme} from '../../src/theme/ThemeProvider';
export default function AboutSettings(){const {authenticated,locked}=useAuth();const {colors}=useTheme();if(locked)return <Redirect href="/unlock"/>;if(!authenticated)return <Redirect href="/login"/>;return <Screen><Title subtitle="Secure companion application for the existing portfolio administration backend.">About</Title><Card><Text style={{color:colors.text,fontSize:18,fontWeight:'800'}}>Portfolio Admin</Text><Text style={{color:colors.textMuted,marginTop:6}}>Version {Constants.expoConfig?.version||'1.0.0'}</Text><Text style={{color:colors.textMuted,lineHeight:21,marginTop:14}}>Built with React Native and Expo. The app never connects directly to MySQL; all protected operations use the existing HTTPS Express API.</Text></Card></Screen>;}
