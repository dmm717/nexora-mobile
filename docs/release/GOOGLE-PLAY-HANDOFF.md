# Google Play release handoff — 2026-10-04

Review status: mobile corrective PR; no merge, deployment, Play submission or Android release build performed.
Base: `42bf55cf6e9cb0146065afbaa042f711d611f162` (origin/main; no open mobile PRs at audit start).
Backend source audited read-only at main `8c5b34628a6a7220c329a88198c5c0a32307f2c8` in qbao0111/nexora-backend. Source compatibility is not proof of deployed backend version.

## Mobile work completed

| Task | Status | Evidence |
| --- | --- | --- |
| Consumption-only legal policies | DONE | PaymentPolicyContent removes Play payment/refund/renewal claims and subscription button; Terms describes existing server-owned entitlements, optional voice, AI limits and reporting without an unverified moderation deadline. |
| Account status UX | DONE | Pricing shows existing entitlement, remaining/consumed quota, expiry, current-plan features and order history. Offer prices, promoted plans and upgrade copy removed. PlanUsageCard uses “Xem quyền lợi”; CV quota fallback stops recommending upgrades. |
| Remove unused purchase methods | DONE | No consumers found by dependency search; pricing.api retains listPlans, removes checkout/status/refresh/Play verification functions; shared billing types preserved. |
| Privacy/deletion corrections | DONE | Canonical URL constants; verified support email; avatar, CV, speech, AI, diagnostics, billing and retention disclosures. Removed absolute no-training, total-erasure and immediate-cleanup guarantees. |
| In-app deletion | DONE | Existing two-step UI kept; exact XÓA/nonempty email required. Synchronous submission guard, retry:false, stable Idempotency-Key on manual retry, no 401 replay. Correct nullable envelope parsing; no fabricated scheduled date or recovery/cancellation promise. Server acceptance triggers local token/query/speech/user cleanup without an extra logout request. Errors never show success. |
| Pending request UI | DONE | queued/processing/completed/failed and unknown status distinguished; valid server requested/completed timestamps only. Null, loading and retrieval failure distinguished. |
| Sensitive API logging | DONE | Removed raw validation response and extracted-message logs; removed nested Axios config/response graphs from captured exceptions. This is not a certification of all SDK telemetry. |
| Automated checks | DONE | npm ci, TypeScript, lint, test:ci (13 suites / 53 tests) and Expo Doctor 21/21 passed. Destructive calls mocked; no production deletion. |
| Real-device interview/CV and legal layout | NOT VERIFIED | Existing flows retained; source/runtime tests do not replace Android device checks. |

## External dependencies

| Task | Status | Evidence / next action |
| --- | --- | --- |
| FE public account-deletion PR merged/deployed | BLOCKED | `https://www.nexorainterview.io.vn/account-deletion` returned HTTP 404 on 2026-10-04. This PR adds plain informational text, no actionable deletion link. FE must deploy request and `/account-deletion/confirm?token=...`, then independently verify with test accounts. |
| Public website/privacy availability | DONE | Direct HTTPS GET returned 200 for website and `/privacy` on 2026-10-04. HTTP availability alone does not establish legal-content correctness or continued uptime. |
| Mobile support contact | DONE | Project owner explicitly confirmed `nexorainterview.vn@gmail.com` during this task; mobile uses this address. |
| Public support contact synchronization | BLOCKED | Homepage and backend default still publish `nexorainterview@gmail.com`. FE/content owner must align them with the confirmed official address; those repositories were not modified. |
| Backend deletion contract | DONE | Authorize MeController POST/GET; POST returns id/status/attempts/requestedAt/completedAt; GET nullable status record; no scheduledHardDeleteAt or cancellation endpoint. PrivacyService revokes refresh tokens/security stamp, queues immediately, removes personal data/files and anonymizes identity. ExternalAccountDeletionService verification lifetime is 30 minutes, unrelated to deletion grace. |
| Deployed backend and worker | NOT VERIFIED | Team must verify deployed revision, enabled worker, successful cleanup including storage upload-intent delays, failure handling and production email PublicUrl. |
| Retained data and provider contracts | BLOCKED | Confirm retained billing/usage/privacy records, backup/log retention, provider deletion, AI paid/free account and data use, active storage/hosting/email processors and Sentry payloads. See [answer matrix](../evidence/release/DATA-SAFETY-FORM-ANSWERS.md). |
| Legal approval | OWNER ACTION | Approve mobile/public policy consistency, contractual refund wording, retention schedule, data controller identity and published contact. No blanket compliance guarantee. |

