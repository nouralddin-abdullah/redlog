# Course Curriculum API

All endpoints in this doc require the bearer JWT in
`Authorization: Bearer <token>`. All responses are wrapped in
`{ success, message, data }`. All mutations are restricted to
**course owner** or **admin** — anything else returns 403.

This doc covers everything the instructor curriculum tab needs:

- Read the curriculum tree
- Create / rename / delete modules
- Create / edit / delete lessons
- **Drag-and-drop reorder** modules + lessons in one transaction

---

## GET `/me/instructor/courses/:slug/curriculum`

Roles: `INSTRUCTOR` or `ADMIN`. Returns the modules + lessons tree for the
instructor's edit page. **Includes drafts** — instructor sees the full tree
regardless of `Course.status`.

| Param  | Where | Type   |
| ------ | ----- | ------ |
| `slug` | path  | string |

Errors: **403** if caller isn't the course owner and isn't admin.
**404** if the slug doesn't match a course.

**Response 200**

```json
{
  "success": true,
  "message": "Curriculum retrieved successfully",
  "data": [
    {
      "id": "module-uuid",
      "title": "الوحدة الأولى: مقدمة وأساسيات",
      "order": 0,
      "durationMinutes": 26,
      "courseId": "course-uuid",
      "lessons": [
        {
          "id": "lesson-uuid-1",
          "title": "الترحيب والتعريف بالكورس",
          "type": "video",
          "order": 0,
          "durationSeconds": 60,
          "isPreview": true,
          "moduleId": "module-uuid"
        },
        {
          "id": "lesson-uuid-2",
          "title": "أنواع الأشعة الطبية المستخدمة",
          "type": "video",
          "order": 1,
          "durationSeconds": 900,
          "isPreview": false,
          "moduleId": "module-uuid"
        },
        {
          "id": "lesson-uuid-3",
          "title": "اختبار الوحدة الأولى",
          "type": "quiz",
          "order": 2,
          "durationSeconds": 600,
          "isPreview": false,
          "moduleId": "module-uuid"
        }
      ],
      "createdAt": "2026-04-12T08:00:00.000Z",
      "updatedAt": "2026-04-30T11:00:00.000Z"
    }
  ]
}
```

`module.lessons` always comes back sorted by `lesson.order ASC`. Modules are
sorted by `module.order ASC`.

The public read of the same data lives at `GET /courses/:slug/curriculum`
(no auth). It returns the same shape but doesn't include any
preview-gated fields (lesson access is enforced separately at the
`GET /lessons/:id` level).

---

## POST `/courses/:courseId/modules`

**"إضافة وحدة جديدة"** — create a module under a course.

| Param      | Where | Type |
| ---------- | ----- | ---- |
| `courseId` | path  | UUID |

**Request body**

```json
{
  "title": "الوحدة الرابعة: الموجات فوق الصوتية",
  "order": 3
}
```

| Field   | Type   | Required | Notes                                                                                                                            |
| ------- | ------ | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `title` | string | yes      | 1–200 chars                                                                                                                      |
| `order` | int    | no       | Defaults to `0`. Position among siblings. Use `PUT /curriculum/order` for bulk re-arranges instead of fighting `order` manually. |

Errors: **400** validation, **403** not owner/admin, **404** course missing.

**Response 200** — the created module:

```json
{
  "success": true,
  "message": "Module created successfully",
  "data": {
    "id": "new-module-uuid",
    "title": "الوحدة الرابعة: الموجات فوق الصوتية",
    "order": 3,
    "durationMinutes": 0,
    "courseId": "course-uuid",
    "lessons": [],
    "createdAt": "2026-05-02T09:00:00.000Z",
    "updatedAt": "2026-05-02T09:00:00.000Z"
  }
}
```

---

## PATCH `/modules/:id`

Rename or change a module's order.

| Param | Where | Type |
| ----- | ----- | ---- |
| `id`  | path  | UUID |

**Request body** — partial, send only what changes:

```json
{ "title": "الوحدة الرابعة (محدّثة)" }
```

| Field   | Type   | Notes                                                      |
| ------- | ------ | ---------------------------------------------------------- |
| `title` | string | 1–200 chars                                                |
| `order` | int    | `≥ 0`. Prefer the bulk reorder endpoint for drag-and-drop. |

Errors: **400** validation, **403** not owner/admin, **404** module missing.

**Response 200** — same shape as the create response, with the updated values.

---

## DELETE `/modules/:id`

Delete a module **and cascade-delete its lessons**. Recomputes
`Course.totalLessons` and `Course.durationMinutes` automatically.

| Param | Where | Type |
| ----- | ----- | ---- |
| `id`  | path  | UUID |

