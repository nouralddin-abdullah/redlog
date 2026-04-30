# Quiz API — Response Shapes

Reference for the frontend. Covers every quiz endpoint with full success / error response shapes.

## Conventions

**Standard envelope** (every endpoint):
```ts
{ success: true, message: string, data: <see endpoint> }
```

**Error envelope** (Nest default):
```ts
{ statusCode: number, message: string | string[], error: string }
```

**Auth header** for protected routes: `Authorization: Bearer <jwt>`.

**Path conventions:**
- `/api/lessons/:id/...` — `:id` is a **lesson UUID**.
- `/api/quiz-attempts/:id` — `:id` is an **attempt UUID** (from `POST /lessons/:id/quiz/attempts`). These are different IDs — a 404 on `/quiz-attempts/<lessonId>` means you sent the wrong one.

**Date fields** are ISO-8601 strings (UTC). Frontend converts via `new Date(...)`.

**`null` means absent** — never `undefined`. Optional fields are present in the response with `null`, not omitted.

---

## Student endpoints

### `GET /api/lessons/:id/quiz`

Launchpad data. Public route — works without a token, but if a Bearer token is sent, the response includes per-user fields (`attemptsUsed`, `lastAttempt`).

**Auth:** optional.

**200 response:**
```jsonc
{
  "success": true,
  "message": "Quiz retrieved successfully",
  "data": {
    "lessonId": "bc11f193-3cbd-40fb-bb0f-6015f1b5613c",
    "durationSeconds": 3000,
    "passThresholdPercent": 60,
    "questionsCount": 5,
    "maxAttempts": null,            // null = unlimited
    "attemptsUsed": 0,              // 0 if anonymous or no attempts yet
    "questions": [
      {
        "id": "<question-uuid>",
        "order": 0,
        "text": "ما هو أفضل فحص أولي لتقييم اشتباه استرواح الصدر…",
        "imageUrl": null,
        "points": 1,
        "options": [
          { "id": "<option-uuid>", "order": 0, "text": "أشعة الصدر السينية…" },
          { "id": "<option-uuid>", "order": 1, "text": "أشعة مقطعية للصدر…" },
          { "id": "<option-uuid>", "order": 2, "text": "موجات فوق صوتية…" },
          { "id": "<option-uuid>", "order": 3, "text": "رنين مغناطيسي…" }
        ]
      }
      // … 4 more questions
    ],
    "lastAttempt": {
      "id": "<attempt-uuid>",
      "startedAt": "2026-04-30T18:14:22.000Z",
      "submittedAt": "2026-04-30T18:32:11.000Z",
      "expiresAt":   "2026-04-30T19:04:22.000Z",
      "score": 80,
      "passed": true,
      "status": "submitted"           // 'in_progress' | 'submitted' | 'expired'
    }
    // lastAttempt is null if the user has never attempted (or anonymous)
  }
}
```

**Critical:** the response **never** includes `isCorrect` on options or `explanation` on questions. That data only appears in the post-submission attempt result.

**404:**
```json
{ "statusCode": 404, "message": "Lesson not found", "error": "Not Found" }
```

**400** (lesson is type `video`, not `quiz`):
```json
{ "statusCode": 400, "message": "Lesson is not a quiz-type lesson", "error": "Bad Request" }
```

---

### `POST /api/lessons/:id/quiz/attempts`

Start a new attempt or resume an existing in-progress one.

**Auth:** required.

**Request body:** none.

**201 response (new attempt):**
```json
{
  "success": true,
  "message": "Attempt started successfully",
  "data": {
    "attemptId": "9d8f7a6c-1234-…",
    "startedAt": "2026-04-30T18:14:22.000Z",
    "expiresAt": "2026-04-30T19:04:22.000Z",
    "resumed": false
  }
}
```

**201 response (resumed in-progress attempt):**
```json
{
  "success": true,
  "message": "Resumed in-progress attempt",
  "data": {
    "attemptId": "9d8f7a6c-1234-…",
    "startedAt": "2026-04-30T18:14:22.000Z",
    "expiresAt": "2026-04-30T19:04:22.000Z",
    "resumed": true
  }
}
```

**Frontend should treat the two identically** — store `attemptId` and start the countdown to `expiresAt`.

