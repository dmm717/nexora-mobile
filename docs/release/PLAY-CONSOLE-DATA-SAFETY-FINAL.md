# Google Play Data Safety — final source-backed worksheet

Reviewed 2026-10-04. Verdict: **BLOCKED for submission**, not “everything unresolved”.
Use with [final audit](GOOGLE-PLAY-POLICY-FINAL-AUDIT.md) and [published-content checklist](PUBLISHED-PRIVACY-APPROVAL-CHECKLIST.md).
This supersedes preliminary docs/evidence/release/DATA-SAFETY-FORM-ANSWERS.md for the proposed release. It does not certify older distributed builds.

## Scope and deployment evidence

- Mobile main / merged #2: `1d1b4e3f9df856310fad27fea3b192453029d83c`; this PR removes Mobile Sentry SDK, native plugin and initialization, not merely its DSN.
- BE #123/#124 merged; current main `8150fc215b377a78cb61cc30b7c3e9e40b343c9d`.
- Render read-only evidence: nexora-staging deployment `dep-db17cnvf3r2c73bn3v6g` is **live** at that exact BE commit. Dockerfile publishes API and Worker; render-entrypoint starts and monitors both in the same image. HTTPS health/live and api/v1/health returned 200. Thus deployed image includes OCR removal for both, not just an API-only update. No real CV job/provider call or destructive deletion repeated.
- FE #61 merged at `69dbfbacc84f2fb9488d233d59cb6ccac57000ca`. Public privacy, terms and deletion routes return 200. Preview deployment success is not production revision proof; published legal content was separately read via public API.
- Owner confirms DeepSeek, R2, Neon, Render, Resend and optional Azure Speech. Runtime secret/config values were not inspected or changed. Check actual main AI selection before publication; deployment SHA alone does not prove configured provider.
- EAS production config uses HTTPS API and contains no Sentry DSN; remote EAS variables/binary not inspected. Source SDK removal prevents a DSN alone from activating Sentry in the new build. Older builds may differ.

## Console top-level selections

| Field | Answer for this proposed Android release |
| --- | --- |
| Collect or share required user data types? | **Yes** |
| All collected user data encrypted in transit? | **Yes**, production API HTTPS guard; R2 presigned HTTPS; Azure/DeepSeek HTTPS. Owner must verify actual released configuration; not end-to-end encryption. |
| Account creation? | **Username/email and password**. Confirm only this enabled flow in release; no social-login declaration without a real implemented flow. |
| Account deletion request available? | **Yes** in app and public website. |
| Account deletion URL | https://www.nexorainterview.io.vn/account-deletion |
| Privacy URL | https://www.nexorainterview.io.vn/privacy |
| Additional deletion request without deleting account? | Do not claim a comprehensive “all data” request feature. CV/feedback editing/deletion alone is not such a guarantee. Answer **No** unless owner verifies the exact additional Console option against supported scope. |
| Independent security review / certification badge | **No**; not established. |
| Ads / advertising IDs / data sale | **No** in inspected Android source; no advertising SDK or monetization via ads. |
| Support | nexorainterview.vn@gmail.com |

## Reading the matrix

Collected means transmitted off-device, including own backend and processors. Download-only data and device-only processing are not collection by themselves. Pseudonymous data still counts.
Required/optional describes whether the user can choose not to provide a type, not whether the SDK call is automatic.

Purposes are Console names: AF = App functionality; AM = Account management; P = Personalization; FS = Fraud prevention, security and compliance; DC = Developer communications.
Do **not** select Advertising/marketing, creditworthiness or third-party model-training purposes without evidence. Analytics queue in services/analytics.ts is local-only, bounded and has no transport.

For every collected row: transit encryption **Yes**; account deletion **Yes, request available with disclosed retained billing/audit identifiers and provider/backup constraints**, not universal immediate erasure.
For uncollected rows: required/purposes/ephemeral/encryption/deletion are **N/A**. “No” below does not certify unknown older releases.

