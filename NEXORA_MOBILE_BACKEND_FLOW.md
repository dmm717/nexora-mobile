# Nexora Backend → React Native Mobile Integration Guide

> **Mục đích:** tài liệu handoff để build `nexora-mobile` bằng React Native/Expo.
>
> **Backend source of truth:** `qbao0111/nexora-backend`
>
> **Backend main đã verify:** `f4e60b4e709ce34a552632a9957c2321121e5056`
>
> **Ngày verify:** 2026-09-16
>
> Các phần ghi **Mobile decision / TODO** là quyết định cho app, không phải capability BE đã có.

---

## 1. Kiến trúc tổng thể

Nexora nên dùng **một backend chung** cho web và mobile.

```text
                       ┌─────────────────────┐
                       │ nexora-fe (Next.js) │
                       └──────────┬──────────┘
                                  │ REST + SignalR
                                  ▼
┌─────────────────────┐     Nexora Backend API
│ nexora-mobile       │ ────────► │
│ React Native / Expo │           ├── PostgreSQL
└─────────────────────┘           ├── Worker
                                  ├── AI providers
                                  ├── R2 / Storage
                                  ├── Email
                                  └── Payment provider
```

Mobile chỉ gọi Nexora REST API/SignalR. Không gọi DeepSeek/Gemini, PostgreSQL, Worker, R2 secret hay payment provider trực tiếp.

---

# 2. API conventions

## Base URL

```text
Local API: http://localhost:5088/api/v1
Swagger:   http://localhost:5088/swagger
Realtime:  {API_ORIGIN}/hubs/realtime
```

Mobile nên dùng một biến môi trường duy nhất cho API origin.

## Response

Success:

```json
{ "data": {} }
```

Handled error:

```json
{
  "error": {
    "code": "SOME_ERROR_CODE",
    "message": "Safe message",
    "requestId": "..."
  }
}
```

App luôn giữ `code` + `requestId`. Logic UI branch bằng `error.code`, không branch bằng message tiếng Việt.

---

# 3. Auth — điểm khác biệt quan trọng giữa web và mobile

## Contract BE hiện tại

```text
POST /auth/login
      ↓
accessToken ngắn hạn trong JSON
      ↓
Authorization: Bearer <accessToken>
```

Refresh token hiện tại được BE cấp bằng **HttpOnly cookie**.

Browser flow:

```text
register
  ↓
verify email
  ↓
login
  ↓
accessToken in memory
  ↓
GET /me
```

Endpoints chính:

```text
POST /api/v1/auth/register
POST /api/v1/auth/verify-email
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
POST /api/v1/me/password
GET  /api/v1/me
```

## Mobile decision / TODO

Không nên mặc định rằng refresh-cookie của browser sẽ hoạt động giống hệt trên React Native.

Cần chọn và test một trong hai hướng:

### A. Giữ cookie refresh

Dùng native cookie handling/cookie jar và verify Android + iOS.

### B. Bổ sung mobile refresh-token transport

Nếu BE thêm mobile token flow thì refresh token phải để trong:

```text
Android → Keystore
iOS     → Keychain
Expo    → expo-secure-store
```

**Không lưu refresh token vào AsyncStorage.**

### App boot

```text
Splash
  ↓
restore/refresh session
  ↓
lấy accessToken
  ↓
GET /me
  ↓
Authenticated App
```

Shared API client phải có **một refresh lock chung**:

```text
protected request → 401
        ↓
POST /auth/refresh đúng 1 lần
        ↓
replace accessToken
        ↓
retry request đúng 1 lần
```

Không loop refresh.

---

# 4. API client mobile

Gợi ý:

```text
src/api/
├─ client.ts
├─ auth.api.ts
├─ profile.api.ts
├─ resumes.api.ts
├─ interview.api.ts
├─ practice.api.ts
├─ progress.api.ts
├─ billing.api.ts
└─ realtime.ts
```

`client.ts` chịu trách nhiệm:

- base URL
- Bearer token
- parse envelope
- normalize error
- refresh lock
- retry request một lần
- request cancellation

---

# 5. Idempotency

Mutation quan trọng dùng:

```http
Idempotency-Key: <uuid>
```

Một user intent = một UUID.

Nếu timeout/network fail và retry **cùng hành động, cùng body** → dùng lại UUID cũ.

Hành động mới → UUID mới.

Áp dụng cho các flow như:

- checkout
- CV analysis
- interview start
- submit answer
- continue interview
- complete interview
- retry report
- Practice Again
- Scenario submit/retry
- STAR attempt
- destructive mutations cần replay-safe

Mobile network chập chờn nên đây là rule rất quan trọng.

---

# 6. Startup / hydration

Sau khi auth:

```text
GET /me
  ↓
parallel hydrate
  ├─ career goals
  ├─ resumes
  ├─ progress/dashboard
  ├─ plans/entitlement nếu cần
  └─ learning path / recommendation khi có prerequisite
```

Không fabricate data khi loading.

```text
role null        ≠ Backend Engineer
seniority null   ≠ Middle
score null       ≠ 0/100
no learning path ≠ fake 0/8
```

---

# 7. Career Goal

Create:

```http
POST /api/v1/career-goals
```

Ví dụ:

```json
{
  "targetRole": "Backend Engineer",
  "seniority": "Middle"
}
```

List:

```http
GET /api/v1/career-goals
```

Update:

```http
PATCH /api/v1/career-goals/{id}
```

Delete:

```http
DELETE /api/v1/career-goals/{id}
```

Goal mới active sẽ deactivate goal active cũ.

History cũ không bị rewrite khi đổi goal.

---

# 8. Resume upload

Current flow:

```text
presign
  ↓
raw upload
  ↓
finalize resume
  ↓
extract async
```

## 8.1 Presign

```http
POST /api/v1/uploads/presign
```

```json
{
  "fileName": "resume.pdf",
  "contentType": "application/pdf",
  "size": 123456
}
```

Hiện support PDF / DOCX, default docs ghi limit 10 MiB.

## 8.2 Upload raw bytes

```http
PUT {uploadUrl}
Content-Type: application/pdf
```

Body = raw file bytes.

Không multipart, không base64 nếu không bắt buộc.

## 8.3 Finalize

```http
POST /api/v1/resumes
```

```json
{ "uploadToken": "..." }
```

Status:

```text
uploaded
  ↓
extracting
  ├─→ ready
  ├─→ ocr_fallback → ready
  └─→ failed
```

Read:

```text
GET /api/v1/resumes
GET /api/v1/resumes/{resumeId}
```

Frontend không nhận raw extracted CV text.

## 8.4 Primary CV

```http
PUT /api/v1/me/primary-resume
```

```json
{ "resumeId": "..." }
```

Clear:

```json
{ "resumeId": null }
```

Chỉ set primary khi resume `ready`.

---

# 9. Job Description

```text
POST /api/v1/job-descriptions
GET  /api/v1/job-descriptions
GET  /api/v1/job-descriptions/{id}
```

Ví dụ:

```json
{
  "title": "Backend Developer",
  "content": "<real job description>"
}
```

`job_targeted` phải có JD thật. App không được tự fabricate JD từ tên role.

---

# 10. CV Analysis

Start:

```http
POST /api/v1/resume-analyses
Idempotency-Key: <uuid>
```

Ví dụ:

```json
{
  "resumeId": "...",
  "jobDescriptionId": "..."
}
```

Read:

```text
GET /api/v1/resume-analyses/{analysisId}
GET /api/v1/resume-analyses?page=1&pageSize=20
```

Lifecycle:

```text
queued → processing → completed
                   ↘ failed
```

Mobile UX:

```text
POST analysis
  ↓
indeterminate processing UI
  ↓
SignalR resourceChanged
  ↓
GET analysis
```

Fallback polling bounded: khoảng `1s → 2s → 3s → 5s`.

Không fake processing percentage.

