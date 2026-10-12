# Nexora Android local release audit

Status: production AAB built, signed and independently verified locally. Google Play upload-key activation is scheduled, not yet effective. No Play acceptance is claimed.

## Source and scope

- Repository: https://github.com/dmm717/nexora-mobile
- Fetched and audited main: `71cb98faee16d7480c7680bcf0d925a6c7ab8c90`.
- Branch: `fix/android-google-play-local-release`.
- Isolated checkout: `E:\nx-play`. Original checkout `E:\nexora-mobile` was not changed.
- No cloud build, Expo login, deployment, Play upload, merge, or push performed.
- Changed source files: `.gitignore`, `app.json`, `app.config.js`, `tests/androidReleaseConfig.test.js`, `plugins/with-local-android-release.js`, `scripts/PrepareAndroidSigning.java`, `scripts/build-android-local.ps1`, and this report. The local fix commit is the branch HEAD; the audited source base is the full SHA above. Native output, caches and AAB are ignored.

## Environment

- Windows 10, version 10.0.19045; Git 2.54.0.windows.1.
- Node 24.11.1; npm 11.6.2.
- Android Studio JBR / OpenJDK 25.0.3: `E:\AndroidStudio\jbr`.
- Native retry JDK: Eclipse Temurin 21.0.12.1+1 LTS, `E:\nx-tools\jdk21\jdk-21.0.12.1+1`. Vendor SHA-256 of its downloaded archive matched `f9d6e191ab098c0d416e7d588a24420a8621cd2f4720dab2459b8b7b2d2d8b4e`. No global JAVA_HOME/PATH changes.
- Gradle wrapper 9.3.1; runtime confirmed with `gradlew.bat --version`.
- First build was deliberately stopped after NDK installation when C: free space fell to ~1.6 GB. Gradle caches were copied to `E:\nx-gradle`; the final runner uses that GRADLE_USER_HOME and the checkout's `.local-build/tmp` for TEMP/TMP. No explicit Gradle clean rebuild was performed.
- Android Gradle Plugin 8.12.0; Kotlin 2.1.20.
- Original SDK: `C:\Users\PC\AppData\Local\Android\Sdk`. Build SDK copied to `E:\nx-android-sdk`; local.properties points there. The NDK installed during this task was copied to E: and its C: duplicate removed after path/copy verification to recover ~2.4 GB. Original preinstalled SDK components were preserved.
- SDK platform 36 revision 2; Build Tools 36.0.0. Gradle also installed Build Tools 35.0.0 for a native dependency.
- Command-line Tools 23.0; platform-tools 37.0.1.
- Expo 57.0.26, React Native 0.86.3, React 19.2.3.
- Bundletool 1.18.3 obtained from Google's official GitHub release.
- SDK 57 docs reviewed: https://docs.expo.dev/versions/v57.0.0/ and https://docs.expo.dev/versions/v57.0.0/sdk/build-properties/.

## Identity, configuration and audit

- Android package and generated namespace/applicationId: `com.vuvietanh.nexora`.
- Deterministic versionCode: `26101301`; versionName `1.0.0`.
- The user explicitly confirmed Play Console has never accepted an AAB for this application. No accepted versionCode must be exceeded for this first upload. The value is within Google's 2,100,000,000 limit.
- Existing iOS bundle ID `com.nexora.app` and its dynamic build-number strategy are preserved.
- Generated Gradle configuration reports compileSdk 36, targetSdk 36, minSdk 24, NDK 27.1.12297006.
- Required environment was explicitly passed to prebuild and Gradle/Metro: `EXPO_PUBLIC_API_URL=https://api.nexorainterview.io.vn/api/v1`, `EXPO_PUBLIC_ENV=production`, `NODE_ENV=production` for Gradle.
- No hardcoded old Android package found in active source beyond the iOS identifier. Tracked historical coverage contains an obsolete URL and is outside the app bundle.
- Custom deep-link scheme `nexoramobile` retained; generated Expo development scheme `exp+nexora-mobile` also present. No configured Android App Links, Firebase google-services file, package-specific OAuth redirect, or custom provider override found.
- File-system and sharing providers use `${applicationId}` in their library manifests; no provider was removed.
- Existing blocked sensitive permissions and microphone functionality preserved.
- Merged release manifest independently inspected at `android/app/build/intermediates/merged_manifest/release/processReleaseMainManifest/AndroidManifest.xml`: package/versionCode/versionName/targetSdk match the values above.
- Six provider authorities, all unique and exported=false: `com.vuvietanh.nexora.FileSystemFileProvider`, `com.vuvietanh.nexora.SharingFileProvider`, `com.vuvietanh.nexora.ImagePickerFileProvider`, `com.vuvietanh.nexora.cropper.fileprovider`, `com.vuvietanh.nexora.mlkitinitprovider`, `com.vuvietanh.nexora.androidx-startup`. Neither old conflicting authority remains.
- Merged permissions: INTERNET, ACCESS_NETWORK_STATE, RECORD_AUDIO, MODIFY_AUDIO_SETTINGS, VIBRATE, WAKE_LOCK, FOREGROUND_SERVICE, FOREGROUND_SERVICE_MEDIA_PLAYBACK, DETECT_SCREEN_CAPTURE (minSdk 34), USE_BIOMETRIC, USE_FINGERPRINT, and the package-local signature-protected DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION. No location, contacts, camera, broad media/storage, overlay, phone-state, query-all-packages, boot, billing or advertising-ID permission is present. Foreground playback, biometric and screen-capture permissions come from existing native modules.

