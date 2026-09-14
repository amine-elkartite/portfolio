import React,{createContext,useCallback,useContext,useEffect,useMemo,useRef,useState} from 'react';
import {AppState,type AppStateStatus} from 'react-native';
import {authApi} from '../api/auth.api';
import {configureApiAuth,setApiAccessToken} from '../api/client';
import type {User} from '../types/api';
import {authenticateBiometric,biometricCapability,clearSecureSession,disableBiometricRefreshStorage,enableBiometricRefreshStorage,getDeviceIdentity,isBiometricSessionEnabled,readBiometricRefreshToken,readStandardRefreshToken,replaceRefreshToken,saveStandardRefreshToken} from '../security/secureSession';

type LoginInput={email:string;password:string};
type AuthContextValue={
  booting:boolean;authenticated:boolean;locked:boolean;user:User|null;biometricEnabled:boolean;
  login:(input:LoginInput)=>Promise<void>;logout:()=>Promise<void>;unlock:()=>Promise<boolean>;lock:()=>void;
  enableBiometric:()=>Promise<void>;disableBiometric:()=>Promise<void>;
  biometricCapability:typeof biometricCapability;
};

const AuthContext=createContext<AuthContextValue|null>(null);

export function AuthProvider({children}:{children:React.ReactNode}){
  const [booting,setBooting]=useState(true);
  const [user,setUser]=useState<User|null>(null);
  const [locked,setLocked]=useState(false);
  const [biometricEnabled,setBiometricEnabled]=useState(false);
  const refreshRef=useRef<string|null>(null);
  const biometricRef=useRef(false);
  const userRef=useRef<User|null>(null);

  const applySession=useCallback(async(payload:{accessToken:string;refreshToken:string;user:User},biometric:boolean)=>{
    setApiAccessToken(payload.accessToken);
    refreshRef.current=payload.refreshToken;
    userRef.current=payload.user;
    setUser(payload.user);
    setLocked(false);
    if(biometric)await replaceRefreshToken(payload.refreshToken,true);else await replaceRefreshToken(payload.refreshToken,false);
  },[]);

  const clearLocal=useCallback(async()=>{
    setApiAccessToken(null);
    refreshRef.current=null;
    userRef.current=null;
    setUser(null);
    setLocked(false);
    biometricRef.current=false;
    setBiometricEnabled(false);
    await clearSecureSession();
  },[]);

  const refreshAccess=useCallback(async()=>{
    const refreshToken=refreshRef.current;
    if(!refreshToken)return null;
    try{
      const device=await getDeviceIdentity();
      const payload=await authApi.refresh({refreshToken,deviceId:device.deviceId});
      refreshRef.current=payload.refreshToken;
      userRef.current=payload.user;
      setUser(payload.user);
      setApiAccessToken(payload.accessToken);
      await replaceRefreshToken(payload.refreshToken,biometricRef.current);
      return payload.accessToken;
    }catch{
      await clearLocal();
      return null;
    }
  },[clearLocal]);

  useEffect(()=>{
    configureApiAuth({refresh:refreshAccess,onUnauthorized:()=>{void clearLocal();}});
  },[clearLocal,refreshAccess]);

  useEffect(()=>{
    let active=true;
    void (async()=>{
      try{
        const biometrics=await isBiometricSessionEnabled();
        biometricRef.current=biometrics;
        if(!active)return;
        setBiometricEnabled(biometrics);
        if(biometrics){setLocked(true);return;}
        const token=await readStandardRefreshToken();
        if(!token)return;
        refreshRef.current=token;
        await refreshAccess();
      }finally{if(active)setBooting(false);}
    })();
    return()=>{active=false;};
  },[refreshAccess]);

  useEffect(()=>{
    const handler=(state:AppStateStatus)=>{
      if((state==='background'||state==='inactive')&&biometricRef.current&&userRef.current){
        setApiAccessToken(null);
        refreshRef.current=null;
        setLocked(true);
      }
    };
    const subscription=AppState.addEventListener('change',handler);
    return()=>subscription.remove();
  },[]);

  const login=useCallback(async({email,password}:LoginInput)=>{
    const device=await getDeviceIdentity();
    const payload=await authApi.login({email,password,...device});
    biometricRef.current=false;
    setBiometricEnabled(false);
    await saveStandardRefreshToken(payload.refreshToken);
    await applySession(payload,false);
  },[applySession]);

  const unlock=useCallback(async()=>{
    if(!biometricRef.current)return false;
    const refreshToken=await readBiometricRefreshToken();
    if(!refreshToken)return false;
    try{
      refreshRef.current=refreshToken;
      const device=await getDeviceIdentity();
      const payload=await authApi.refresh({refreshToken,deviceId:device.deviceId});
      await applySession(payload,true);
      return true;
    }catch{
      refreshRef.current=null;
      setApiAccessToken(null);
      return false;
    }
  },[applySession]);

  const lock=useCallback(()=>{
    if(!biometricRef.current)return;
    setApiAccessToken(null);refreshRef.current=null;setLocked(true);
  },[]);

  const enableBiometric=useCallback(async()=>{
    const capability=await biometricCapability();
    if(!capability.hardware||!capability.enrolled)throw new Error('No fingerprint or biometric authentication is configured on this device. Configure it in your device settings first.');
    const refreshToken=refreshRef.current;
    if(!refreshToken)throw new Error('Reconnect before enabling biometric login.');
    const verified=await authenticateBiometric('Enable biometric login');
    if(!verified)throw new Error('Biometric verification was cancelled or failed.');
    await enableBiometricRefreshStorage(refreshToken);
    try{await authApi.enableBiometric();}
    catch(error){await disableBiometricRefreshStorage(refreshToken);throw error;}
    biometricRef.current=true;setBiometricEnabled(true);
  },[]);

  const disableBiometric=useCallback(async()=>{
    const refreshToken=refreshRef.current;
    if(!refreshToken)throw new Error('Unlock the application before disabling biometric login.');
    await authApi.disableBiometric();
    await disableBiometricRefreshStorage(refreshToken);
    biometricRef.current=false;setBiometricEnabled(false);setLocked(false);
  },[]);

  const logout=useCallback(async()=>{
    const token=refreshRef.current;
    if(token){try{await authApi.logout(token);}catch{/* Local logout still proceeds if the network is unavailable. */}}
    await clearLocal();
  },[clearLocal]);

  const value=useMemo<AuthContextValue>(()=>({booting,authenticated:Boolean(user)&&!locked,locked,user,biometricEnabled,login,logout,unlock,lock,enableBiometric,disableBiometric,biometricCapability}),[booting,user,locked,biometricEnabled,login,logout,unlock,lock,enableBiometric,disableBiometric]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error('useAuth must be used inside AuthProvider');return value;}