Resolved CV-analysis context được snapshot; thay Career Goal sau đó không rewrite analysis cũ.

---

# 11. Interview Preflight

Mobile cho user chọn/edit context của **session này**:

- CV
- target role
- seniority
- JD
- interview type
- difficulty
- Career Goal

Start:

```http
POST /api/v1/interviews
Idempotency-Key: <uuid>
```

Preferred goal-backed body:

```json
{
  "careerGoalId": "...",
  "interviewType": "technical",
  "difficulty": "medium"
}
```

Server có thể resolve missing context từ:

```text
Career Goal
   ↓
role + seniority
   ↓
target JD
   ↓
Primary Resume
```

Explicit user override thắng default sau owner/readiness validation.

Resolved values được snapshot vào interview.

---

# 12. Interview question semantics

Ba câu free đầu server-owned:

```text
Q1 = self_introduction
Q2 = interview mode
Q3 = tiếp tục mode/context
```

Behavioral thường:

```text
Q2 = behavioral_star
Q3 = motivation_role_fit
```

Mobile chỉ render question BE trả về.

Không generate fallback question local.

---

# 13. Speech contract trên mobile

Canonical:

```text
Microphone
  ↓
STT
  ↓
editable transcript
  ↓
TEXT
  ↓
POST answer
```

BE interview hiện không yêu cầu raw audio.

Nếu STT fail:

```text
Chưa nhận diện được nội dung
```

Cho retry hoặc nhập tay.

Voice ↔ Text không được clear draft.

Bắt đầu mic → stop/pause TTS.

---

# 14. Submit answer

```http
POST /api/v1/interviews/{interviewId}/answers
Idempotency-Key: <uuid>
```

```json
{
  "questionId": "...",
  "content": "candidate transcript/text",
  "durationSeconds": 42
}
```

Candidate answer là factual source of truth.

App không được tự biến JD/question/rubric thành bằng chứng rằng ứng viên đã làm một công nghệ hay thành tích nào đó.

---

# 15. Free Q1 → Q3

```text
Q1
 ↓ submit
Quick Coaching
 ↓
Q2
 ↓ submit
Quick Coaching
 ↓
Q3
 ↓ submit
Quick Coaching
 ↓
Free Boundary
```

Sau Q2:

```text
Primary:   Tiếp tục Câu 3
Secondary: Kết thúc sớm & nhận báo cáo 2 câu
```

Không mở pricing sau Q2.

Sau Q3:

```text
Primary:   Nhận báo cáo miễn phí
Secondary: Tiếp tục phỏng vấn chuyên sâu
```

---

# 16. Continue interview

```http
POST /api/v1/interviews/{id}/continue
Idempotency-Key: <uuid>
```

Access phải dựa entitlement/backend state, không hardcode planCode.

Finite:

```text
Câu hỏi 4/6
Câu hỏi 4/8
```

Unlimited:

```text
Câu hỏi 9
```

Không render `9/10` giả.

---

# 17. Complete + Report

Complete:

```http
POST /api/v1/interviews/{id}/complete
Idempotency-Key: <uuid>
```

Hiện controller trả `202 Accepted`.

Report async.

Read:

```http
GET /api/v1/interviews/{id}/report
```

Retry:

```http
POST /api/v1/interviews/{id}/report/retry
Idempotency-Key: <uuid>
```

Retry report không được bắt user trả lời lại và không consume quota interview lần nữa.

Recommended:

```text
Complete
  ↓
Report Generating
  ↓
SignalR / polling
  ↓
GET report
  ↓
Report Screen
```

---

# 18. Practice Again

Tạo **new interview session**:

```http
POST /api/v1/interviews/{sourceInterviewId}/practice-again
Idempotency-Key: <new uuid>
```

Ví dụ:

```json
{
  "questionId": "...",
  "focus": "correctness",
  "reason": "repeat_question"
}
```

Canonical reasons:

```text
repeat_question
rubric_weakness
recommendation
manual
```

Source interview/report immutable.

---

