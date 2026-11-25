# Pairody on Google Play (Android)

The Android app wraps the same game files as the iOS app (`scripts/build-app.sh` → `app-www/`)
with Capacitor 8. Native files live in `android/`. The website is unchanged, and the Pages deploy
drops `android/` and `resources/` like it drops `ios/`.

## Build

- **In the cloud (easiest):** GitHub → Actions → **Android build** → *Run workflow*. It makes a
  signed `.aab` (artifact `pairody-release`) ready to upload to Google Play. It needs the four
  `ANDROID_KEY*` secrets listed at the top of `.github/workflows/android.yml`. Every pull request
  that touches the game also runs a debug build to prove it still compiles.
- **Version:** the name people see is `version` in `package.json` (shared with iOS); the version
  code is the workflow's run number, so it always goes up.
- **On a computer with Android Studio:** `npm install`, then `npm run android:open`, then Run.
- **Icon and splash:** made from `resources/` (copies of the iOS icon and splash, plus a plain
  cream `icon-background.png` for Android's adaptive icon). Regenerate with `npm run android:assets`.

## How the Android app differs

- **Every board is free.** Pairody Plus is sold in the iOS app only for now (Michael, 2026-11-25);
  `assets/plus.js` locks nothing on Android and shows no Free/Plus tags. Selling Plus on Android
  later means Google Play Billing (a native plugin like `PlusStore.swift`) and a Play merchant account.
- Analytics events start with `android/` instead of `ios/` (see `docs/analytics.md`).
- `.ios-only` / `.android-only` in the HTML pick between the two apps (`assets/native.js` adds
  `ios` or `android` to `<html>` next to `native`).
- No service worker or update check, as on iOS: updates come through Google Play.