## Checks

- `npm ci`: passed, 1153 packages installed. npm reported 70 advisories (17 moderate, 52 high, 1 critical); no blind audit fixes applied.
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed.
- Initial Jest: 118/119 passed, one existing interview-reporting test exceeded 5 seconds under concurrent first-build load; Jest stayed alive due to open handles and was stopped after results.
- `npm run test:ci -- --runInBand`: passed, 17 suites / 119 tests. Uses repository's existing forceExit behavior.
- Updated Android release configuration suite: passed, 9 tests, including package, deterministic versionCode, and unchanged iOS identity.
- Final resumed checks: TypeScript and ESLint passed; Jest passed 17 suites / 120 tests using `npm run test:ci -- --runInBand --coverage=false`. Expo Doctor remains 20/21 with the same patch-version warnings.
- Expo Doctor: 20/21 passed; existing lockfile has 11 patch mismatches (expo, expo-asset, expo-constants, expo-crypto, expo-dev-client, expo-linking, expo-router, expo-screen-capture, expo-sharing, expo-splash-screen, jest-expo). No SDK migration or dependency changes made.
- Expo Android prebuild: passed. The CLI regenerated/cleared the disposable native Android directory on resume; no hand-written native changes existed there. No explicit --clean flag was used. Existing warning: expo-system-ui is not installed for userInterfaceStyle support.
- Signing plugin generation/idempotency and focused ESLint: passed. After the AAB build, the plugin's missing-credential guard was extended to cover aggregate/abbreviated Gradle requests too; this changes build protection only, not the app payload or certificate.
- Negative signing check: `gradlew.bat :app:bundle --dry-run --no-daemon --console=plain --max-workers=2` without signing input was rejected at task-graph preparation with `Release requires verified upload signing`. This expected failure confirms aggregate requests cannot silently use the generated debug signing configuration; no release payload was rebuilt.

## Upload signing checkpoint

- OLD public upload certificate: `C:\Users\PC\Downloads\upload_cert.der`; SHA-256 `E0:38:4C:73:A4:E5:F6:55:9C:EE:00:36:FE:85:A2:3D:78:8B:74:78:4A:57:A5:C0:1B:94:D3:61:F9:C4:99:C2`. Never used for signing.
- At the user's explicit priority instruction, a NEW upload key was generated outside Git, in an ACL-protected directory: `C:\Users\PC\nexora-signing\nexora-upload.jks`. Existing key is reused on resume; no second key was generated.
- Public PEM: `C:\Users\PC\nexora-signing\nexora-upload-certificate.pem`.
- Alias `nexora-upload`, PKCS12, RSA 4096, SHA256withRSA, 10,000-day certificate validity.
- NEW SHA-256: `EE:BA:D8:41:D6:19:22:BE:DA:42:45:FD:71:B9:65:09:DA:56:6E:8D:CF:9F:77:5A:85:21:20:3A:2F:BF:86:ED`.
- MD5: `66:7F:84:20:69:34:AC:9A:BA:63:00:02:58:7E:73:A2`; SHA-1: `80:92:FB:F2:E5:DA:F7:CC:02:26:A4:DC:A9:61:2E:D3:DB:4E:68:1A`. Operator explicitly confirmed both match the upload-key reset email.
- Before production build, the helper opened the actual existing keystore, verified PrivateKeyEntry and private-key possession, and compared its certificate bytes to PEM and its SHA-256 to the pinned NEW fingerprint.
- Password entered only through hidden Java Console input. A temporary Java properties file in the protected signing directory supplies Gradle signing; it is deleted in the runner's finally block. Passwords are absent from command arguments and environment variables. Gradle runs with --no-daemon.
- Persistent Expo plugin sets release signing to nexoraUpload and rejects release builds lacking protected signing input. Debug signing requires the explicit NonProduction validation option; production never silently falls back.
- No private signing material or passwords were uploaded or committed. The owner submitted the reset separately; this agent did not submit it.

## Build and binary results