**Errors:**
| Status | Body                                                              | Cause                                  |
|--------|-------------------------------------------------------------------|----------------------------------------|
| 401    | `{ "statusCode": 401, "message": "Unauthorized" }`                | No / invalid Bearer token              |
| 403    | `{ "message": "You must be enrolled in this course to take the quiz" }` | Not enrolled                           |
| 400    | `{ "message": "You have used all 3 attempts for this quiz" }`     | `maxAttempts` reached                  |
| 400    | `{ "message": "Lesson is not a quiz-type lesson" }`               | Wrong lesson type                      |
| 400    | `{ "message": "Quiz has no time limit configured (durationSeconds must be > 0)" }` | Instructor hasn't set duration |
| 404    | `{ "message": "Lesson not found" }`                               | Bad lesson id                          |

---

### `GET /api/quiz-attempts/:id`

Returns the attempt's current state. Auto-finalizes if expired.

**Auth:** required, must be the attempt owner.

**Two response shapes** depending on attempt status — frontend keys off the presence of `submittedAt`.

**200 — in-progress** (`submittedAt` is `null`):
```json
{
  "success": true,
  "message": "Attempt retrieved successfully",
  "data": {
    "id": "<attempt-uuid>",
    "lessonId": "<lesson-uuid>",
    "startedAt": "2026-04-30T18:14:22.000Z",
    "expiresAt": "2026-04-30T19:04:22.000Z",
    "submittedAt": null,
    "answers": [
      { "questionId": "<question-uuid>", "optionId": "<option-uuid>" },
      { "questionId": "<question-uuid>", "optionId": "<option-uuid>" }
      // one entry per question the user has answered so far
    ]
  }
}
```

**200 — submitted (or auto-finalized after expiry)** (`submittedAt` is set):
```json
{
  "success": true,
  "message": "Attempt retrieved successfully",
  "data": {
    "id": "<attempt-uuid>",
    "lessonId": "<lesson-uuid>",
    "startedAt": "2026-04-30T18:14:22.000Z",
    "submittedAt": "2026-04-30T18:32:11.000Z",
    "score": 80,
    "passed": true,
    "pointsEarned": 6,
    "pointsTotal": 8,
    "answers": [
      {
        "questionId": "<question-uuid>",
        "selectedOptionId": "<option-uuid>",
        "correctOptionId": "<option-uuid>",
        "isCorrect": true,
        "points": 2,
        "explanation": "تسلسل الانتشار (DWI) هو الأكثر حساسية…"
      }
      // one entry per answered question
    ]
  }
}
```

Note — questions the user **didn't answer** before submit/expiry **do not appear** in the `answers` array. Frontend should diff against `quiz.questions[]` to render "skipped" rows if needed.

**Errors:**
| Status | Body                                                  | Cause                          |
|--------|-------------------------------------------------------|--------------------------------|
| 401    | `{ "statusCode": 401, "message": "Unauthorized" }`    | No / invalid token             |
| 403    | `{ "message": "This attempt belongs to another user" }` | Token user ≠ attempt owner     |
| 404    | `{ "message": "Attempt not found" }`                  | Bad / non-existent attempt id  |

> Common pitfall: the `:id` in this URL is the **attempt** id (returned by `POST /lessons/:id/quiz/attempts`), not the lesson id. A 404 here usually means you sent a lesson uuid by mistake.

---

### `POST /api/quiz-attempts/:id/answers`

Save (or replace) the student's answer for a single question. Designed for autosave-on-pick.

**Auth:** required, owner only.

**Request body:**
```json
{
  "questionId": "<question-uuid>",
  "optionId":   "<option-uuid>"
}
```

**201 response:**
```json
{
  "success": true,
  "message": "Answer saved",
  "data": {
    "questionId": "<question-uuid>",
    "optionId": "<option-uuid>"
  }
}
```

Calling this again for the same `questionId` with a different `optionId` **replaces** the previous pick (idempotent upsert).

**Errors:**
| Status | Body                                                                     | Cause                                            |
|--------|--------------------------------------------------------------------------|--------------------------------------------------|
| 400    | `{ "message": "Attempt is already submitted; answers cannot be changed" }` | Tried to answer a submitted attempt              |
| 400    | `{ "message": "Question does not belong to this quiz" }`                 | `questionId` is from a different lesson          |
| 400    | `{ "message": "Option does not belong to the given question" }`          | `optionId` doesn't match `questionId`            |
| 400    | Zod validation array                                                     | Body is missing fields or has bad UUIDs          |
| 401    | `{ "statusCode": 401, "message": "Unauthorized" }`                       | No / invalid token                               |
| 403    | `{ "message": "This attempt belongs to another user" }`                  | Token user ≠ attempt owner                       |
| 404    | `{ "message": "Attempt not found" }`                                     | Bad attempt id                                   |

---

### `POST /api/quiz-attempts/:id/submit`

Finalize the attempt and grade it. Idempotent — re-calling on a submitted attempt returns the same result without re-grading.

**Auth:** required, owner only.

