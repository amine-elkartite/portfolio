import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';

const base=process.env.TEST_BASE_URL||'http://localhost:5000';
const testPassword=process.env.TEST_ADMIN_PASSWORD;
const deviceId='ci-mobile-'+randomBytes(8).toString('hex');

async function call(path,{method='GET',body,token}={}){
  const response=await fetch(base+'/api'+path,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`}:{})},body:body?JSON.stringify(body):undefined});
  return {response,result:await response.json()};
}

test('mobile admin session lifecycle',{skip:!testPassword},async()=>{
  const login=await call('/auth/mobile/login',{method:'POST',body:{email:'amineelkartite@gmail.com',password:testPassword,deviceId,deviceName:'CI Mobile Device',platform:'android'}});
  assert.equal(login.response.status,200,JSON.stringify(login.result));
  const {accessToken,refreshToken}=login.result.data;
  assert.ok(accessToken);assert.ok(refreshToken);

  const protectedCall=await call('/messages/unread-count',{token:accessToken});
  assert.equal(protectedCall.response.status,200);

  const sessions=await call('/auth/mobile/sessions',{token:accessToken});
  assert.equal(sessions.response.status,200);
  assert.ok(sessions.result.data.some(session=>session.deviceId===deviceId&&session.current));

  assert.equal((await call('/auth/mobile/biometric/enable',{method:'POST',token:accessToken})).response.status,200);
  const prefs=await call('/auth/mobile/notification-settings',{method:'PATCH',token:accessToken,body:{notificationsEnabled:true,sound:false,vibration:true,badge:true,showSenderName:false}});
  assert.equal(prefs.response.status,200);
  assert.equal(prefs.result.data.sound,false);

  const refreshed=await call('/auth/mobile/refresh',{method:'POST',body:{refreshToken,deviceId}});
  assert.equal(refreshed.response.status,200,JSON.stringify(refreshed.result));
  const rotated=refreshed.result.data;
  assert.notEqual(rotated.refreshToken,refreshToken);
  assert.equal((await call('/auth/mobile/refresh',{method:'POST',body:{refreshToken,deviceId}})).response.status,401);

  assert.equal((await call('/auth/mobile/logout',{method:'POST',body:{refreshToken:rotated.refreshToken}})).response.status,200);
  assert.equal((await call('/messages/unread-count',{token:rotated.accessToken})).response.status,401);
});