- Initial JDK 25 attempt after cache relocation: failed in 7m 1s at react-native-screens / react-native-worklets configureCMakeRelWithDebInfo[arm64-v8a]. AGP GeneratePrefabPackages threw IllegalStateException while parsing JDK 25's `WARNING: A restricted method in java.lang.System has been called`. This is a native toolchain compatibility failure; no security checks were disabled.
- Final command: `gradlew.bat :app:bundleRelease --no-daemon --console=plain --stacktrace --max-workers=2`, with JDK 21 and CMAKE_BUILD_PARALLEL_LEVEL=2. **BUILD SUCCESSFUL in 9m 59s**, 849 actionable tasks: 817 executed, 32 up-to-date. `validateSigningRelease`, `lintVitalRelease` and `signReleaseBundle` succeeded.
- Output: **`E:\nx-play\deliverables\Nexora_AI_GooglePlay_Release.aab`**. Copied from `E:\nx-play\android\app\build\outputs\bundle\release\app-release.aab`; source and delivered SHA-256 match.
- Size: **91,235,509 bytes** (87.01 MiB).
- AAB SHA-256: **`e0ba52e9ee757bc4244ae3f07d34694a151ffe748f13e560b8750ad0d4ce4b97`**.
- `bundletool validate`: passed (exit 0). Its independent manifest dump confirms package `com.vuvietanh.nexora`, versionCode `26101301`, versionName `1.0.0`, minSdk 24, targetSdk 36; the six unique non-exported authorities and permission list match the merged manifest above. Release application is not debuggable; no dev-launcher activity is declared.
- Production Hermes JS bundle is present at `base/assets/index.android.bundle`, 6,424,180 bytes. Canonical production API is present; the old Render staging API and localhost API are absent. Release is bundled locally and does not require Metro. Expo Updates is disabled in the release manifest. Existing Expo development scheme alone does not enable a development client.
- `keytool -printcert -jarfile`: signer SHA-256 and SHA-1 match the NEW PEM/keystore above, CN=Nexora AI Upload Key, RSA 4096 / SHA256withRSA. No debug certificate.
- `jarsigner -verify -verbose -certs`: exit 0, `jar verified`. Expected warnings include a self-signed upload certificate, no trusted certificate chain and no timestamp; certificate expires in 2054. It also reports ZIP/POSIX metadata is not signature-protected and a streaming JarInputStream manifest-order inconsistency. To independently resolve payload integrity, a Java `JarFile(..., true)` verifier read **all 1,742 non-META-INF payload entries to EOF**, required exactly one signer per entry, checked certificate validity and pinned its SHA-256. Every entry passed; no unsigned payload or altered digest was found. No warning was hidden or signature check disabled.
- Native static 16 KB checks: **54/54 arm64-v8a and x86_64 libraries** have all PT_LOAD alignments >=16,384 and file-offset/virtual-address congruence modulo 16,384. BundleConfig specifies uncompressed native libraries with `PAGE_ALIGNMENT_16K`. GNU_RELRO ranges were additionally rounded to 16 KB boundaries and checked against writable PT_LOAD contents: **zero writable non-RELRO overlaps**. Some raw RELRO ends are only 4 KB aligned; treating that alone as failure would ignore complete RELRO LOAD segments with padding before the next writable segment. The actual overlap check follows [Android's linker page-rounding behavior](https://android.googlesource.com/platform/bionic/+/android16-release/linker/linker_phdr.cpp#1360).
- **UNVERIFIED:** runtime startup/functionality on a 16 KB device/emulator, and zipalign on generated Play/device APKs. No extra signing key was generated for APK inspection. AAB packaging configuration and native ELF static checks pass; they do not establish full runtime compatibility or Play acceptance.
- Remaining build warnings: existing Kotlin/native deprecations, Gradle features slated for removal in Gradle 10, and Android SDK XML tooling-version warning. Current Gradle 9.3.1 completed successfully. Existing npm advisories and Expo Doctor mismatch warnings remain as listed above.
- The temporary signing properties file was confirmed absent after build. Private key stays in the protected directory outside both Git checkouts; no AAB, password or keystore is included in the source commit.
- Local evidence: `.local-build/android-release-build.log`, `bundletool-validate.log`, `aab-manifest.xml`, `aab-config.json`, `jarsigner-verify.log`, and `aab-inspection.json` (ignored build evidence, not committed).

## Resume and Play Console actions

1. First-upload versionCode history has been confirmed by the user. For subsequent releases, increase versionCode above every accepted version on all tracks.
2. Keep the private keystore and password securely backed up. Share only the public PEM when needed.
3. Wait until October 14, 2026 at 18:02 UTC = **October 15, 2026 at 01:02 Vietnam time**. The key may sign local builds now; it must not be used for Play upload before activation.
4. After activation, manually confirm Play Console's **Upload Key Certificate** matches the NEW fingerprint above. This is not the App Signing Key Certificate.
5. Only then manually upload the verified AAB to the existing Internal Testing draft for `com.vuvietanh.nexora`, review testing/release and policy declarations, and proceed in Play Console. No automatic upload or publishing is performed.

Production builds can be repeated with process-local JAVA_HOME, ANDROID_HOME and optionally GRADLE_USER_HOME set, then `powershell -File scripts/build-android-local.ps1 -KeystorePath <private-keystore> -PublicCertificatePath <public-pem> -ExpectedCertificateSha256 <public-sha256>`. Enter the existing password only at the hidden console prompt. Credentials stay outside Git. The script restores package.json after prebuild's generated script updates, passes production public environment values to both stages, and leaves the resulting app-release.aab for independent verification before delivery. Do not run it in a checkout containing native changes that have not been preserved.
