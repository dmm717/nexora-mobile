# Android 26101501 — fixes, SDK reconciliation and release verification

Verified 2026-10-15, Vietnam time. No Play upload or publication performed.

## Artifact

- Package: `com.vuvietanh.nexora`; versionName `1.0.0`; versionCode `26101501`.
- File: `E:\nx-play\deliverables\Nexora_AI_GooglePlay_Release_26101501.aab`.
- Size: 79,886,043 bytes.
- SHA-256: `bdeac21d17fb7ff6282dbf2a48d6f6cf67eed2db233cc6e83711bcf4614d6770`.
- Source checkout: `E:\nx-play`, branch `fix/android-google-play-local-release`, based on commit `568938e54a536d927a440428ce0b4cfcad23546e` plus the current working changes. Changes have not been pushed.
- Previous `Nexora_AI_GooglePlay_Release.aab` is preserved; use the filename with `26101501` for this release.

## Changes

1. `loginAsync` always clears global loading in `finally`, including failed login and follow-up profile requests. Errors continue to propagate to the caller. Added regression tests for HTTP 401/network failures and successful retry.
2. Removed the unsupported interview camera preview/control and the inaccurate expression-analysis permission message. Voice recording, typed answers and playback remain. Removed the unused `expo-camera` dependency and its barcode dependencies; no remaining package versions were changed in the lockfile.
3. Unified launcher icon, native splash, startup, login, verification logo and web favicon with the existing Play Console robot on a light background. The canonical image is `assets/images/play-console-icon.png`, downloaded from the image currently used as `logoplay.png` on the default Play listing. Play Console already uses this image, so its listing was not modified.
4. Added signing-helper diagnostics that record only exception class names outside the repository, to diagnose operator signing failures without logging passwords or key material.

## ML Kit and Advertising ID reconciliation

The old version `26101301` included ML Kit barcode scanning, DataTransport, an ML Kit initialization provider and SDK-instance-ID code through `expo-camera`. Google's [ML Kit disclosure guidance](https://developers.google.com/ml-kit/android-data-disclosure) describes SDK diagnostics and identifiers; absence of Advertising ID does not imply absence of SDK telemetry.

For the new signed AAB, examined the actual manifest, embedded dependency metadata, R8 mapping, all DEX, native libraries and bundled JS:

- No ML Kit class/package markers, barcode-scanner dependency markers or `getMlSdkInstanceId`.
- No DataTransport class/package/backend markers.
- No Firebase Analytics/Google measurement class/package markers.
- No Expo Camera module markers.
- No Advertising ID permission or checked Advertising ID APIs.
- No ML Kit provider/service/scanner activity remains in the manifest.

**Advertising ID: choose No for this new artifact.** ML Kit-specific SDK identifier/telemetry collection no longer applies to this artifact because the SDK is absent. This does not mean Data safety should say “no data collected”: accounts, CVs, speech and backend handling remain covered by the source worksheet and actual operational configuration.

Play declarations must cover applicable active distributed versions. Do not retrospectively certify the old ML Kit-containing version or assume all tracks have already been replaced. The current Console Data safety form, network traffic and backend configuration were not inspected or changed during this build.

## Verification

- Full Jest after the login/camera changes: **17 suites, 122 tests passed**. After the logo change, auth and Android config suites passed again: **17 tests**. Existing test-environment hydration/act warnings remain; no failed assertions.
- TypeScript and ESLint passed for the functional changes. The subsequent UI changes replace only asset references/configuration.
- Final Gradle production build: **BUILD SUCCESSFUL in 11m 33s**, 849 actionable tasks.
- bundletool validation passed; manifest package/versionCode/target SDK 36 match; release is not debuggable and cleartext is disabled.
- All **1,642 payload entries** cryptographically verified against the expected upload certificate. Public certificate SHA-256: `EE:BA:D8:41:D6:19:22:BE:DA:42:45:FD:71:B9:65:09:DA:56:6E:8D:CF:9F:77:5A:85:21:20:3A:2F:BF:86:ED`.
- Five unique package-scoped providers, all non-exported. Microphone permission retained; CAMERA and AD_ID absent.
- Production HTTPS API present in JS; checked staging/localhost endpoints absent.
- AAB packaging requests 16 KB alignment; all **48 native 64-bit libraries** pass ELF load alignment, offset congruence and rounded RELRO checks. This is static verification, not a 16 KB device run.
- Logo decoded pixels in `base/res/drawable-mdpi-v4/assets_images_playconsoleicon.png` match the canonical Play image exactly. Canonical PNG SHA-256: `8fa2e8314e4b378c455c50d75d5e7ee6f51edb2d2bcb55ab9549036b36a3fa6e`. Generated Android adaptive icon references the new foreground, without the old monochrome/background artwork.
- Temporary signing properties confirmed deleted by the runner. Private key remains outside Git; no passwords or private key material were printed or uploaded.
- Ignored build evidence: `.local-build/verification-26101501.json`, `aab-manifest-26101501.xml`, `aab-config-26101501.json`, `aab-inspection-26101501.json`, `android-release-build.log`.

## Remaining checks

The edge-to-edge/deprecated Window API warning from React Native/Material was not patched or certified resolved. MainActivity remains portrait-locked; the removed ML Kit scanner activity is gone. Test actual UI on Android 15/16, including system bars, keyboard, landscape, split screen and large screens. [Android 15 behavior](https://developer.android.com/about/versions/15/behavior-changes-15), [Android 16 behavior](https://developer.android.com/about/versions/16/behavior-changes-16).

Device installation/runtime, backend security, SDK network capture, Pre-launch report and final Play acceptance remain unverified. Existing Expo patch mismatch warnings and npm advisories were not broadly fixed. No approval guarantee is implied.