# 19. Interview history

```http
GET /api/v1/interviews?page=1&pageSize=20
```

Detail:

```http
GET /api/v1/interviews/{id}
```

Current controller history trả metadata như:

- status
- role
- seniority
- type/difficulty
- timestamps
- answered/issued question count
- report available
- careerGoalId
- Practice Again source IDs
- reason/focus

---

# 20. Scenario

Source of truth:

```text
GET /api/v1/scenarios
GET /api/v1/scenarios/{slugOrId}
```

Không copy `scenarios.vi.json` vào app.

Create/get active draft:

```http
POST /api/v1/scenario-attempts
Idempotency-Key: <uuid>
```

```json
{ "scenarioId": "..." }
```

Submit:

```http
POST /api/v1/scenario-attempts/{attemptId}/submit
Idempotency-Key: <uuid>
```

```json
{ "answer": "..." }
```

Submit async (`202`).

Retry:

```http
POST /api/v1/scenarios/{scenarioId}/retry
```

History:

```http
GET /api/v1/scenarios/{id-or-slug}/attempts
```

Score comparison do backend tính.

---

# 21. STAR Builder

Một answer tự nhiên, không phải 4 textbox S/T/A/R.

```http
POST /api/v1/star-attempts
Idempotency-Key: <uuid>
```

```json
{
  "question": "Kể về một lần bạn xử lý xung đột trong nhóm.",
  "answer": "..."
}
```

Missing STAR component:

```text
detected=false
score=0
evidence=""
```

Mobile không tự cắt substring làm fake evidence.

---

# 22. Skill Profile / Năng lực

```http
GET /api/v1/skill-profile
```

Computed read model.

Có thể `200` nhưng empty khi chưa đủ valid scored evidence.

Evidence có thể tới từ:

- CV analysis
- interview report
- STAR
- completed Scenario

Mobile render weakness signals canonical từ BE, không tự combine gap lịch sử.

---

# 23. Progress

Progress/readiness do backend sở hữu.

Rule:

```text
score = null
```

UI phải là:

```text
Chưa đủ dữ liệu đánh giá
```

không phải `0/100`.

Không tự fallback seniority thành `Middle`.

---

# 24. Learning Path

Create:

```http
POST /api/v1/learning-path
```

Requires active Career Goal.

Hydrate:

```http
GET /api/v1/learning-path
```

GET không tự create path.

Valid empty/error state:

```text
ACTIVE_CAREER_GOAL_REQUIRED
LEARNING_PATH_NOT_FOUND
```

Refresh sau evidence mới:

```http
POST /api/v1/learning-path/refresh
```

Complete activity:

```http
PATCH /api/v1/learning-path/activities/{activityId}
```

```json
{ "status": "completed" }
```

Không offer uncomplete transition.

New user không được thấy mock `0/8` roadmap.

---

# 25. Next Best Action

```http
GET /api/v1/recommendations/next
```

Read-only, không gọi AI, không create Learning Path.

Concept:

```json
{
  "data": {
    "reason": "...",
    "activityType": "interview",
    "resourceId": null,
    "estimatedMinutes": 20,
    "priority": 1,
    "action": {}
  }
}
```

Routing mobile:

```text
star         → STAR
scenario     → Scenario / Pricing nếu entitlement chặn
interview    → Preflight
retry source → Practice Again
resume       → CV flow
null         → Practice Hub
```

Không fabricate recommendation khi `data: null`.

---

# 26. Billing / entitlement

Plans:

```http
GET /api/v1/plans
```

Checkout:

```http
POST /api/v1/checkout-sessions
Idempotency-Key: <uuid>
```

```json
{ "planPriceId": "..." }
```

Backend owns:

- price
- entitlement
- quota
- question limit
- payment state

Stable feature codes:

```text
cv_analysis
interview
scenario
star_builder
advanced_report
progress_analytics
```

Feature access phải dựa entitlement, không chỉ plan name/code.

---

# 27. App Store / Play Store billing warning

