import React from 'react';
import {Redirect,useLocalSearchParams} from 'expo-router';
import {useQuery} from '@tanstack/react-query';
import {projectsApi} from '../../src/api/projects.api';
import {ProjectEditor} from '../../src/features/projects/ProjectEditor';
import {ErrorState,LoadingState,Screen} from '../../src/components/ui';
import {useAuth} from '../../src/auth/AuthProvider';
export default function EditProject(){const {authenticated,locked}=useAuth();const params=useLocalSearchParams<{id:string}>();const id=Number(params.id);const query=useQuery({queryKey:['projects',id],queryFn:()=>projectsApi.one(id),enabled:authenticated&&Number.isFinite(id)&&id>0});if(locked)return <Redirect href="/unlock"/>;if(!authenticated)return <Redirect href="/login"/>;if(query.isLoading)return <Screen><LoadingState/></Screen>;if(query.isError||!query.data)return <Screen><ErrorState message={query.error instanceof Error?query.error.message:'Project not found.'} onRetry={()=>void query.refetch()}/></Screen>;return <ProjectEditor project={query.data}/>;}