Errors: **403** not owner/admin, **404** module missing.

**Response 200**

```json
{ "success": true, "message": "Module deleted successfully" }
```

> ⚠️ Hard delete — cascades to every lesson under the module.
> No undo, no soft-delete on modules. Lessons themselves are soft-deleted
> via `DELETE /lessons/:id` (different rules, see below).

---

## POST `/modules/:moduleId/lessons`

**"إضافة درس"** — create a lesson under a module.

| Param      | Where | Type |
| ---------- | ----- | ---- |
| `moduleId` | path  | UUID |

**Request body**

```json
{
  "title": "تشخيص أمراض الكلى بالـ CT",
  "type": "video",
  "order": 4,
  "durationSeconds": 720,
  "isPreview": false,
  "bunnyVideoId": "98f9e1a3-1234-5678-9abc-def012345678",
  "thumbnailUrl": null,
  "transcript": null,
  "transcriptCues": null
}
```

| Field             | Type                             | Required | Notes                                                                                                                       |
| ----------------- | -------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| `title`           | string                           | yes      | 1–200 chars                                                                                                                 |
| `type`            | `"video"` \| `"quiz"`            | no       | Default `"video"`                                                                                                           |
| `order`           | int                              | no       | Default `0`                                                                                                                 |
| `durationSeconds` | int ≥ 0                          | no       | For VIDEO with `bunnyVideoId`, server may overwrite from Bunny's reported runtime. For QUIZ, this is the time limit.        |
| `bunnyVideoId`    | UUID \| null                     | no       | Bunny Stream video GUID. When set, the server tries to auto-pull `durationSeconds` and auto-fill `thumbnailUrl` from Bunny. |
| `thumbnailUrl`    | URL \| null                      | no       | Override Bunny's thumbnail.                                                                                                 |
| `transcript`      | string \| null                   | no       | Plain-text, ≤ 50000 chars                                                                                                   |
| `transcriptCues`  | `{ start, end, text }[]` \| null | no       | Synced cues for "النص المكتوب" tab                                                                                          |
| `isPreview`       | bool                             | no       | Default `false`. Preview lessons are publicly playable without enrollment.                                                  |

Quiz-specific fields (`passThresholdPercent`, `maxAttempts`, `questionsCount`)
are **not** settable via this endpoint yet — they default at create and are
managed via the quiz-questions endpoints. (Open gap — see "What's missing"
at the bottom.)

Errors: **400** validation, **403** not owner/admin, **404** module missing.

**Response 200** — the created lesson with full fields:

```json
{
  "success": true,
  "message": "Lesson created successfully",
  "data": {
    "id": "new-lesson-uuid",
    "title": "تشخيص أمراض الكلى بالـ CT",
    "type": "video",
    "order": 4,
    "durationSeconds": 720,
    "isPreview": false,
    "moduleId": "module-uuid",
    "bunnyVideoId": "98f9e1a3-1234-5678-9abc-def012345678",
    "thumbnailUrl": "https://vz-...b-cdn.net/.../thumbnail.jpg",
    "transcript": null,
    "transcriptCues": null,
    "attachments": [],
    "createdAt": "2026-05-02T09:05:00.000Z",
    "updatedAt": "2026-05-02T09:05:00.000Z"
  }
}
```

Side effects: bumps `Module.durationMinutes`, `Course.durationMinutes`,
`Course.totalLessons` automatically.

---

## GET `/lessons/:id`

Read the full editable detail for a single lesson — used by the instructor's
"تعديل" pencil button. The endpoint is `@Public` but `assertCanView`
short-circuits to allow:

- **Course owner** (instructor whose `course.instructorId === userId`)
- **Admin**
- Anyone enrolled in the parent course
- Anyone (incl. anonymous) for `isPreview: true` lessons

So the same URL serves both the student player and the instructor edit page —
the response shape is identical. There is no separate "instructor-only"
variant for basic lesson fields.

| Param | Where | Type |
| ----- | ----- | ---- |
| `id`  | path  | UUID |

Errors: **403** if not allowed by the rules above. **404** lesson missing.

**Response 200**

