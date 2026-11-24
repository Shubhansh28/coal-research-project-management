# Coal Research mobile app

This Expo Router application provides native Android and iOS access to the existing Coal Research Project Management API. All mobile code is isolated in this directory; the backend and web client are not changed.

## Stack

- Expo and React Native with Expo Router
- React Native Paper
- Axios and TanStack Query
- Expo SecureStore for the persisted `auth_token` cookie

## Run locally

```bash
cd mobile
cp .env.example .env
npm install
npx expo start
```

Use `npx expo start --android` or `npx expo start --ios` for a simulator/device. The cookie manager relies on native networking and SecureStore; use an Expo development build when Expo Go does not provide the required native cookie behavior.

`EXPO_PUBLIC_API_URL` defaults to the deployed API and can be overridden in `.env`. The API client captures the login `Set-Cookie` header, stores only the cookie pair in SecureStore, and attaches it to API requests. The cookie is never exposed through the UI and passwords are never persisted. Startup calls `/api/auth/me`; an HTTP 401/403 clears the session. JWT expiry remains the backend's 15-minute limit; no refresh-token flow is implemented.

## API coverage

Authentication, role-specific dashboards, projects, project status, progress reports, report review, fund reports, profile, and project document links are integrated against the existing API paths. Documents are URL links because the backend does not provide multipart upload storage; local files must be hosted before a link can be submitted.

## Native verification

Run `npx expo-doctor`, then test login, restart/session restoration, logout, expiration, role navigation, validation, duplicate submissions, and document links on both an Android and an iOS development build. Native device testing is not available in this repository environment, so cookie persistence and Android/iOS runtime behavior require verification on those builds.