Current BE checkout là web/payment-provider flow.

Trước khi publish app có paid digital feature phải review riêng:

- Apple In-App Purchase
- Google Play Billing

Không assume SePay/web checkout hiện tại được phép bê thẳng vào App Store/Play app.

---

# 28. Realtime / SignalR

Hub:

```text
/hubs/realtime
```

Event:

```text
resourceChanged
```

Pattern:

```text
resourceChanged
  ↓
dedupe eventId
  ↓
REST refetch
```

SignalR chỉ là notification.

REST mới là source of truth.

Dùng cho async resource như:

- Resume extraction
- CV analysis
- report processing
- Scenario evaluation

Fallback slow polling: khoảng 15–30s khi background/reconcile.

RN package nên evaluate:

```text
@Microsoft/signalr
```

---

# 29. TTS hiện tại

Backend hiện tại **chưa có dedicated TTS endpoint** trong flow đã verify.

Không code app theo endpoint tưởng tượng như:

```text
POST /api/v1/tts
```

Future architecture nên:

```text
question text
  ↓
Nexora BE TTS endpoint
  ↓
Google/Gemini TTS
  ↓
audio/cache
  ↓
React Native player
```

API key TTS không ship trong APK/IPA.

---

# 30. Screen → API map

| Screen mobile | Main API |
|---|---|
| Splash | refresh session, `/me` |
| Login | `/auth/login`, `/me` |
| Register | register + verify-email |
| Forgot Password | forgot/reset password |
| Overview | `/me`, goals, progress, recommendation |
| Career Profile | `/me`, goals, resumes, primary CV |
| CV Upload | presign → PUT raw → `/resumes` |
| CV Analysis | `/resume-analyses` + detail |
| Preflight | goals + resumes + JD + entitlement |
| Interview Room | `/interviews`, `/answers`, `/continue` |
| Free Boundary | interview + entitlement |
| Report Generating | `/complete`, SignalR |
| Report | `/{id}/report` |
| Practice Again | `/{id}/practice-again` |
| Practice Hub | interview history + recommendation |
| Scenario Library | `/scenarios` |
| Scenario Room | attempts/submit/retry |
| STAR | `/star-attempts` |
| Năng lực | `/skill-profile` |
| Learning Path | `/learning-path` + refresh |
| Pricing | `/plans`, checkout |

---

# 31. State management recommendation

## Server state

Nên dùng TanStack Query cho:

- `/me`
- goals
- resumes
- analyses
- interviews
- reports
- Scenario attempts
- skill profile
- progress
- learning path
- recommendation
- plans/entitlement

## Local state

Dùng local/Zustand nhỏ cho:

- modal
- transcript draft
- microphone
- TTS playback
- preflight chưa submit
- upload progress
- animation

Không duplicate toàn bộ backend domain state vào Redux/Zustand.

---

# 32. Cache invalidation

```text
Resume ready
→ resumes + /me

Primary CV change
→ /me + profile-dependent reads

CV analysis completed
→ analysis history + skill-profile + progress
→ refresh Learning Path nếu phù hợp

Interview/report completed
→ interview detail/history/report
→ skill-profile + progress
→ refresh path/recommendation

Scenario completed
→ attempts + skill-profile + progress
→ refresh path/recommendation

STAR completed
→ STAR history + skill-profile + progress
→ refresh path/recommendation

Checkout success
→ entitlement + /me + pricing state
```

---

# 33. Mobile flaky-network rules

Mutation flow:

```text
create UUID
  ↓
send
  ↓
timeout?
  ↓
retry same body + same UUID
```

Đặc biệt interview answer:

- giữ draft local tới khi BE acknowledge;
- không clear draft vì timeout;
- block accidental double submit;
- retry same idempotency key.

---

# 34. Error handling

```text
401 → refresh once → retry once → login
403 → entitlement/quota/access UI
404 → owner-scoped missing resource
409 → state/idempotency conflict
429 → backoff, không spam
5xx → preserve user draft + retry UX
```

