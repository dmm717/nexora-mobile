# Public deletion rollout evidence — 2026-10-04

Scope: read-only HTTPS GETs and source/PR inspection. No account/email request, confirmation POST, production deletion or private verification token was used by this mobile review.

## Independently verified

- [FE PR #60](https://github.com/dmm717/nexora-fe/pull/60) is MERGED; merge commit `053673a46fe23df05fc096cf7206e1ef8a6c4df1`, merged 2026-10-04 21:01:33 Asia/Saigon. FE main at that SHA inspected read-only.
- HTTP requests used no cookies, bearer token or authenticated session. Default certificate/hostname validation passed; no TLS verification bypass.

| HTTPS URL | Redirect chain / final result | Public content |
| --- | --- | --- |
| `https://nexorainterview.io.vn/account-deletion` | 308 → `https://www.nexorainterview.io.vn/account-deletion` → 200 | Nexora deletion page and email request form |
| `https://www.nexorainterview.io.vn/account-deletion` | 200, no redirect | Email input and instructions, no login redirect |
| `https://nexorainterview.io.vn/account-deletion/confirm` | 308 → `https://www.nexorainterview.io.vn/account-deletion/confirm` → 200 | Confirmation page reachable without authentication; no token supplied |
| `https://www.nexorainterview.io.vn/account-deletion/confirm` | 200, no redirect | Confirmation page, not automatic deletion |
| Both hosts `/privacy` | Apex 308 → www 200; www direct 200 | Public Privacy document |
| Both host homepages | Apex 308 → www 200; www direct 200 | Public homepage |

Canonical mobile URL remains `https://www.nexorainterview.io.vn/account-deletion`, based on the production redirects. HTTP accessibility proves page delivery, not all backend/provider outcomes or an SLA.

FE `src/components/features/account-deletion/DeletionFlow.tsx` requires explicit form submission to request email and explicit confirmation to POST the token. `src/app/account-deletion/page.tsx` describes the single-use 30-minute verification link. Source and public page establish the instructions now used in mobile. Existing authenticated mobile deletion still calls `/me/deletion-requests` directly.

## Reported by product owner

The user reports completing a real production email verification flow at the apex `/account-deletion/confirm`, observing backend acceptance and verifying account deletion in the database. This is reported production evidence, not an independently repeated destructive test. No database output or private email token was supplied/retained here.

The confirmation route on both hosts resolves to the www canonical host. Exact origin/query content of an actually received production email link and the deployed `Authentication:EmailVerification:PublicUrl` setting were not inspected; backend/email owner should confirm these without disclosing tokens. Source constructs the confirmation link from that setting. Do not change automated sender configuration to match a support-contact address.

## Contact and remaining review

Only intended current official support/contact: `nexorainterview.vn@gmail.com`, explicitly selected by the product owner. Mobile uses a shared SUPPORT_EMAIL constant. Production homepage and public Privacy still display a superseded contact during this GET check; FE/content owner must synchronize their published content. FE/backend repositories and email sender configuration were not modified.

The earlier pre-rollout availability finding is superseded by these checks; historical evidence and Git history remain intact. Provider contracts, retention, SDK diagnostics and final Console decisions are tracked in [Data Safety open decisions](DATA-SAFETY-FORM-ANSWERS.md#open-data-safety-decisions--owner-input-required). This is policy review evidence; AAB, signing, 16 KB and hardware testing are excluded.