**Request body:** none.

**201 response:** identical shape to the **submitted** variant of `GET /quiz-attempts/:id` (see above):
```json
{
  "success": true,
  "message": "Attempt submitted",
  "data": {
    "id": "<attempt-uuid>",
    "lessonId": "<lesson-uuid>",
    "startedAt": "2026-04-30T18:14:22.000Z",
    "submittedAt": "2026-04-30T18:32:11.000Z",
    "score": 80,
    "passed": true,
    "pointsEarned": 6,
    "pointsTotal": 8,
    "answers": [
      {
        "questionId": "<question-uuid>",
        "selectedOptionId": "<option-uuid>",
        "correctOptionId": "<option-uuid>",
        "isCorrect": true,
        "points": 2,
        "explanation": "تسلسل الانتشار (DWI)…"
      }
    ]
  }
}
```

**Errors:** same as `GET /quiz-attempts/:id` (401 / 403 / 404). Submit doesn't 400 on expired attempts — the loader auto-finalizes them, so calling `submit` on an expired attempt just returns the auto-graded result.

---

## Instructor endpoints

### `GET /api/lessons/:id/quiz/admin`

Full quiz data including `isCorrect` on every option and `explanation` on every question.

**Auth:** required, instructor (course owner) or admin.

**200 response:**
```json
{
  "success": true,
  "message": "Quiz retrieved successfully",
  "data": {
    "lessonId": "<lesson-uuid>",
    "durationSeconds": 3000,
    "passThresholdPercent": 60,
    "questionsCount": 5,
    "maxAttempts": null,
    "questions": [
      {
        "id": "<question-uuid>",
        "order": 0,
        "text": "ما هو أفضل فحص أولي…",
        "imageUrl": null,
        "points": 1,
        "explanation": "أشعة الصدر السينية الأمامية الخلفية…",
        "options": [
          { "id": "<opt-uuid>", "order": 0, "text": "أشعة الصدر السينية…", "isCorrect": true },
          { "id": "<opt-uuid>", "order": 1, "text": "أشعة مقطعية…",       "isCorrect": false },
          { "id": "<opt-uuid>", "order": 2, "text": "موجات فوق صوتية…",   "isCorrect": false },
          { "id": "<opt-uuid>", "order": 3, "text": "رنين مغناطيسي…",     "isCorrect": false }
        ]
      }
    ]
  }
}
```

**Errors:** 401 (no token), 403 (not the owner / not admin), 404 (bad lesson), 400 (wrong type).

---

### `PATCH /api/lessons/:id/quiz/settings`

Update `passThresholdPercent` and/or `maxAttempts`. (Edit `durationSeconds` via the regular `PATCH /lessons/:id`.)

**Auth:** instructor / admin.

**Request body** (all fields optional):
```json
{
  "passThresholdPercent": 70,
  "maxAttempts": 3
}
```

**200 response:**
```json
{
  "success": true,
  "message": "Quiz settings updated successfully",
  "data": {
    "passThresholdPercent": 70,
    "maxAttempts": 3
  }
}
```

---

### `POST /api/lessons/:id/quiz/questions`

Create a question + its options atomically.

**Auth:** instructor / admin.

**Request body:**
```json
{
  "text": "ما هي العلامة الإشعاعية الأكثر تحديداً لانصمام رئوي ضخم؟",
  "imageUrl": "https://pub-….r2.dev/quiz-images/abc.jpg",
  "explanation": "علامة Saddle embolus…",
  "points": 2,
  "order": 2,
  "options": [
    { "text": "توسع الأذين الأيسر",                 "isCorrect": false, "order": 0 },
    { "text": "علامة الخثرة الراكبة (Saddle embolus)", "isCorrect": true,  "order": 1 },
    { "text": "انصباب جنبي ثنائي",                  "isCorrect": false, "order": 2 },
    { "text": "تكلسات في الشريان التاجي",            "isCorrect": false, "order": 3 }
  ]
}
```

**Constraints:**
- `text`: 1–5000 chars
- `imageUrl`: must be a URL (use the upload endpoint to get one) or `null`
- `explanation`: 0–10000 chars or `null`
- `points`: integer 1–100, default 1
- `options`: array of 2–10, **exactly one** with `isCorrect: true` (SBA invariant — server rejects otherwise)

**201 response:**
```json
{
  "success": true,
  "message": "Question created successfully",
  "data": {
    "id": "<question-uuid>",
    "order": 2,
    "text": "ما هي العلامة الإشعاعية…",
    "imageUrl": "https://…",
    "points": 2,
    "explanation": "علامة Saddle embolus…",
    "options": [
      { "id": "<opt-uuid>", "order": 0, "text": "توسع الأذين الأيسر", "isCorrect": false }
      // …all options with their server-assigned uuids
    ]
  }
}
```

