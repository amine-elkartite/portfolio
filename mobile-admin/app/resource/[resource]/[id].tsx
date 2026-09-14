import React from 'react';
import {Redirect,useLocalSearchParams} from 'expo-router';
import {ResourceEditor} from '../../../src/features/resources/ResourceEditor';
import {isManagedResource} from '../../../src/features/resources/resourceConfig';
import {useAuth} from '../../../src/auth/AuthProvider';
import {ErrorState,Screen} from '../../../src/components/ui';
export default function ResourceEditorRoute(){const params=useLocalSearchParams<{resource:string;id:string}>();const {authenticated,locked}=useAuth();if(locked)return <Redirect href="/unlock"/>;if(!authenticated)return <Redirect href="/login"/>;if(!isManagedResource(params.resource))return <Screen><ErrorState message="Unknown admin resource."/></Screen>;const id=params.id==='new'?'new':Number(params.id);if(id!=='new'&&(!Number.isFinite(id)||id<1))return <Screen><ErrorState message="Invalid resource identifier."/></Screen>;return <ResourceEditor resource={params.resource} id={id}/>;}