Sharing choices:
- **Yes†** is the conservative entry for DeepSeek-transmitted data; paid API is not proof of the service-provider exception. Owner must approve this choice or supply applicable restrictive processor terms before submitting.
- **No‡** relies on the documented infrastructure/Speech/email service-provider roles below, or a user-initiated public feedback sharing exception. Confirm applicable account agreements; provider customer-account analytics are distinct from end-user payloads. If an agreement excludes this scope, use the explicit fallback below rather than silently retaining No.
- Optional incidental contact fields embedded in CV/free text are conservatively included. This is not a claim that every sensitive category possibly typed into free text is solicited.

## Collected types — exact field worksheet

| Google category / type | Collected | Shared | Required / Optional | Purposes | Ephemeral | Evidence / confidence / remaining condition |
| --- | --- | --- | --- | --- | --- | --- |
| Personal info / Email address | Yes | Yes† | Required (account); optional inside content | AM, AF, DC, FS | No | Register/login, user.api, Resend verification; email may also occur in arbitrary AI-bound text. High collection confidence; DeepSeek sharing choice approval. |
| Personal info / Name | Yes | Yes† | Required display name; optional CV identity | AM, AF, P | No | Registration, profile, CV narrative. Backend contact scrubbing is not a guarantee all names disappear. |
| Personal info / User IDs | Yes | No‡ | Required | AM, AF, FS | No | Auth/session identifiers, resource ownership, immutable usage linked to retained UUID. No mobile advertising identifier. |
| Personal info / Address | Yes | Yes† | Optional | AF | No | Candidate-supplied CV/free text may include address; stored canonical text. No location sensor. |
| Personal info / Phone number | Yes | Yes† | Optional | AF | No | CV/free text may include phone; account does not require it. Local AI-ready redaction does not prove all free-text paths strip it. |
| Personal info / Other info | Yes | Yes† | Optional | AF, P | No | Career goals, experience, education, skills/profile edits and compact ResumeProfile sent for coaching. |
| Files and docs / Files and docs | Yes | Yes† | Optional | AF, P | No | resume.api/upload intent → private R2 PUT → finalize → local extraction → text/profile DeepSeek. Sharing covers derived document contents, not original PDF upload to DeepSeek. |
| Photos and videos / Photos | Yes | No‡ | Optional | AF, AM | No | User-selected avatar upload/storage; no facial identification established. Public moderated testimonial only by explicit opt-in. |
| Audio files / Voice or sound recordings | Yes | No‡ | Optional | AF | **Yes for standard real-time STT audio payload only** | Native services/speech.ts uses short-audio REST conversation endpoint. Microsoft documents memory-only real-time processing. Device cache cleanup is separate; provider/resource must remain this endpoint, not custom/batch/logging. Persisted transcript is Other UGC below, NOT ephemeral. |
| App activity / Other user-generated content | Yes | Yes† | Optional | AF, P; DC for feedback | No | JD, answers, STAR/scenario, report descriptions, product feedback, goals; Azure TTS resubmits text. Questions/evaluations only downloaded do not count until resubmitted (TTS/context/report snapshot). |
| App activity / App interactions | Yes | No‡ | Optional feature use | AF, P, FS | No | Practice submissions/completion, learning progress and server usage history. Not a claim local taps/analytics queue are uploaded. |
| App info and performance / Diagnostics | Yes | No‡ | Required for server request handling | AF, FS | No | Backend request/error/operational metadata. Mobile production logger no-op; no automatic mobile stack upload. Optional server Sentry config must be checked against sanitization. |
| Device or other IDs / Device or other IDs | Yes | No‡ | Required for networking/security | AF, FS | No (conservative) | Network IP used for backend rate limiting (HardeningExtensions). Not AAID, IMEI, install UUID, hardware fingerprint or inferred location. Provider/request metadata must be considered, not just SDK names. |

If Console subdivides collection/sharing purposes, use AF/P for DeepSeek sharing, AF for optional speech, and the relevant AM/DC/FS purposes for the named processors. Do not invent an independent DeepSeek training purpose: the missing contractual guarantee is not proof training happens.

## Not collected in the inspected Android flow

