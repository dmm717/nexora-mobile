# Google Play final policy audit

Date: 2026-10-04. Proposed Mobile correction, **no deployment, AAB, Console submission or merge**.
Base `1582998b0a3109f059c7065abb9f60a1b09795cc` (Mobile #3 merged). [Data Safety worksheet](PLAY-CONSOLE-DATA-SAFETY-FINAL.md) is authoritative; preliminary evidence remains historical.

## Evidence and implementation

| Evidence | Verified result |
| --- | --- |
| Mobile #2 | Merged; source and hosted TypeScript/ESLint/Jest/Doctor/security checks green. This follow-up is a new branch, not competing #2. |
| BE #123 | Merged at 693979d009a5b7c2fb98e1bb164522730af9168c; local PDF/DOCX, no Gemini document fallback or external OCR. Prior hosted checks green. |
| BE #124 | Merged/current main 8150fc215b377a78cb61cc30b7c3e9e40b343c9d; reviewed source, migration, tests and retention manifest. Hosted run 37214025408: 632 unit + 460 integration tests, no skips; EF/style/security gates green. |
| API **and Worker** deployed revision | Render nexora-staging live deployment dep-db17cnvf3r2c73bn3v6g at BE main above. Same Docker image publishes/launches/monitors both processes. GET health/live and api/v1/health = 200. No repeated real deletion or CV/provider job performed. |
| FE #61 | Merged at 69dbfbacc84f2fb9488d233d59cb6ccac57000ca. Preview check passed; not proof of production revision. |
| Public routes | Privacy, Terms, account-deletion all HTTPS 200. Public Site Content API privacy published 2026-10-04T13:52:52.835691+00:00; terms 13:53:04.278294+00:00. Official email correct; body still needs named processors and pseudonymous retention clarification. |
| External account deletion | Owner already tested actual email/confirmation/DB removal. Accepted evidence; no destructive repeat. |
| Provider settings | Owner-confirmed architecture. Secrets/remote EAS settings not inspected. Model configuration, contract scope/resource settings remain owner release checks. |

Mobile fixes: remove Sentry package/lockfile/native plugin/Metro/init/logger transport and fake crash-submitted message; contact opens user-controlled email without stack. Privacy/deletion name active processors, local extraction and optional speech, retained pseudonymous account ID and non-enforced targets. Public feedback defaults to private; existing explicit opt-in preserved. Mic dock explains Azure transmission at point of use; preflight local mic test distinguished. Terms remove false all-scores-AI/all-reports-accepted assertions and prohibit harmful inputs. Consumption-only APIs/state/deletion safety unchanged.

## Policy findings

| Policy | Verdict | Evidence / remaining requirement |
| --- | --- | --- |
| User Data disclosure | CONDITIONAL PASS | In-app legal screens describe actual account/content/voice/infra flows; support email correct. Public Site Content needs approved edits below; controller identity must match Play publisher. |
| Data Safety accuracy | DECLARATION STRATEGY READY; release confirmation pending | Adopted DeepSeek Shared=Yes for actual transfers; qualifying infrastructure/email/Speech Shared=No under standard service-provider terms. Custom DPA absence is not a blanket blocker. Audio Ephemeral=No conservative; actual account/configuration/binary still require owner verification. |
| Privacy Policy access | PASS accessibility; CONDITIONAL content | Public HTTPS 200, in-app links/settings available, no login required. Availability is not approval of current generic published body. |
| Account deletion | PASS source + owner runtime evidence | Two-step explicit confirmation, no automatic destructive retry/replay, stable idempotency, accepted vs completed distinct; session cleared/revoked. External page available. Financial/audit/backup exceptions disclosed; no grace/recovery guarantee. |
| Retention representation | PASS corrected source; CONDITIONAL published content | Retention foundation default disabled/report-only; only two eligible metadata categories. 12 calendar months eligibility, 90-day usage/30-day logs targets not deployed enforcement. Stable UUID remains linked; no irreversible-anonymization claim. |
| Payments / consumption-only | PASS source | No Play Billing/card/receipt collection, native checkout/deep-link purchase steering or upgrade CTA. Read-only entitlement/orders remain. No unverified refund/renewal promises. |
| Microphone and sensitive permissions | CONDITIONAL PASS | Optional user-started speech, visible Azure notice/text alternative, local preflight recording only. Device permission/denial paths and final merged manifest require owner release checks; no binary inspection performed. |
| SDK collection | PASS proposed Sentry removal; CONDITIONAL binary/config | No Sentry initialization/plugin/dependency remains. Local analytics has no network flush. Native Azure uses REST; secure storage/local modules not analytics. Backend telemetry separate. Final distributed SDK/manifest and remote EAS config not certified. |
| AI-generated content reporting | CODE/TESTS READY; rollout not verified | Eight typed mappings, real path IDs, server owner/version reportingId, immutable snapshots, existing admin moderation. Invalid IDs blocked; success requires valid 202 receipt. Deploy BE migration/code first; actual device/report moderation not performed. |
| AI prohibited-content safeguards | CONDITIONAL PASS | Terms prohibit harmful/illegal inputs, provider structured validation and report moderation exist. Code review does not establish effectiveness against harmful outputs; owner must exercise actual AI/report moderation and prevention controls. |
| User-generated content | CONDITIONAL PASS | Private practice/answers are not a social feed. Public website testimonials require explicit opt-in and moderation; no public mobile feed/chat found. New-feedback opt-in now false. Moderator operations/removal must be verified; no blanket UGC-policy exemption for future public surfaces. |
| Target audience / children | CONDITIONAL PASS | In-app policy says 18+. Owner must select intended **18 and over** audience and truthful rating/content questionnaire; this copy is not an age-verification mechanism. No Families declaration presumed. |
| Deceptive claims / coaching | PASS corrected legal scope | No hiring prediction, fabricated all-AI numerical scoring, automatic report success or automatic crash receipt. Legal tests do not certify every marketing/visual surface. |
| App access / reviewer account | OWNER ACTION | Supply working verified demo account/access instructions privately in Console, access to gated AI and quota features, no secrets in PR. No purchase required to review. |
| Ads / Advertising ID | NOT APPLICABLE in inspected source | No ad SDK or ad monetization, not a certification of old distributed builds. |
| Health, gambling, news, loans, financial transactions | NOT APPLICABLE in current Android feature scope | Career coaching; existing order history is download-only. No such regulated feature found. |
| AAB / signing / 16 KB / Android compatibility | NOT AUDITED | Explicitly outside this policy task; belongs to Expo/Play owner. |

## Blocker resolution, not blanket uncertainty

1. DeepSeek Shared=Yes strategy adopted; no training/retention guarantee. Qualifying SP Shared=No is supported by standard terms; actual applicability is a targeted account check, not a missing-custom-DPA blocker.
2. Reporting gap corrected in paired BE/Mobile patches; deploy BE migration/code first. Code tests do not prove live rollout or real-device moderation.
3. Public legal approval: admin checklist supplies exact new paragraphs. Owner/controller identity and processor sharing choice must be approved; do not publish blindly.
4. Release gates: actual DeepSeek selection, applicable SP agreements, standard Azure endpoint/no logging, final mobile build/permissions, audience/rating and reviewer access. These are targeted checks, not unresolved data collection facts.

**Code ready for review; declaration strategy ready; owner release confirmation required; public publication pending; overall NOT POLICY READY for submission.** See [provider review](PROVIDER-AGREEMENT-REVIEW.md). No merge/deploy/AAB/Console action performed.

## Official sources (checked 2026-10-04)

- [User Data](https://support.google.com/googleplay/android-developer/answer/10144311).
- [Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en).
- [Account deletion](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en).
- [Payments FAQ / consumption-only](https://support.google.com/googleplay/android-developer/answer/10281818?hl=en).
- [AI-generated content](https://support.google.com/googleplay/android-developer/answer/14094294?hl=en).
- [UGC policy](https://support.google.com/googleplay/android-developer/answer/9876937?hl=en).
- [Target audience](https://support.google.com/googleplay/android-developer/answer/9867159?hl=en).
- [Content ratings](https://support.google.com/googleplay/android-developer/answer/9859655?hl=en).
- Provider contractual links and endpoint-specific evidence: [Data Safety worksheet](PLAY-CONSOLE-DATA-SAFETY-FINAL.md#providers--scope-retention-and-sharing-evidence).