**Errors:**
| Status | Body                                                                          |
|--------|-------------------------------------------------------------------------------|
| 400    | `{ "message": ["At least 2 options are required", "Exactly one option must be marked correct (SBA)"] }` |
| 400    | `{ "message": "Questions can only be added to quiz-type lessons" }`           |
| 401    | Unauthorized                                                                  |
| 403    | `{ "message": "You do not have permission to modify this course" }`           |

---

### `PATCH /api/quiz-questions/:id`

Update question fields. Sending an `options` array atomically replaces all options for that question (delete + recreate inside one transaction).

**Auth:** instructor / admin.

**Request body** (any subset):
```json
{
  "text": "updated question text",
  "explanation": "updated explanation",
  "points": 3,
  "order": 1,
  "options": [
    { "text": "new opt 1", "isCorrect": true,  "order": 0 },
    { "text": "new opt 2", "isCorrect": false, "order": 1 }
  ]
}
```

**Important:** if `options` is included, the **whole set is replaced**. Old option UUIDs are gone. If you only want to edit option text, send the entire array with the updated text.

If `options` is omitted, only the question-level fields (`text`, `explanation`, `points`, `order`, `imageUrl`) update.

**200 response:** same shape as the create response.

---

### `DELETE /api/quiz-questions/:id`

**Auth:** instructor / admin.

**200 response:**
```json
{ "success": true, "message": "Question deleted successfully" }
```

Cascades: deletes all options for the question, and any `QuizAttemptAnswer` rows that referenced it. Existing attempt scores (`pointsEarned`, `pointsTotal`, `score`, `passed`) stay intact since they're snapshotted on the attempt row.

---

### `POST /api/quiz/images`

Upload a quiz image (radiology scan, chart, etc.) to R2. Returns a public URL — frontend includes it in subsequent question CRUD bodies.

**Auth:** instructor / admin.

**Content-Type:** `multipart/form-data`.

**Form field:** `file` — JPG / PNG / WebP / GIF, max 8MB.

**201 response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "imageUrl": "https://pub-2da766…r2.dev/quiz-images/<userId>-<timestamp>-<filename>.jpg"
  }
}
```

**Errors:**
| Status | Body                                                               |
|--------|--------------------------------------------------------------------|
| 400    | `{ "message": "File must be less than 8 MB" }`                     |
| 400    | `{ "message": "Validation failed (current file type is …, expected type is …)" }` |
| 401    | Unauthorized                                                       |
| 403    | Not instructor / admin                                             |

---

## Recommended frontend flow

### Student taking a quiz

```
1. GET  /api/lessons/:id/quiz                        → render launchpad
2. POST /api/lessons/:id/quiz/attempts               → start; store attemptId + expiresAt
3. (per option click)
   POST /api/quiz-attempts/:attemptId/answers        → autosave
4. POST /api/quiz-attempts/:attemptId/submit         → grade; render review screen
5. (later, if user reopens)
   GET  /api/quiz-attempts/:attemptId                → refetch to re-render review
```

If the user closes the tab mid-attempt and comes back later:
- `POST /lessons/:id/quiz/attempts` again → `resumed: true`, same `attemptId`.
- `GET /quiz-attempts/:attemptId` → in-progress state with already-saved answers.

If the timer hits 0 client-side without a submit:
- Server auto-finalizes on the next read. Just `GET /quiz-attempts/:attemptId` and you'll get the graded result.

### Instructor authoring a quiz

```
1. GET  /api/lessons/:id/quiz/admin                  → load full state
2. PATCH /api/lessons/:id/quiz/settings              → tune passThresholdPercent / maxAttempts
3. (optional) POST /api/quiz/images                  → upload image, get URL
4. POST /api/lessons/:id/quiz/questions              → create question with options
5. PATCH /api/quiz-questions/:qid                    → edit (resend options[] to replace)
6. DELETE /api/quiz-questions/:qid                   → remove
```

---

## Status codes summary

| Code | Meaning in this API                                                                  |
|------|--------------------------------------------------------------------------------------|
| 200  | Read or update success                                                               |
| 201  | Create / mutation success (POST)                                                     |
| 400  | Validation error (bad body, business-rule violation like "already submitted")        |
| 401  | Missing or invalid Bearer token on a protected route                                 |
| 403  | Authenticated but not allowed (not enrolled, not the owner, etc.)                    |
| 404  | Resource doesn't exist (lesson, attempt, question)                                   |
