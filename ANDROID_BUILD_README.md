# AgeJoy Android Build

## Identity
- App name: AgeJoy
- Package ID: com.agejoy.app
- Version: 1.0.0

## Prepare
npm install
npm run build
npx cap add android
npx cap sync android

## Build APK
npx cap build android --androidreleasetype APK

## Build AAB for Google Play
npx cap build android --androidreleasetype AAB

A release build must be signed with a secure Android keystore. Keep the keystore and credentials safe because future Play Store updates need consistent signing.

## Features prepared
- Age calculator
- Birthday countdown
- Wishes, blessings and prayers
- Daily motivation
- Favorites stored locally on-device
- Copy and share
- Dark mode
- Privacy Policy
