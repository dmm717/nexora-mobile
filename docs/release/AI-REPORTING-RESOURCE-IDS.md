# PR #4 corrective: authoritative reporting resource IDs

This supplements existing Play handoff evidence; it changes neither Data Safety declarations nor release approval. Backend PR #125 remains read-only reference evidence.

| UI location / alias | Canonical POST contentType | Authoritative contentId |
| --- | --- | --- |
| Current interview question | `interview_question` | API `currentQuestion.id` |
| Quick Coaching / `coaching_note` | `interview_answer_evaluation` | API `answer.id`, carried with its ready evaluation through hook state to modal |
| Overall interview report | `interview_report` | API `report.id`, never interview route ID |
| QuestionReviewCard | `interview_report` | Explicit parent `report.id`; visible scope is the entire interview report, not `review.questionId` |
| CV / `cv_analysis` | `resume_analysis` | Completed API `analysisResult.id` with result |
| Scenario / `scenario_result` | `scenario_evaluation` | Completed API `activeAttempt.id` with evaluation, never scenario ID/slug |
| STAR / `star_suggestion` | `star_evaluation` | Completed API `activeAttempt.id` with evaluation |
| Learning path | `learning_path` | API `path.id` |
| Skill profile | `skill_profile` | API `profile.reportingId` |

No fabricated fallback ID and no client snapshot is submitted. Missing/malformed IDs disable reporting. The shared API still requires HTTP 202 with a valid server receipt before success; in-flight guards and deliberate retry/error handling are unchanged.

## Async coaching

The public answer field is **`evaluationState`**, not the entity's internal `EvaluationStatus`. Only `ready` plus non-null evaluation is displayed/reportable. `queued`/`processing` answers keep the existing interview query polling every 3 seconds. Hydration matches the submitted `answer.id`; another answer's evaluation cannot substitute for it.

Current backend intentionally withholds evaluation JSON during an active interview even when evaluationState is ready. Mobile respects that boundary: it does not synthesize feedback, bypass the API, or make withheld content reportable. A ready state alone is insufficient. The existing completion/report flow and continuation/quota/idempotency behavior are preserved.

## Validation

- `npx tsc --noEmit`
- `npm run lint`
- `npm run test:ci -- --runInBand`: 15 suites / 109 tests (14 new component/data-flow regressions; no snapshots).
- `npx expo-doctor`: 21/21 checks.
- Final pushed HEAD hosted checks must be verified separately; no device/production/Gemini/DeepSeek test, release artifact, merge or deployment is implied.

The new tests exercise the real interview API envelope unwrapping, hook, QuickCoachingModal, QuestionReviewCard and shared report POST/receipt behavior with deterministic transport mocks. Existing canonical mapping, malformed receipt, network/status errors and no automatic retry tests remain intact.

Independent review is required before merging PR #4.