## Owner-only tasks

| Task | Status | Required evidence |
| --- | --- | --- |
| EAS production AAB | OWNER ACTION | Produce release binary after independent review. |
| Signing/keystore | OWNER ACTION | Owner-controlled signing validation; no credentials changed here. |
| Android release testing | OWNER ACTION | Device matrix: account/legal screens, pending/failure states, interview text/voice, CV/avatar upload, export and quotas. Use disposable test accounts for destructive tests. |
| 16 KB native library/alignment verification | OWNER ACTION | Actual production AAB/APK and relevant Android emulator/device evidence. SDK/Doctor/Jest results do not certify binaries. |
| Final merged permissions manifest | OWNER ACTION | Inspect release manifest from produced binary; app.json is not the final manifest. |
| Google Play Data Safety form | OWNER ACTION | Resolve matrix unknowns, review all distributed versions and SDKs, enter accurate answers. Do not copy draft blindly. |
| Account deletion URL configuration | BLOCKED | Deploy and verify canonical deletion page before owner enters it in Console. |
| Store listing/legal URLs | OWNER ACTION | Check accessible privacy and deletion pages, publisher identity/contact, screenshots and consumption-only description. |
| Testing tracks/requirements | OWNER ACTION | Owner confirms applicable account-specific Console requirements. |
| Final publication | OWNER ACTION | Independent PR/legal review, resolved blockers and owner approval. |

## Corrected contradictions and historical evidence

| Prior claim | Current finding/correction |
| --- | --- |
| Play Billing / expo-iap implemented; Google handles refunds/subscriptions | package.json has no billing SDK; native has no purchase flow. Removed false legal statements and unused purchase methods. |
| Web steering is a compliant quota upgrade path | No checkout steering introduced. Account status focused UX; prior reports are historical, not release authorization. |
| Delete date = now + 30 days / login cancels deletion | Backend queues immediately and revokes access; only requestedAt/completedAt returned. Removed guessed date, cancellation/recovery and grace promises. |
| Every record erased / invoices retained forever / reports retained 90 days | Worker removes personal content and anonymizes identity; billing/usage/privacy records remain. No verified universal durations or backup/provider guarantees. |
| No voice retention or model training | Native uploads audio to Azure and attempts temporary-file cleanup. Provider processing/contract must be checked; local cleanup is not ephemeral-processing evidence. |
| Gemini / Azure OpenAI are the confirmed AI processors | Current backend supports Gemini and DeepSeek, with Gemini document OCR; production selection unknown. No Azure OpenAI implementation established in audited source. |
| Full policy/Data Safety/16 KB compliance guaranteed | Source and automated evidence have limited scope; FE, provider, owner and binary checks remain. |
| nexora.vn and support@nexora.vn | Canonical nexorainterview.io.vn URLs and owner-confirmed nexorainterview.vn@gmail.com; homepage/backend-default address discrepancy needs external synchronization. |

Historical documents and captured media are preserved with explicit superseded notices. This handoff and the Data Safety matrix represent current review state; old PASS labels are not evidence for this release.

## Validation results

| Check | Result |
| --- | --- |
| `npm ci` | PASS; lockfile unchanged. 64 existing dependency audit findings (12 moderate, 52 high) and test-renderer React peer warning; dependency remediation needs separate review. |
| `npx tsc --noEmit` | PASS |
| `npm run lint` | PASS |
| `npm run test:ci -- --runInBand --coverageDirectory=E:/temp/nexora-policy-coverage-final` | PASS: 13 suites, 53 tests. First complete run also passed (12 suites/49 tests), before adding interview/CV contract and extra banner tests. Coverage output excluded from PR. |
| Focused deletion/API/session/legal/pricing tests | PASS in complete run; includes explicit confirmation, duplicate/network/no retry, nullable envelopes, actual dates/statuses, cleanup, legal access and account-status rendering. |
| Interview/CV regression scope | Mocked answer/complete/report and CV intent/finalize/analysis contracts plus existing speech-token tests. Upload bytes, provider behavior and full device UI remain NOT VERIFIED. |
| `npx expo-doctor` | PASS: 21/21 checks |

Jest uses the repository's forceExit configuration. Existing authParity test emits a hydration warning (`Unsupported BodyInit type`); assertions pass. No release build, 16 KB check, production deletion or real-device certification performed.
