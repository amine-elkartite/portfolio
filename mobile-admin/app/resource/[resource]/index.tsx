import React from 'react';
import {Redirect,useLocalSearchParams} from 'expo-router';
import {ResourceList} from '../../../src/features/resources/ResourceList';
import {isManagedResource} from '../../../src/features/resources/resourceConfig';
import {useAuth} from '../../../src/auth/AuthProvider';
import {ErrorState,Screen} from '../../../src/components/ui';
export default function ResourceRoute(){const {resource}=useLocalSearchParams<{resource:string}>();const {authenticated,locked}=useAuth();if(locked)return <Redirect href="/unlock"/>;if(!authenticated)return <Redirect href="/login"/>;if(!isManagedResource(resource))return <Screen><ErrorState message="Unknown admin resource."/></Screen>;return <ResourceList resource={resource}/>;}
