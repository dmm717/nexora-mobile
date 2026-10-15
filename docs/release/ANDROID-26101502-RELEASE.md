# Nexora AI release 26101502 — verified handoff

- Package: `com.vuvietanh.nexora`; versionName `1.0.0`; versionCode `26101502`.
- Upload file: `C:\Users\PC\Downloads\Nexora_AI_GooglePlay_Release_26101502.aab`.
- Repository deliverable: `E:\nx-play\deliverables\Nexora_AI_GooglePlay_Release_26101502.aab`.
- Bytes: 79,923,497.
- AAB SHA-256: `919eddfed2d0f89224cd597b62bda995335b7e18d93fb2f149e94eec3ac134bf`.
- Public signing certificate SHA-256: `EEBAD841D61922BEDA4245FD71B96509DA566E8DCF9F775A8521203A2FBF86ED`.
- Bundletool validation: PASS.
- Payload signature verification: `PASS: all 1646 payload entries cryptographically verified with the pinned upload certificate.`.
- Manifest: target SDK 36, non-debuggable, cleartext disabled, microphone retained; CAMERA and AD_ID absent.
- Checked ML Kit, DataTransport, Firebase Analytics/measurement, Advertising ID APIs and Expo Camera markers: absent.
- New Play update module and Play AppUpdate API: present in final R8 mapping.
- Static 16 KB checks: PASS for 48 native 64-bit libraries; AAB alignment 16 KB.
- Production HTTPS API: present; checked old staging/localhost endpoints: absent.
- Robot logo: decoded pixels match the canonical Play Console image.
- Temporary signing properties: removed. No private signing material committed/uploaded.
- Jest: 20 suites / 150 tests PASS. TypeScript, ESLint and diff whitespace checks PASS.
- Actual device runtime / 16 KB device / Play update end-to-end: NOT TESTED.
- Network capture / live Data safety form inspection: NOT PERFORMED.
- Google Play upload/publication: NOT PERFORMED.

Advertising ID: **No for this artifact**. Data safety is a separate declaration; account/CV/audio/backend processing and the added Play Core update library still require applicable disclosures. All active distributed versions must be reconciled.

The 26101501 app cannot gain a popup remotely. Testers must update manually to 26101502 first. Its reminder applies when a subsequent higher version is available to their Play account/track.

---

# Nexora AI 26101502 — safe error messages and update reminder

Package: `com.vuvietanh.nexora`; versionName `1.0.0`; versionCode `26101502`.
Source checkout: `E:\nx-play`. No Play upload or publication performed by Codex.

## Changes

- Removed the `[INVALID_CREDENTIALS]`-style prefix from authentication messages.
- Audited error display paths throughout authentication, account/profile, CV uploads and analysis, interviews/reports, scenarios, STAR practice, feedback, moderation and speech. UI paths now use authored Vietnamese messages, known error-code mappings or safe local fallbacks. Untrusted backend/provider `error.message`, request IDs and raw ErrorBoundary details are not forwarded to the screen. Technical logging and internal cancellation checks remain separate from UI.
- Explicitly authored local validation messages use `UserFacingError`; arbitrary `Error` instances cannot bypass the display helper. Regression tests cover unknown errors/codes, SQL-like text, URLs, tokens and prototype-property code values.
- Added an optional update reminder backed by Google Play's actual availability for the installed package/account/track. Buttons: **Để sau** and **Cập nhật**. The update button opens Nexora AI's Play listing. No automatic download, immediate-update flow or forced logout.
- Checks run at app startup/return to foreground with a 15-minute cooldown, one reminder per available version per mounted app session, an eight-second timeout and silent fallback when Play cannot confirm availability. Interview routes suppress the check and discard late results.
- Preserved the prior failed-login loading fix, camera/ML Kit removal and Play Console robot logo.

## How to use and test

1. Distribute 26101502 in the existing closed-testing track. Testers currently on 26101501 must first update through CH Play; the older binary cannot display this new reminder.
2. Once a higher version becomes available to an eligible account, 26101502 can show the reminder when opened or returned to the foreground. The Play Store, not a hard-coded latest version or backend endpoint, determines availability.
3. Verify on a real Play-installed device with a subsequent higher eligible release. Unit tests and native compilation are not evidence of this end-to-end Play flow. Sideloaded installations, missing Play Store and offline failures must remain usable without a popup.
4. Smoke-test wrong password, unavailable network, CV selection/upload, interview recording, report display and the light-background robot icon before broad rollout. No guarantee of Google production approval is implied.

## Added SDK and Data safety reconciliation

The local Expo module depends on `com.google.android.play:app-update:2.1.0`. It queries `AppUpdateManager.appUpdateInfo`; JavaScript opens the store only after user consent. No advertising or analytics SDK was intentionally added.

Google documents that Play Core interacts with the Play Store and that update requests involve device metadata, application version and installed modules/asset packs to determine update availability/size. Google states encryption, no transfer to third parties and a fixed retention period. Do not describe this build as containing no SDK data handling. Reconcile the actual Play form and all active versions with the existing account/CV/audio/backend disclosures; this note does not change the Console form.

Sources: [Play in-app updates and Data safety](https://developer.android.com/guide/playcore/in-app-updates), [Android integration](https://developer.android.com/guide/playcore/in-app-updates/kotlin-java).

## Validation

- Jest: **20 suites, 150 tests passed**.
- TypeScript: passed.
- ESLint: passed. Final Gradle build: **BUILD SUCCESSFUL in 13m 2s**. Final AAB signature, manifest, SDK reconciliation, production API/logo and static 16 KB checks passed; see `ANDROID-26101502-RELEASE.md` and the Downloads report for artifact hash and details.
- First build attempt hit a Windows file lock in Expo's generated x86 native output. The retry uses one Gradle worker. Signing helper removes temporary signing properties after both failure and success; passwords are entered through the hidden Java Console outside Git.
- Remaining prior platform warnings (deprecated edge-to-edge APIs and large-screen orientation behavior) are not resolved by this focused patch. Device runtime, 16 KB device operation, network capture and the live Console form are not certified by static bundle checks.

## Suggested release notes

```xml
<vi>
Cải thiện thông báo lỗi để dễ hiểu hơn khi đăng nhập và sử dụng ứng dụng.
Thêm lời nhắc khi có phiên bản mới trên Google Play.
Giữ trải nghiệm luyện tập liên tục với tùy chọn cập nhật sau.
</vi>
```