```json
{
  "success": true,
  "message": "Lesson retrieved successfully",
  "data": {
    "id": "lesson-uuid",
    "title": "تشخيص أمراض الكلى بالـ CT",
    "type": "video",
    "order": 4,
    "durationSeconds": 720,
    "isPreview": false,
    "moduleId": "module-uuid",
    "bunnyVideoId": "98f9e1a3-1234-5678-9abc-def012345678",
    "thumbnailUrl": "https://vz-...b-cdn.net/.../thumbnail.jpg",
    "transcript": "النص الكامل للدرس…",
    "transcriptCues": [
      { "start": 0, "end": 4.2, "text": "مرحباً بكم في الدرس" },
      { "start": 4.2, "end": 9.8, "text": "اليوم سنتحدث عن الكلى" }
    ],
    "attachments": [
      {
        "id": "attachment-uuid",
        "title": "ملاحظات الدرس",
        "fileUrl": "https://...",
        "mimeType": "application/pdf",
        "fileSizeBytes": 524288
      }
    ],
    "createdAt": "2026-04-12T08:00:00.000Z",
    "updatedAt": "2026-04-30T11:00:00.000Z"
  }
}
```

> ℹ️ **For QUIZ-type lessons:** the response above contains the basic lesson
> fields, but **does NOT include the questions, options, pass threshold,
> max-attempts, or per-question explanations**. Those live behind the
> instructor-only endpoint **`GET /lessons/:id/quiz/admin`** (returns
> `QuizAdminDTO` — see [`docs/quiz-api.md`](./quiz-api.md)).
>
> Editing pass threshold / max-attempts → `PATCH /lessons/:id/quiz/settings`.
> Question CRUD → `POST/PATCH/DELETE /lessons/:id/quiz/questions` and
> `/quiz-questions/:id`.

### Side effects

