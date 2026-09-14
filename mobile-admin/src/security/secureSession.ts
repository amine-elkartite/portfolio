import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import {Platform} from 'react-native';

const DEVICE_ID='portfolio_admin_device_id';
const REFRESH_STANDARD='portfolio_admin_refresh';
const REFRESH_BIOMETRIC='portfolio_admin_refresh_biometric';
const BIOMETRIC_ENABLED='portfolio_admin_biometric_enabled';
const DEVICE_NAME='portfolio_admin_device_name';

function createDeviceId(){
  const random=Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2);
  return `device-${Date.now().toString(36)}-${random}`.slice(0,120);
}

export async function getDeviceIdentity(){
  let deviceId=await SecureStore.getItemAsync(DEVICE_ID);
  if(!deviceId){deviceId=createDeviceId();await SecureStore.setItemAsync(DEVICE_ID,deviceId);}
  let deviceName=await SecureStore.getItemAsync(DEVICE_NAME);
  if(!deviceName){deviceName=Platform.OS==='ios'?'iPhone / iPad':'Android device';await SecureStore.setItemAsync(DEVICE_NAME,deviceName);}
  const platform: 'android'|'ios'|'unknown'=Platform.OS==='android'?'android':Platform.OS==='ios'?'ios':'unknown';
  return {deviceId,deviceName,platform};
}

export async function isBiometricSessionEnabled(){return (await SecureStore.getItemAsync(BIOMETRIC_ENABLED))==='true';}

export async function biometricCapability(){
  const [hardware,enrolled,types]=await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
    LocalAuthentication.supportedAuthenticationTypesAsync()
  ]);
  return {hardware,enrolled,types};
}

export async function authenticateBiometric(promptMessage='Unlock Portfolio Admin'){
  const result=await LocalAuthentication.authenticateAsync({promptMessage,cancelLabel:'Use password',disableDeviceFallback:false});
  return result.success;
}

export async function saveStandardRefreshToken(token:string){
  await SecureStore.setItemAsync(REFRESH_STANDARD,token,{keychainAccessible:SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY});
  await SecureStore.deleteItemAsync(REFRESH_BIOMETRIC).catch(()=>undefined);
  await SecureStore.setItemAsync(BIOMETRIC_ENABLED,'false');
}

export async function readStandardRefreshToken(){return SecureStore.getItemAsync(REFRESH_STANDARD);}

export async function enableBiometricRefreshStorage(token:string){
  await SecureStore.setItemAsync(REFRESH_BIOMETRIC,token,{requireAuthentication:true,authenticationPrompt:'Protect Portfolio Admin with biometrics',keychainAccessible:SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY});
  await SecureStore.deleteItemAsync(REFRESH_STANDARD);
  await SecureStore.setItemAsync(BIOMETRIC_ENABLED,'true');
}

export async function readBiometricRefreshToken(){
  try{return await SecureStore.getItemAsync(REFRESH_BIOMETRIC,{requireAuthentication:true,authenticationPrompt:'Unlock Portfolio Admin'});}catch{return null;}
}

export async function disableBiometricRefreshStorage(token:string){
  await SecureStore.setItemAsync(REFRESH_STANDARD,token,{keychainAccessible:SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY});
  await SecureStore.deleteItemAsync(REFRESH_BIOMETRIC).catch(()=>undefined);
  await SecureStore.setItemAsync(BIOMETRIC_ENABLED,'false');
}

export async function replaceRefreshToken(token:string,biometric:boolean){
  if(biometric)await SecureStore.setItemAsync(REFRESH_BIOMETRIC,token,{requireAuthentication:true,authenticationPrompt:'Update secure Portfolio Admin session',keychainAccessible:SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY});
  else await SecureStore.setItemAsync(REFRESH_STANDARD,token,{keychainAccessible:SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY});
}

export async function clearSecureSession(){
  await Promise.all([
    SecureStore.deleteItemAsync(REFRESH_STANDARD).catch(()=>undefined),
    SecureStore.deleteItemAsync(REFRESH_BIOMETRIC).catch(()=>undefined),
    SecureStore.setItemAsync(BIOMETRIC_ENABLED,'false')
  ]);
}