Các code flow cần handle có thể gồm:

```text
RESUME_NOT_READY
RESUME_EXTRACTION_FAILED
ACTIVE_CAREER_GOAL_REQUIRED
LEARNING_PATH_NOT_FOUND
IDEMPOTENCY_CONFLICT
SCENARIO_ATTEMPT_IN_PROGRESS
AI_OUTPUT_INVALID
```

---

# 35. Thứ tự build mobile

## M1 — Foundation

- Expo/RN
- navigation
- API client
- auth/session
- SecureStore/cookie strategy
- TanStack Query
- error system
- design tokens

## M2 — Profile + CV

- `/me`
- Career Goal
- resume list/upload
- Primary CV
- CV analysis
- realtime processing

## M3 — Interview

- Preflight
- Interview Room
- STT
- editable transcript
- answer submit
- Q1–Q3
- Free Boundary
- continuation
- report

## M4 — Practice

- Practice Again
- Scenario
- STAR

## M5 — Growth

- Skill Profile
- Progress
- Learning Path
- Next Best Action

## M6 — Production mobile

- TTS BE
- push notification nếu cần
- store-compliant billing
- analytics/crash
- deep links/email verify
- App Store/Play release

---

# 36. Không copy mock từ prototype sang production mobile

Không copy:

- `PrototypeContext`
- fake persona
- fake progress
- fake score
- fake interview history
- fake Career Goal
- fake Learning Path
- local Scenario catalogue
- billing simulation

Có thể port UI/layout/motion.

Data phải từ BE.

---

# 37. Mobile production checklist

- [ ] Chốt native refresh-token strategy.
- [ ] Token không log.
- [ ] Refresh token không nằm AsyncStorage.
- [ ] Có centralized 401 refresh lock.
- [ ] Idempotency key sống qua network retry.
- [ ] Upload PDF/DOCX test Android + iOS.
- [ ] Không fabricate data ở loading/empty state.
- [ ] STT → editable text → submit.
- [ ] Interview BE không nhận fake/raw audio.
- [ ] Free boundary đúng Q3.
- [ ] Unlimited không fake denominator.
- [ ] Report retry không consume quota lại.
- [ ] Practice Again tạo session mới.
- [ ] SignalR reconnect + REST reconcile hoạt động.
- [ ] Draft answer survive network fail.
- [ ] Billing review App Store/Play.
- [ ] TTS secret không ship app.
- [ ] Deep link/email verification test đủ.
- [ ] UI logic branch bằng backend `error.code`.

---

# 38. Backend references

Verified ở backend `main`:

```text
f4e60b4e709ce34a552632a9957c2321121e5056
```

References chính:

```text
docs/frontend-integration.md
docs/frontend-swagger-guide.vi.md
docs/realtime-notifications.md
docs/03-api-data-contract.md

src/Nexora.Api/Controllers/AuthController.cs
src/Nexora.Api/Controllers/MeController.cs
src/Nexora.Api/Controllers/UploadsController.cs
src/Nexora.Api/Controllers/ResumesController.cs
src/Nexora.Api/Controllers/ResumeAnalysesController.cs
src/Nexora.Api/Controllers/CareerGoalsController.cs
src/Nexora.Api/Controllers/InterviewsController.cs
src/Nexora.Api/Controllers/ScenariosController.cs
src/Nexora.Api/Controllers/ScenarioAttemptsController.cs
src/Nexora.Api/Controllers/StarAttemptsController.cs
src/Nexora.Api/Controllers/SkillProfileController.cs
src/Nexora.Api/Controllers/ProgressController.cs
src/Nexora.Api/Controllers/LearningPathController.cs
src/Nexora.Api/Controllers/RecommendationsController.cs
src/Nexora.Api/Controllers/PlansController.cs
src/Nexora.Api/Controllers/CheckoutController.cs
```

---

## Principle

```text
Mobile quyết định presentation.
Backend quyết định truth.
```

Web Next.js và React Native chỉ là hai client khác nhau của cùng một domain contract.
