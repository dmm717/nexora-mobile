# Current Google Play owner checklist — 2026-10-04

This replaces the superseded Billing migration checklist. The current app is consumption-only. Use [release handoff](release/GOOGLE-PLAY-HANDOFF.md) as the single task/status source and [Data Safety matrix](evidence/release/DATA-SAFETY-FORM-ANSWERS.md) for source evidence and unresolved form answers.

- [ ] Independent mobile PR review; do not merge until approved.
- [ ] Legal approval of app/public Privacy, Terms, Payment and Data Deletion content; confirm controller/contact and retention schedules.
- [x] FE PR #60 merged; public request and confirmation pages verified by HTTPS GET, no login required. Canonical `https://www.nexorainterview.io.vn/account-deletion` returns 200; apex redirects 308 to www. See [rollout evidence](evidence/release/PUBLIC-DELETION-ROLLOUT.md).
- [ ] Backend/email owner confirms exact hostname in the received verification link and production PublicUrl. Owner reports successful real email confirmation and DB deletion; our checks did not repeat a destructive request.
- [ ] Verify `https://www.nexorainterview.io.vn/privacy` content/availability and official contact `nexorainterview.vn@gmail.com` before publication. Public homepage/privacy and backend source default currently use a superseded address; content owner must synchronize.
- [ ] Confirm deployed backend contract/worker/email, AI/storage/hosting/diagnostic providers and retention/sharing answers.
- [ ] Resolve every item under [OPEN DATA SAFETY DECISIONS — OWNER INPUT REQUIRED](evidence/release/DATA-SAFETY-FORM-ANSWERS.md#open-data-safety-decisions--owner-input-required); include all active distributed app versions. Owner submits final form.
- [ ] Owner builds/signs production AAB, checks final manifest/native library alignment/16 KB support and tests release on devices.
- [ ] Owner configures account deletion URL, listing, applicable test tracks and final release. No build/signing/upload/publication occurred in this PR.

Do not mark a binary, external site or provider contract PASS from TypeScript/Jest/Expo Doctor. All owner tasks and evidence statuses are maintained in the handoff instead of duplicate contradictory tables.

AAB generation/signing, final binary inspection and 16 KB runtime checks are excluded from this corrective policy review and remain separate release tasks. Public HTTP availability and owner-reported functionality do not verify production contracts or Console answers.
