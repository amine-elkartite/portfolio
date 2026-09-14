# Portfolio Mobile Admin

Secure React Native + Expo administration client for the existing Amine ELKARTITE portfolio backend.

## Architecture

```text
Portfolio visitor
  -> existing public website
  -> Express API
  -> MySQL

Mobile Admin
  -> HTTPS Express API
  -> existing controllers/models + mobile auth routes
  -> same MySQL database

New contact message
  -> POST /api/messages
  -> message committed to MySQL as unread
  -> Expo Push Service (best effort)
  -> authenticated Mobile Admin device
```

The mobile app never connects directly to MySQL. It reuses the same projects, services, skills, messages, clients, tasks, quotes, invoices, settings, SEO and dashboard data as the web administration panel.

## Stack

- Expo SDK 57 / React Native 0.86 / React 19.2
- TypeScript (strict mode)
- Expo Router
- TanStack Query
- React Hook Form + Zod
- Expo SecureStore
- Expo LocalAuthentication
- Expo Notifications
- Expo ImagePicker
- Expo Clipboard
- Lucide React Native

## Requirements

- Node.js 24 (the repository engine)
- Android Studio for local Android native builds, or an Android device with a development build
- Xcode for local iOS native builds
- Existing portfolio backend and MySQL database
- HTTPS API URL for production
- EAS project ID for remote Expo push notifications

Remote push notifications on Android require a development/production build; do not use Expo Go as the final push-notification test environment.

## Install

```bash
cd mobile-admin
npm install
cp .env.example .env
```

Configure:

```env
EXPO_PUBLIC_API_BASE_URL=https://your-domain.com/api
EXPO_PUBLIC_EAS_PROJECT_ID=your-eas-project-id
```

The API base URL must include `/api` and should not end in `/`.

## Database migration

From the repository root:

```bash
npm run db:migrate:mobile
```

The migration creates `mobile_sessions` without dropping or replacing existing data. Fresh database initialization also runs this migration automatically.

## Local networking

A physical phone cannot normally reach `localhost` on your computer. Use the computer LAN address, for example:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.20:5000/api
```

For an Android emulator, `10.0.2.2` commonly points to the host machine:

```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:5000/api
```

Production must use HTTPS.

## Start

```bash
npm start
```

For native development builds:

```bash
npm run android
npm run ios
```

## Authentication model

The existing web admin keeps its HttpOnly `portfolio_session` cookie and SameSite/origin protections.

The mobile app uses a separate mobile session model:

1. Password login is sent to `POST /api/auth/mobile/login`.
2. The backend creates a cryptographically random device refresh credential.
3. Only a SHA-256 hash of that refresh credential is stored in MySQL.
4. The mobile refresh credential is kept in SecureStore.
5. Access tokens are short lived (15 minutes) and kept in memory.
6. Refresh credentials rotate on each refresh and cannot be reused.
7. Every mobile Bearer request validates both the JWT and the active, non-revoked device session.
8. Logout/device revocation immediately invalidates the mobile access token at the API layer.
9. Changing the account password revokes mobile sessions and increments the existing account token version.

Passwords are never stored by the mobile app.

## Biometric login

Biometric authentication uses the operating-system biometric system through `expo-local-authentication` and `expo-secure-store`.

Enable it from:

`Settings -> Security -> Biometric Login`

Flow:

```text
normal password login
  -> verify biometric hardware/enrollment
  -> OS biometric confirmation
  -> move refresh credential into biometric-protected SecureStore entry
  -> mark this mobile session biometric-enabled on backend
```

On a later launch:

```text
app detects biometric-protected session
  -> locked screen
  -> OS fingerprint / Face ID / Touch ID
  -> SecureStore releases device credential
  -> backend rotates credential + issues short-lived access token
  -> dashboard
```

The app never receives or stores fingerprint/Face ID templates.

If biometrics fail or are cancelled, the user can choose password login instead.

## Push notifications for website messages

After mobile authentication, the app checks notification permission once. If permission is undetermined it requests permission; if permission was denied previously it does not repeatedly show the system prompt.

When permission is granted, the device Expo push token is registered against the current authenticated mobile session.

A successful public contact submission follows this order:

```text
validate form
  -> save message in MySQL with status=unread
  -> attempt push delivery to enabled active admin devices
  -> return contact success response
```

Push delivery is intentionally best effort. If the push provider is unavailable, the contact message remains stored and the visitor still receives a successful submission response.

Push payloads contain only routing metadata and a minimal preview. The full private message is fetched from the protected API after authentication.

Example routing payload:

```json
{
  "type": "NEW_MESSAGE",
  "messageId": 123
}
```

Tapping a notification opens the target message after any required biometric/password authentication.

## Notification settings

`Settings -> Notifications`

Device-specific options:

- new contact message notifications
- sound
- vibration
- app badge
- show sender name/subject in the preview
- device permission status

Turning notifications off never stops contact messages from being stored.

## Main screens

Bottom tabs:

- Dashboard
- Projects
- Messages
- Clients
- More

More includes:

- Services
- Skills
- Tasks
- Quotes
- Invoices
- Statistics
- SEO
- Settings
- Profile
- Security

The CRUD screens call the existing real API; there is no mock admin database.

## Project image uploads

Project create/edit uses the existing multipart project API and the same backend upload validation. The mobile picker rejects images larger than 5 MB before upload when file size information is available.

## Themes

`Settings -> Appearance`

- Light
- Dark
- System

This is an app-only local preference and does not pollute website settings in MySQL.

## Verification

```bash
npm run typecheck
npm run lint
npx expo-doctor
npx expo install --check
```

The repository also contains `.github/workflows/mobile-admin-ci.yml`, which runs:

- MySQL-backed backend initialization
- API integration tests
- mobile session integration tests
- Expo dependency compatibility check
- TypeScript typecheck
- ESLint
- Expo Doctor

## Backend tests

From the repository root, with the backend running and a dedicated test database:

```bash
npm test
```

`backend/tests/mobile-auth.test.js` verifies password login, Bearer API access, mobile session listing, biometric server state, notification preferences, refresh-token rotation/replay rejection, logout and immediate access revocation.

## Security notes

- Do not put database credentials in the mobile `.env`.
- Do not put JWT or refresh credentials into notification payloads.
- Do not store mobile tokens in AsyncStorage.
- Do not remove the existing web SameSite/origin protections for mobile compatibility.
- Keep `JWT_SECRET` server-side only.
- Use HTTPS in production.
- Push tokens are associated only with authenticated mobile sessions.
- Invalid Expo device registrations are cleared when the provider reports `DeviceNotRegistered`.

## Production checklist

1. Apply `npm run db:migrate:mobile` to the production database.
2. Deploy the updated Express backend.
3. Confirm `/api/health` includes the `mobile_sessions` table.
4. Set the production `EXPO_PUBLIC_API_BASE_URL`.
5. Configure an EAS project and push notification credentials.
6. Build a native Android/iOS development or production binary.
7. Test password login first.
8. Enable biometric login from Settings and reopen the app.
9. Submit a real portfolio contact message and verify foreground/background/terminated notification behavior on a physical device.
10. Verify the web admin still sees the same message/status changes.
