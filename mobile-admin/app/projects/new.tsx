import React from 'react';
import {Redirect} from 'expo-router';
import {ProjectEditor} from '../../src/features/projects/ProjectEditor';
import {useAuth} from '../../src/auth/AuthProvider';
export default function NewProject(){const {authenticated,locked}=useAuth();if(locked)return <Redirect href="/unlock"/>;if(!authenticated)return <Redirect href="/login"/>;return <ProjectEditor/>;}
