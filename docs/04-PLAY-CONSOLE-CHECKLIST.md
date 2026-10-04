# Current Google Play owner checklist — 2026-10-04

This replaces the superseded Billing migration checklist. The current app is consumption-only. Use [release handoff](release/GOOGLE-PLAY-HANDOFF.md) as the single task/status source and [Data Safety matrix](evidence/release/DATA-SAFETY-FORM-ANSWERS.md) for source evidence and unresolved form answers.

- [ ] Independent mobile PR review; do not merge until approved.
- [ ] Legal approval of app/public Privacy, Terms, Payment and Data Deletion content; confirm controller/contact and retention schedules.
- [ ] FE deletion request and email confirmation pages merged, deployed and independently verified. Canonical `https://www.nexorainterview.io.vn/account-deletion` currently returns 404; release blocked.
- [ ] Verify `https://www.nexorainterview.io.vn/privacy` content/availability and official contact `nexorainterview.vn@gmail.com` before publication. Homepage/backend default currently show `nexorainterview@gmail.com`; content owner must synchronize.
- [ ] Confirm deployed backend contract/worker/email, AI/storage/hosting/diagnostic providers and retention/sharing answers.
- [ ] Resolve every provider/Console unknown in the Data Safety matrix; include all active distributed app versions. Owner submits final form.
- [ ] Owner builds/signs production AAB, checks final manifest/native library alignment/16 KB support and tests release on devices.
- [ ] Owner configures account deletion URL, listing, applicable test tracks and final release. No build/signing/upload/publication occurred in this PR.

Do not mark a binary, external site or provider contract PASS from TypeScript/Jest/Expo Doctor. All owner tasks and evidence statuses are maintained in the handoff instead of duplicate contradictory tables.