`GET /lessons/:id` bumps `Enrollment.currentLessonId` and `lastAccessedAt`
**for enrolled students only** — instructor-as-owner and admin viewers do
NOT trigger the bump (they're authoring/inspecting, not learning).

---

## PATCH `/lessons/:id`

Edit a lesson. Partial — send only what changes.

| Param | Where | Type |
| ----- | ----- | ---- |
| `id`  | path  | UUID |

**Request body** — same shape as create, every field optional. Examples:

```json
{ "title": "عنوان جديد" }
```

```json
{ "bunnyVideoId": "deadbeef-...", "isPreview": true }
```

### Replacing the video

Two ways:

**1. Direct upload (recommended) — no copy-paste, no Bunny dashboard trip:**
The instructor selects a file in the UI and the browser uploads it
**directly to Bunny Stream** via TUS. See the dedicated
[Lesson Video Upload API](./lesson-video-upload-api.md) doc — two
endpoints (`POST /lessons/:id/video/upload` to start, `GET /lessons/:id/video/status`
to poll until encoding finishes), plus a `tus-js-client` snippet you can
drop into the frontend.

**2. Manual GUID paste (legacy):**
If the instructor uploaded the video on the Bunny dashboard themselves and
just wants to attach the existing GUID:

```json
PATCH /lessons/:id
{ "bunnyVideoId": "new-bunny-guid-here" }
```

When `bunnyVideoId` flips to a new value:

- `thumbnailUrl` is auto-refreshed from Bunny's CDN **unless** the same PATCH
  explicitly sets it.
- `durationSeconds` is auto-refreshed from Bunny's reported runtime **unless**
  the same PATCH explicitly sets it.
- `Module.durationMinutes` and `Course.durationMinutes` are recomputed if the
  duration changed.

Setting `bunnyVideoId: null` detaches the video.

Errors: **400** validation, **403** not owner/admin, **404** lesson missing.

**Response 200** — the updated lesson, same shape as create.

Side effects: if `durationSeconds` changed, recomputes
`Module.durationMinutes` and `Course.durationMinutes`.

---

## DELETE `/lessons/:id`

**Soft-delete** a lesson — sets `deletedAt`, the row stays in the DB but is
filtered out of every read query. Recomputes durations + totals.

| Param | Where | Type |
| ----- | ----- | ---- |
| `id`  | path  | UUID |

Errors: **403** not owner/admin, **404** lesson missing.

**Response 200**

```json
{ "success": true, "message": "Lesson deleted successfully" }
```

> Lessons are soft-deleted (per `Lesson.deletedAt`). Modules are hard-deleted
> with a cascade. The asymmetry is intentional: lessons frequently get the
> "delete and undo" treatment by mistake; modules are bigger commitments.

---

## PUT `/courses/:courseId/curriculum/order`

**Drag-and-drop reorder.** One endpoint reorders both modules and the
lessons inside each module — the frontend just sends the desired tree as
IDs and the backend writes the position index as the `order` column on
each row inside a transaction.

| Param      | Where | Type |
| ---------- | ----- | ---- |
| `courseId` | path  | UUID |

**Request body**

```json
{
  "modules": [
    {
      "id": "module-uuid-1",
      "lessonIds": ["lesson-uuid-a", "lesson-uuid-b", "lesson-uuid-c"]
    },
    {
      "id": "module-uuid-2",
      "lessonIds": ["lesson-uuid-d"]
    }
  ]
}
```

Field validation:

- `modules` — array, ≤ 200 items
- `modules[].id` — UUID
- `modules[].lessonIds` — array of UUIDs, ≤ 500 items per module

### Strict-set validation

The request must contain **EVERY** module of the course and **EVERY**
non-deleted lesson of each module — no missing, no extra, no duplicates.
Forces the frontend to GET → reorder → PUT the **full** tree, which prevents
accidental data loss from sending a stale snapshot.

If the set doesn't match, the response is **400** with a structured body the
frontend can use to debug stale state immediately:

```json
{
  "statusCode": 400,
  "message": {
    "message": "Module set does not match the course. Send EVERY module of the course exactly once.",
    "missingModules": ["module-uuid-X"],
    "extraModules": []
  }
}
```

For lessons (returned per-module):

```json
{
  "statusCode": 400,
  "message": {
    "message": "Lesson set does not match module module-uuid-1. Send EVERY lesson of the module exactly once.",
    "moduleId": "module-uuid-1",
    "missingLessons": ["lesson-uuid-Z"],
    "extraLessons": ["lesson-uuid-Y"]
  }
}
```

Other errors: **403** not owner/admin, **404** course missing.

### Response 200

Same shape as `GET /me/instructor/courses/:slug/curriculum` — the
freshly-ordered tree, so the client can re-render without a follow-up GET:

```json
{
  "success": true,
  "message": "Curriculum reordered successfully",
  "data": [
    {
      "id": "module-uuid-1",
      "title": "...",
      "order": 0,
      "durationMinutes": 26,
      "courseId": "course-uuid",
      "lessons": [
        { "id": "lesson-uuid-a", "title": "...", "order": 0, "...": "..." },
        { "id": "lesson-uuid-b", "title": "...", "order": 1, "...": "..." },
        { "id": "lesson-uuid-c", "title": "...", "order": 2, "...": "..." }
      ],
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

### Guarantees

- **Atomic** — wrapped in a transaction. Either every `order` UPDATE lands
  or none do.
- **Idempotent** — sending the same payload twice is a no-op. Frontend can
  safely retry on network errors.
- **Doesn't recompute durations or counts** — only the `order` column moves,
  so `Course.durationMinutes` / `totalLessons` and `Module.durationMinutes`
  stay stable.

### Recommended client flow

```
GET /me/instructor/courses/:slug/curriculum
↓
[user drags modules / lessons in the UI]
↓
PUT /courses/:courseId/curriculum/order   { full tree as IDs }
↓
[response is the new tree — replace local state]
```

If a `PATCH /lessons/:id` or `POST /modules/:courseId/modules` happens
between the GET and the PUT (e.g. another tab), the PUT will reject as
stale via the missing/extra IDs payload — frontend should re-GET and prompt
the user to retry.

---

## Cache invalidation (frontend hint)

Any of the mutations above invalidate:

- `GET /me/instructor/courses/:slug/curriculum`
- `GET /me/instructor/courses/:slug` (if `Course.totalLessons` /
  `durationMinutes` changed — true for create/delete-lesson and
  delete-module)
- `GET /courses/:slug/curriculum` (public — same data)
- `GET /me/instructor/courses` (the table — `totalLessons` / `durationMinutes`
  cells)

The reorder endpoint only invalidates the curriculum endpoints (no totals
change).

---

## Quiz lesson editing — separate endpoints

Quiz-type lessons share the basic lesson endpoints above (rename, reorder,
soft-delete, etc.), but anything quiz-specific lives in its own controller.
Full reference: [`docs/quiz-api.md`](./quiz-api.md). Quick map:

| What                                                                      | Endpoint                           |
| ------------------------------------------------------------------------- | ---------------------------------- |
| Get the full instructor view (questions + correct answers + explanations) | `GET /lessons/:id/quiz/admin`      |
| Update pass threshold + max attempts                                      | `PATCH /lessons/:id/quiz/settings` |
| Add a question (with options, atomic)                                     | `POST /lessons/:id/quiz/questions` |
| Edit a question (sending `options` replaces them all)                     | `PATCH /quiz-questions/:id`        |
| Delete a question                                                         | `DELETE /quiz-questions/:id`       |
| Upload an image to use in a question                                      | `POST /quiz/images`                |

`Lesson.questionsCount` is auto-maintained by `QuizQuestionsService` whenever
questions are added/removed — it's read-only from the API surface.

## Other related but separate features

- **Lesson attachments** (PDFs, slides) — own controller, not part of
  `PATCH /lessons/:id`. See the lesson-attachments endpoints in the codebase.
- **Lesson notes** and **lesson Q&A** — student-side features, separate
  controllers.
