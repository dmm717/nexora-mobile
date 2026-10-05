# Android release fixes — 2026-10-05

Base: `075989c4beddcfae5a2a6cb09b7de8efcb5b82e2` (latest origin/main when work began).

## Root causes and changes

- `expo-screen-capture` declares `android.permission.READ_MEDIA_IMAGES` in its native Android manifest, restricted to API 33. Autolinking/manifest merging includes it even though app.json has an empty explicit permission list. The installed `expo-image-picker` manifest does not declare this permission. Nexora uses `usePreventScreenCapture`, not screenshot-listener permission requests.
- `eas.json` explicitly set `EXPO_PUBLIC_API_URL` to `https://nexora-backend-q32b.onrender.com/api/v1` in both preview and production. Expo inlines this public env value into the bundle. `src/api/client.ts` already failed for missing env and had no Render fallback; it previously accepted any HTTPS production URL.
- `app.json` adds READ_MEDIA_IMAGES to the existing Android blocklist. All other blocks and audio settings remain unchanged.
- `eas.json` sets preview APK and production AAB profiles to `https://api.nexorainterview.io.vn/api/v1`. Development localhost and test overrides remain available.
- `app.config.js` rejects missing or noncanonical URLs when EAS_BUILD_PROFILE or EXPO_PUBLIC_ENV indicates production. `src/api/client.ts` also validates the production runtime environment. No fallback is added.
- `tests/androidReleaseConfig.test.js` evaluates config in real Node subprocesses, avoiding Jest/Expo env inlining. It covers canonical profiles, missing/wrong/trailing-slash production URLs, and development/test overrides.
- `tests/avatarPicker.test.tsx` covers selection/upload and cancellation through the existing component.

## Permissions before and after

Resolved public Expo `android.permissions`, before and after, is:

```
android.permission.RECORD_AUDIO
android.permission.MODIFY_AUDIO_SETTINGS
android.permission.FOREGROUND_SERVICE
android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK
```

These config values are not a complete merged binary permission inventory.
The blocklist grows from 10 to 11 entries, adding only READ_MEDIA_IMAGES.
Before, the dependency manifest's READ_MEDIA_IMAGES declaration was unblocked.
After, Expo introspection and actual Android prebuild emit:

```xml
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" tools:node="remove"/>
```

This is the Android manifest-merger removal directive, not an active permission grant. The generated app manifest retains RECORD_AUDIO and has no BILLING declaration. A merged APK/AAB manifest has not been inspected for this change.

## Avatar and consumption-only behavior

The production avatar component is unchanged: launchImageLibraryAsync with image-only selection, square editing and quality 0.8; then the existing MIME/5 MB validation, upload and user refresh. Tests confirm upload of the picker-returned URI and cancellation without requesting media-library permission. Installed Expo ImagePicker Android code uses PickVisualMedia with legacy=false by default, and launchImageLibraryAsync does not request gallery permission. This agrees with the [SDK 57 ImagePicker documentation](https://docs.expo.dev/versions/v57.0.0/sdk/imagepicker/).

The [SDK 57 app config documentation](https://docs.expo.dev/versions/v57.0.0/config/app/#blockedpermissions) describes blockedPermissions as tools:node removal during manifest merging.

No pricing, entitlement, navigation, speech, token handling, backend, upload contract, package identifier or version logic changes. Pricing/billing source paths and generated app manifest were checked: no PayOS checkout, payment link/CTA, WebView checkout, Google Play Billing dependency or BILLING permission introduced. Historical audit documents still contain old Render URLs; they are not shipped production config/source.

## Validation

- npm ci: passed; existing peer/deprecation warnings and 62 dependency advisories (12 moderate, 50 high).
- npm run lint: passed.
- npx tsc --noEmit: passed (repo has no typecheck script).
- npm run test:ci -- --runInBand --testTimeout=15000 --coverageDirectory=dist/test-coverage: 17 suites, 119 tests passed, including auth/login/refresh/logout, pricing/entitlement and avatar regressions. Existing hydration test logs Unsupported BodyInit type; this is not device session-restore proof.
- Default 5-second Jest timeout intermittently failed the existing interviewReportingResources test; it passed in another default-timeout run and in the final 15-second run. Plain npm test also left open handles; the canonical test:ci script uses forceExit.
- npx expo-doctor: 21/21 passed.
- npm audit --omit=dev --audit-level=critical: passed the configured threshold; the above moderate/high advisories remain.
- npx expo config --type public: passed using production profile env; READ_MEDIA_IMAGES blocked, microphone retained.
- npx expo config --type introspect: passed; removal directive verified.
- npx expo prebuild --platform android --no-install: passed; removal directive verified in android/app/src/main/AndroidManifest.xml. Expo's automatic changes to package scripts were excluded from this patch.
- npx expo export --platform android --output-dir dist/android-release --no-bytecode with production env: passed, 4054 modules. Plain JS output permits direct URL inspection; this is not a Hermes APK/AAB build.
- Exported entry-a65441c22f5d4252edcdc75d33f4c97b.js (6.3 MB): canonical API URL present, Render hostname absent. Production source/config search also found no Render hostname.
- git diff --check for changed source/config/tests: passed.

## Remaining release validation

No new APK or AAB was built: EAS CLI reports Not logged in, and no local Android SDK/adb was found. No device/emulator avatar test or live production API/auth test was performed. A signed preview APK and production AAB still need manifest and embedded-bundle inspection, plus device avatar/cancellation/session-restore QA. Do not treat the prebuild removal directive or JS export as final binary certification. No merge or Play submission performed.

Verdict: READY_FOR_REVIEW for this source/config correction; binary release validation remains pending.
