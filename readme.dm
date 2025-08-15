# Project Setup Guide

A concise, ready-to-edit guide for running the **Server** (API + Telegram bot + messenger workers) and the **React Native** app, with all required keys and files.

---

## Prerequisites
- **Node.js** 18+ and **npm** or **yarn**
- **pm2** globally for server process management  
  ```bash
  npm i -g pm2
  ```
- For mobile:
  - **Expo CLI** & **EAS CLI**
    ```bash
    npm i -g expo-cli eas-cli
    ```
  - **Android Studio** (Android SDK) for Android builds
  - **Xcode** for iOS simulator/builds (macOS)

---

## Repository Layout
```
.
├─ server/
│  ├─ src/...
│  ├─ ecosystem.config.js
│  └─ .env            
└─ rn-connect-app/
   ├─ src/components/...
   ├─ .env            # Expo/React Native envs
   ├─ service-account.json
   └─ google-services.json
```

---

## Server (API / tg-bot / messenger)

### Environment variables
Create and set the following (via pm2 `env`, a `.env`, your CI, or system envs):

**API**
- `TWILIO_SID`
- `TWILIO_TOKEN`
- `INSTAGRAM_CLIENT_ID`
- `INSTAGRAM_CLIENT_SECRET`

**Telegram bot**
- `GOOGLE_API_KEY`

### pm2 setup
1) Fill your keys in `ecosystem.config.js` (or load them from your environment).

2) Start and manage with pm2:
```bash
cd server
pm2 start ecosystem.config.js
pm2 status
pm2 logs
```

---

## React Native app

### Required files
Place the following **files** in the app root (do not commit secrets):
- `service-account.json` (for notifications)
- `google-services.json` (for Android Firebase/FCM)

### Environment variables
- In `app/.env` (Expo reads `EXPO_PUBLIC_` at runtime):
  ```dotenv
  # app/.env
  EXPO_PUBLIC_GOOGLE_CLIENT_ID=
  ```

- **Google Maps Places API**:
  - Currently referenced **in code**: `src/components/MapAutocomplete.tsx` as `GOOGLE_PLACES_API_KEY`.
  - Ensure the key is set there.

### Start scripts
From the `app/` directory:
```bash
# install deps
yarn

# start metro / run targets
npm start
npm run android
npm run ios
npm run web
```

### iOS simulator build (EAS)
```bash
eas build -p ios --profile development-simulator
```
> Requires `eas.json` configured and an Apple developer account linked to EAS.

---

## Social auth keys and file locations

- **Facebook**
  - Key: `FACEBOOK_APP_ID`
  - File: `src/components/socialAuthButtons/FacebookAuthButton.tsx`

- **Google**
  - Keys: `GOOGLE_CLIENT_ID_ANDROID`, `GOOGLE_CLIENT_ID_IOS`, `GOOGLE_CLIENT_ID_WEB`
  - File: `src/components/socialAuthButtons/GoogleAuthButton.tsx`

- **Instagram**
  - App ID: `INSTAGRAM_APP_ID`
  - File: `src/components/socialAuthButtons/InstagramAuthButton.tsx`

---