| Category / types | Collected / Shared | Reason / evidence |
| --- | --- | --- |
| Location / approximate, precise | No / No | No location permission/API; network IP is not used to infer location. |
| Personal info / race/ethnicity, political/religious beliefs, sexual orientation | No / No | Not requested or used for these purposes. Do not solicit them; reevaluate if product starts doing so. |
| Financial / user payment info, purchase history, credit score, other financial info | No / No | Consumption-only Android downloads server-owned plan, entitlements/order history. No card fields, native checkout, receipt upload, payment instrument collection or financial inputs sent by app. Download alone is not collection. Web purchases require separate site disclosure. |
| Health and fitness / health info, fitness info | No / No | No health/fitness feature. |
| Messages / emails, SMS/MMS, other in-app messages | No / No | No inbox, SMS or chat access. Resend transactional emails are generated service communications, not collection of a user's mailbox. Answers/reports are Other UGC. |
| Photos and videos / videos | No / No | Camera preview is local; no video upload/recording transport found. Final manifest/device check still required. |
| Audio / music, other audio files | No / No | No music library upload. Generated TTS audio downloaded to temporary device cache only. |
| Calendar / events; Contacts / contacts | No / No | No access/transport. |
| App activity / in-app search history, installed apps, other actions | No / No | No such separate upload paths identified; practice/progress already under App interactions. |
| Web browsing / browsing history | No / No | Opening legal URLs is not collecting browser history. |
| App info/performance / crash logs, other performance data | No / No | Sentry removed; no mobile crash/performance transport. Server diagnostics declared separately; local error text and OS/Play developer tooling are not Nexora app SDK collection. |
| Advertising identifier / SDK installation identifier | No / No | No advertising/analytics transport generating these in inspected source. Do not confuse dependency presence with data actually transmitted. |

## Providers — scope, retention and sharing evidence

Sources checked 2026-10-04. These are end-user payload roles, not an assertion that providers never use their own customer/account/security records.

