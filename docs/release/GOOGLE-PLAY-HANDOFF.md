# Google Play release handoff — 2026-10-04

## CURRENT final-policy follow-up — supersedes the historical handoff below

Proposed release base: `1582998b0a3109f059c7065abb9f60a1b09795cc` (Mobile #3 merged).
Current verdict: code and proposed declaration strategy ready for review; **NOT POLICY READY** for submission. Owner release confirmation and public legal publication pending.

- Use [final Console selections](PLAY-CONSOLE-DATA-SAFETY-FINAL.md), [policy audit](GOOGLE-PLAY-POLICY-FINAL-AUDIT.md) and [exact published Privacy edits](PUBLISHED-PRIVACY-APPROVAL-CHECKLIST.md). Earlier “unknown provider/OCR/contact” statements below are historical, not current release instructions.
- Render read-only check: `dep-db17cnvf3r2c73bn3v6g` live at BE `8150fc215b377a78cb61cc30b7c3e9e40b343c9d`; shared image starts API and Worker and includes #123/#124. Both public health endpoints 200. No real provider/CV/deletion call repeated.
- Owner confirms DeepSeek main AI, local PDF/DOCX without OCR, private R2, Neon, Render, Resend and optional Azure Speech. Actual provider/resource configuration still needs release-owner confirmation; secret values were not inspected.
- Mobile Sentry package/plugin/initialization/transport removed; new production build must include this commit. This does not claim older installed versions or backend have no telemetry.
- Privacy: https://www.nexorainterview.io.vn/privacy; deletion: https://www.nexorainterview.io.vn/account-deletion; official email: nexorainterview.vn@gmail.com. Public routes 200; published contact synchronized. Published body needs the separate owner-approved Site Content edits.
- Completed account deletion remains pseudonymous for retained billing/usage/audit UUIDs. Retention defaults disabled/report-only; 12-calendar-month metadata eligibility is not universal automatic purge; 90-day usage and 30-day logs remain targets. Provider/backup deadlines not invented.
- Consumption-only remains: no purchase CTA, checkout deep link, card collection or Play Billing promise.

### Exact owner actions before truthful policy submission

1. Proposed DeepSeek Shared=Yes adopted for actual transmitted types; qualifying infrastructure/email/Speech Shared=No supported by standard SP terms. Verify actual account scope, not custom-DPA existence. Audio Ephemeral=No until the actual release qualifies; no training/zero-retention guarantee.
2. Review paired reporting patches; BE migration/code must precede Mobile distribution. Eight canonical types, actual IDs and confirmed 202 receipts replace the old gaps. Validate real-device/report moderation; no email substitute.
3. Approve/publish Privacy Site Content checklist and provide controller identity matching Play listing. This PR does not publish it.
4. Confirm actual DeepSeek selection, standard real-time Azure endpoint/no custom logging and released build/environment. Test voice permission refusal/text alternative and actual report moderation on a device with a safe test account.
5. Play owner: intended audience 18+, accurate content rating, no ads, privately supplied functioning verified reviewer account and gated feature access. Reconcile all active distributed versions, not just this branch.
6. Expo/Play owner only: AAB, signing, final manifest/native SDK review, 16 KB verification and submission after review/blocker resolution. None performed here.

Validation for this follow-up is recorded in the final PR handoff; historical counts below are from #2, not this branch. No merge/deploy/Console submission is authorized by this document.

### Historical #3 local validation (preserved; not this patch's counts)

| Command | Actual result |
| --- | --- |
| `npm ci --ignore-scripts` | PASS; npm peer metadata recalculated after Sentry removal, no existing package version changed. Existing audit: 62 findings (12 moderate, 50 high); no forced dependency upgrade. |
| `npx tsc --noEmit` | PASS |
| `npm run lint` | PASS, no warnings after duplicate import corrected |
| `npm run test:ci -- --runInBand --coverageDirectory=C:/Users/THISPC~1/AppData/Local/Temp/nexora-play-final-coverage` | PASS: 13 suites, 64 tests; external coverage directory. Includes provider/legal, retention, no-Sentry, speech disclosure/error, consumption-only and existing deletion regressions. |
| `npx expo-doctor` | PASS: 21/21 |
| `git -c core.whitespace=blank-at-eol,blank-at-eof,space-before-tab,cr-at-eol diff --check` | PASS; ordinary CRLF permitted per repository EOL policy, no EOL-only normalization. |

Existing Jest forceExit and authParity hydration warning remain. Static source guards are not native device/network validation. Hosted CI for this exact new HEAD must be checked separately; prior PR CI is not its result.

### Current cross-repo validation

TypeScript and lint passed; Jest 14 suites / 95 tests passed (31 reporting tests); Expo Doctor 21/21. Production EAS environment explicitly bound. Remote EAS values, AAB/native manifest and device/provider traffic NOT inspected. BE Release build, 633 unit + 463 integration tests (real local PostgreSQL, no skips), changed-file style/analyzers, EF and package scan passed. No production mutation or legal publication.

## HISTORICAL #2 handoff (preserved)

Review status: mobile corrective PR; no merge, deployment, Play submission or Android release build performed.
Base: `42bf55cf6e9cb0146065afbaa042f711d611f162` (origin/main; no open mobile PRs at audit start).
Backend source audited read-only at main `8c5b34628a6a7220c329a88198c5c0a32307f2c8` in qbao0111/nexora-backend. Source compatibility is not proof of deployed backend version.

## Mobile work completed

| Task | Status | Evidence |
| --- | --- | --- |
| Consumption-only legal policies | DONE | PaymentPolicyContent removes Play payment/refund/renewal claims and subscription button; Terms describes existing server-owned entitlements, optional voice, AI limits and reporting without an unverified moderation deadline. |
| Account status UX | DONE | Pricing shows existing entitlement, remaining/consumed quota, expiry, current-plan features and order history. Offer prices, promoted plans and upgrade copy removed. PlanUsageCard uses “Xem quyền lợi”; CV quota fallback stops recommending upgrades. |
| Remove unused purchase methods | DONE | No consumers found by dependency search; pricing.api retains listPlans, removes checkout/status/refresh/Play verification functions; shared billing types preserved. |
| Privacy/deletion corrections | DONE | Canonical URL constants; owner-confirmed support email; avatar, CV, speech, AI, diagnostics, billing and retention disclosures. Removed absolute no-training, total-erasure and immediate-cleanup guarantees. |
| In-app deletion | DONE | Existing two-step UI kept; exact XÓA/nonempty email required. Synchronous submission guard, retry:false, stable Idempotency-Key on manual retry, no 401 replay. Correct nullable envelope parsing; no fabricated scheduled date or recovery/cancellation promise. Server acceptance triggers local token/query/speech/user cleanup without an extra logout request. Errors never show success. |
| Pending request UI | DONE | queued/processing/completed/failed and unknown status distinguished; valid server requested/completed timestamps only. Null, loading and retrieval failure distinguished. |
| Sensitive API logging | DONE | Removed raw validation response and extracted-message logs; removed nested Axios config/response graphs from captured exceptions. This is not a certification of all SDK telemetry. |
| Automated checks | DONE | Corrective update: TypeScript, lint, test:ci (13 suites / 56 tests), focused legal/deletion (4 suites / 32 tests), Expo Doctor 21/21 passed. Prior npm ci passed with unchanged lockfile. Destructive calls mocked; no production deletion. |
| Real-device interview/CV and legal layout | NOT VERIFIED | Existing flows retained; source/runtime tests do not replace Android device checks. |

## External dependencies

| Task | Status | Evidence / next action |
| --- | --- | --- |
| FE public account-deletion PR merged/deployed | DONE: source and public routes | FE PR #60 merged at `053673a46fe23df05fc096cf7206e1ef8a6c4df1`. Both hosts resolve publicly over validated HTTPS: apex 308 to www, www request/confirmation pages 200. Mobile exposes an accessible browser link and retains independent in-app deletion. See [rollout evidence](../evidence/release/PUBLIC-DELETION-ROLLOUT.md). |
| Public website/privacy availability | DONE | Direct HTTPS GET returned 200 for website and `/privacy` on 2026-10-04. HTTP availability alone does not establish legal-content correctness or continued uptime. |
| Mobile support contact | DONE | Project owner explicitly confirmed `nexorainterview.vn@gmail.com` during this task; mobile uses this address. |
| Public support contact synchronization | BLOCKED | Public homepage/privacy and backend source default still use a superseded address. FE/content owner must align them with the confirmed official address; those repositories were not modified. |
| Backend deletion contract | DONE | Authorize MeController POST/GET; POST returns id/status/attempts/requestedAt/completedAt; GET nullable status record; no scheduledHardDeleteAt or cancellation endpoint. PrivacyService revokes refresh tokens/security stamp, queues immediately, removes personal data/files and anonymizes identity. ExternalAccountDeletionService verification lifetime is 30 minutes, unrelated to deletion grace. |
| Deployed backend and worker | OWNER-REPORTED functional success; configuration NOT VERIFIED | Owner reports real email confirmation and DB deletion checks succeeded. We did not repeat destructive production tests. Exact received email hostname and production PublicUrl, deployed revision, cleanup delays/failure handling and retained data still need backend owner evidence. See rollout evidence. |
| Retained data and provider contracts | BLOCKED | Confirm retained billing/usage/privacy records, backup/log retention, provider deletion, AI paid/free account and data use, active storage/hosting/email processors and Sentry payloads. See [answer matrix](../evidence/release/DATA-SAFETY-FORM-ANSWERS.md). |
| Legal approval | OWNER ACTION | Approve mobile/public policy consistency, contractual refund wording, retention schedule, data controller identity and published contact. No blanket compliance guarantee. |

Policy review remains awaiting independent review and the [OPEN DATA SAFETY DECISIONS — OWNER INPUT REQUIRED](../evidence/release/DATA-SAFETY-FORM-ANSWERS.md#open-data-safety-decisions--owner-input-required). Public-route availability resolves the earlier 404 finding; it does not settle provider contracts or final form answers.

## Owner-only tasks

AAB generation, signing, manifest/native-library inspection and 16 KB runtime validation are explicitly excluded from this corrective policy PR. They are separate release work, not checks performed or required to complete this source review.

| Task | Status | Required evidence |
| --- | --- | --- |
| EAS production AAB | OWNER ACTION | Produce release binary after independent review. |
| Signing/keystore | OWNER ACTION | Owner-controlled signing validation; no credentials changed here. |
| Android release testing | OWNER ACTION | Device matrix: account/legal screens, pending/failure states, interview text/voice, CV/avatar upload, export and quotas. Use disposable test accounts for destructive tests. |
| 16 KB native library/alignment verification | OWNER ACTION | Actual production AAB/APK and relevant Android emulator/device evidence. SDK/Doctor/Jest results do not certify binaries. |
| Final merged permissions manifest | OWNER ACTION | Inspect release manifest from produced binary; app.json is not the final manifest. |
| Google Play Data Safety form | OWNER ACTION | Resolve matrix unknowns, review all distributed versions and SDKs, enter accurate answers. Do not copy draft blindly. |
| Account deletion URL configuration | OWNER ACTION | Public page is available. Owner enters `https://www.nexorainterview.io.vn/account-deletion` in Console and confirms actual email link origin/configuration. |
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

The results below describe the initial reviewed HEAD `507a2b0eba949beed936c706c45ab6030b78e300`. Corrective-update results are recorded separately below after validation.

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

## Corrective PR #2 validation — 2026-10-04

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | PASS |
| `npm run lint` | PASS |
| `npm run test:ci -- --runInBand --coverageDirectory=E:/temp/nexora-policy-coverage-correction` | PASS: 13 suites, 56 tests; coverage outside repository |
| `npx jest tests/accountDeletion.test.tsx tests/accountDeletionApi.test.ts tests/deletionSession.test.tsx tests/legalConsumption.test.tsx --runInBand --forceExit` | PASS: 4 suites, 32 tests; browser success/failure, accessible links, official contact and existing direct deletion behavior covered |
| `npx expo-doctor` | PASS: 21/21 |
| Public HTTPS/TLS/redirects | PASS for request/confirmation pages on both hosts; see rollout evidence. Actual production email token/configuration not inspected. |

Current legal/account audit preserves consumption-only behavior, direct authenticated deletion and truthful queue/status wording. No checkout steering, Play refund claim, invented grace period/completion date, login cancellation or guaranteed training/retention outcome introduced. Existing Jest forceExit and authParity hydration warning remain. No FE/backend edit, production deletion, binary check or Console submission performed.