| Provider | Received data / purpose | Applicable scope, independent use and sharing decision | Retention/deletion limits |
| --- | --- | --- | --- |
| DeepSeek | Extracted/compact CV, JD, answers/goals; text AI | [Open Platform Terms](https://cdn.deepseek.com/policies/en-US/deepseek-open-platform-terms-of-service.html), effective 2026-04-29, covers developer API. Developer remains responsible for end-user notice/rights; downstream end-user processing is not resolved by consumer-chat privacy policy. No sufficient solely-on-instructions/no-training promise established. **Shared Yes†** conservative, or owner supplies applicable processor restriction. | No established API zero-retention or per-end-user erasure deadline. Do not claim paid usage settles this. |
| Render | Backend requests, private content while processing, operational metadata | [DPA](https://render.com/dpa), dated 2024-12-19, supplements service agreement; processor role for customer personal data except express contractual exceptions. SP exception supportable for hosting under applicable scope (**No‡**). | Service/account/backup retention differs from account deletion in Nexora. No verified 30-day universal deadline. |
| Neon | Account, profile, answers, evaluations, billing/audit records | [current Neon schedule](https://neon.com/platform-terms), 2026-08-05, incorporates Databricks agreement/DPA; [current DPA](https://www.databricks.com/legal/data-protection-addendum). Do not use old Neon PDF as current contract. SP exception supportable for database customer content (**No‡**). | PITR/backups and retained pseudonymous billing data not erased merely because live personal rows are removed; configured duration not verified. |
| Cloudflare R2 | Private CV/avatar objects, upload/network metadata | [Customer DPA](https://www.cloudflare.com/cloudflare-customer-dpa/) distinguishes customer processing from independent account data. Private storage on Nexora's instructions supports SP exception (**No‡**). | Owner-specific storage deletion, not bucket-age purge. No blanket historical-copy/backup deadline established. |
| Resend | Email address and verification/recovery/deletion email content | [Terms](https://resend.com/legal/terms-of-service) incorporate [DPA](https://resend.com/legal/dpa); customer personal data processor vs independent company/account data. Email-delivery SP exception supportable (**No‡**). | [Security](https://resend.com/security) account-termination cleanup is not an individual message deletion SLA. Token expiry 30 minutes is unrelated. |
| Azure Speech | Optional audio STT, question/follow-up text SSML TTS | [short-audio REST](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-speech-to-text-short), [STT privacy](https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/speech-service/speech-to-text/data-privacy-security), [TTS privacy](https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/speech-service/text-to-speech/data-privacy-security), [Microsoft DPA](https://aka.ms/DPA). Standard real-time/prebuilt voice only; not custom voice training or batch. Supports SP exception (**No‡**). No blanket training claim beyond applicable documentation. | Realtime audio processed in memory; standard TTS text/output not retained per these docs. Transcript stored by Nexora remains non-ephemeral. Resource settings cannot opt into custom logging while retaining these declarations. |
| Sentry | **No Mobile SDK** in proposed release | Backend Sentry is separate and configuration-dependent; [DPA](https://sentry.io/legal/dpa/) and source sanitizer required if enabled. No universal “Nexora has no telemetry” claim. | Do not infer backend log/retention settings from mobile SDK removal. |
| Expo/native modules | Device permissions, secure local tokens, local audio/files, fonts | No additional analytics/ads transport found in source; Microsoft SDK dependency is not imported by native speech implementation. EAS build tooling is not proof of runtime collection; review final manifest and distributed SDK versions. | Local cleanup best-effort; audio cache sweep >24h plus stop/unmount cleanup. No universal OS cache/backup guarantee. |

## Retention and deletion — selections are not timers

BE retention defaults: Enabled=false, DryRun=true, PurgeEnabled=false. No environment change made.
Foundation can clean expired verification records and completed deletion-request metadata after **12 calendar months**, excluding legal holds; it does not enforce 90-day usage or 30-day logs. Financial/usage ledgers preserved.

Completed account deletion removes personal career content, owner CV/avatar objects and identifying account fields; retained stable UUID linked to financial/usage/audit records is **pseudonymous, not irreversible anonymization**. Queue acceptance is not completion. Valid upload intents/storage errors can delay completion. No cancellation/recovery mechanism promised. External verification is one-use, 30-minute expiry; not a 30-day grace period.
Owner's real deletion test accepted as evidence; no destructive repeat.

## Precise remaining submission decisions

1. **DeepSeek Shared fields (†):** current terms insufficient for Shared=No. Safest accurate option is **Shared=Yes** on the affected personal/document/UGC types above (including optional contact text); disclose transfer and no unsupported training/retention guarantee. Owner/legal must approve. To instead choose No, obtain applicable API DPA/order/vendor statement restricting processing to Nexora instructions and document independent uses. Public paid-API status alone is insufficient.
2. **SP exception scope (‡):** published contracts support infrastructure/email/Speech roles, not Nexora account-specific negotiation. Owner confirm standard applicable agreements and standard Azure real-time resource/no logging. If scope differs or cannot be established before submission, conservative **Shared=Yes** for affected User IDs, Photos, Voice, Interactions, Diagnostics/network IDs rather than claiming an unproved exception; retain exact collected/purpose answers. Ephemeral audio fallback **No** if endpoint/resource retention differs. This is a targeted contract check, not an unresolved collection matrix.
3. **Actual release/backend configuration:** verify configured DeepSeek main AI and optional standard Azure; new mobile build must use this SDK-free commit. Render revision establishes OCR-removal deployment, not AI model configuration or real-job quality.
4. **Published legal approval:** synchronize public policy to named processors/retained UUID and disclosure scope; checklist provided. App/controller identity must match Play listing and accountable owner. No publication performed.
5. **AI report coverage:** learning_path/skill_profile currently fail locally before submission; separate backend-supported report fix or removal of those AI features from release is required. A mailto link is NOT a substitute for in-app AI reporting.

## Official interpretation sources

- [Data Safety definitions, purposes, categories and exceptions](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en).
- [User Data](https://support.google.com/googleplay/android-developer/answer/10144311).
- [Account deletion](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en).
- [Payments / consumption-only](https://support.google.com/googleplay/android-developer/answer/10281818?hl=en).

Owner must reconcile all active distributed versions; do not copy this new-release matrix onto an older Sentry-enabled build.

