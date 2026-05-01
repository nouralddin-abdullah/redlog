# Lesson Progress API

All endpoints require the bearer JWT in `Authorization: Bearer <token>`.
All responses are wrapped in `{ success, message, data }`.

> **Money fields are JSON strings, not numbers.** `pricePaid`, `Course.price`,
> `PaymentRequest.amount`, etc. are stored as Postgres `decimal(10,2)` and are
> returned by the API as strings (e.g. `"49.99"`). This is consistent across
> every money field in the system.

---

## POST `/lessons/:id/complete`

Mark a video lesson as completed for the current user. **Idempotent** — calling
this on an already-completed lesson is a no-op and **does not overwrite the
original `completedAt`** (so "completed N days ago" UI stays stable).

- **400** if the lesson is a quiz (quizzes auto-complete by passing the quiz).
- **403** if the user is not enrolled in the parent course.
- **404** if the lesson does not exist.

**Response 200**

```json
{
  "success": true,
  "message": "Lesson marked as completed",
  "data": {
    "lessonId": "8a1f4f0a-12b2-4f9e-9b0a-2f6c1c2d3e4f",
    "completedAt": "2026-05-01T10:42:11.000Z",
    "courseProgress": {
      "completedCount": 7,
      "totalLessons": 18,
      "percent": 38,
      "currentLessonId": "8a1f4f0a-12b2-4f9e-9b0a-2f6c1c2d3e4f",
      "completedAt": null
    }
  }
}
```

`courseProgress.completedAt` is non-null only when _every_ lesson in the course
is done.

---

## DELETE `/lessons/:id/complete`

Toggle the checkmark off (Udemy-style "unmark"). Idempotent.

- **400** if the lesson is a quiz (quiz completion can't be unmarked — re-take
  the quiz to change the result).
- **403** if not enrolled.
- **404** if the lesson does not exist.

**Response 200**

```json
{
  "success": true,
  "message": "Lesson completion removed",
  "data": {
    "lessonId": "8a1f4f0a-12b2-4f9e-9b0a-2f6c1c2d3e4f",
    "completedAt": null,
    "courseProgress": {
      "completedCount": 6,
      "totalLessons": 18,
      "percent": 33,
      "currentLessonId": "8a1f4f0a-12b2-4f9e-9b0a-2f6c1c2d3e4f",
      "completedAt": null
    }
  }
}
```

If the course was previously fully completed, `courseProgress.completedAt`
(and `Enrollment.completedAt`) are cleared back to `null`.

---

## GET `/courses/:slug/progress`

Per-course progress for the current user — used by the curriculum tab.

- **403** if not enrolled.
- **404** if the slug doesn't match a course.

**Response 200**

```json
{
  "success": true,
  "message": "Course progress retrieved successfully",
  "data": {
    "courseId": "f0e3a1b2-aaaa-bbbb-cccc-111122223333",
    "completedCount": 7,
    "totalLessons": 18,
    "percent": 38,
    "currentLessonId": "8a1f4f0a-12b2-4f9e-9b0a-2f6c1c2d3e4f",
    "completedAt": null,
    "completedLessonIds": ["lesson-uuid-1", "lesson-uuid-2", "lesson-uuid-3"]
  }
}
```

- `percent` is floored (a course is never reported 100% before it's actually
  done).
- `completedLessonIds` is a **set** — order is not guaranteed. Use it for
  per-lesson checkmarks against the curriculum tree the frontend already has.
- Quiz lessons that the user has passed appear in `completedLessonIds` exactly
  like video lessons. Failed quiz attempts do not affect this set and never
  un-complete a previously-passed quiz.
- **Empty course** (`totalLessons === 0`): the endpoint still returns 200 with
  `{ totalLessons: 0, percent: 0, completedLessonIds: [] }`. Frontend should
  treat this as the "no lessons yet" state.

---

## GET `/me/enrollments`

List the current user's enrolled courses, each with an embedded progress block
for the My Courses page. Ordered `enrolledAt: DESC`.

**Response 200**

```json
{
  "success": true,
  "message": "Enrollments retrieved successfully",
  "data": [
    {
      "id": "enrollment-uuid",
      "userId": "user-uuid",
      "courseId": "course-uuid",
      "pricePaid": "49.99",
      "enrolledAt": "2026-04-12T08:00:00.000Z",
      "lastAccessedAt": "2026-05-01T10:42:11.000Z",
      "currentLessonId": "8a1f4f0a-12b2-4f9e-9b0a-2f6c1c2d3e4f",
      "completedAt": null,
      "course": {
        "id": "course-uuid",
        "slug": "intro-to-radiology",
        "title": "مقدمة في الأشعة",
        "thumbnail": "https://cdn.example.com/courses/intro.jpg"
      },
      "progress": {
        "completedCount": 7,
        "totalLessons": 18,
        "percent": 38,
        "currentLessonId": "8a1f4f0a-12b2-4f9e-9b0a-2f6c1c2d3e4f",
        "completedAt": null
      }
    }
  ]
}
```

- `progress` is **always present** (never `null`). Empty courses come back as
  `{ completedCount: 0, totalLessons: 0, percent: 0, ... }` — same shape as
  `GET /courses/:slug/progress`. Frontend can render an "empty" state by
  checking `progress.totalLessons === 0`.
- `currentLessonId` on the enrollment matches `progress.currentLessonId`.
- `pricePaid` is a string (see top-of-doc note).

---

## GET `/courses/:slug/access` (no progress here)

This endpoint already exists from a prior step. **It does NOT include progress
or `currentLessonId`** — it only returns access state + the latest payment
request + the bare enrollment row (`id`, `enrolledAt`, `lastAccessedAt`,
`completedAt`). Kept this way so the access response stays light and easily
cacheable.

For the course landing page's "Continue learning" button + progress bar, call
`GET /courses/:slug/progress` separately when the access state is `ENROLLED`.

---

## Implicit behaviors (no endpoint to call)

These happen automatically — the frontend doesn't trigger them:

| Trigger                                                           | Effect                                                                            |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `POST /quiz-attempts/:id/submit` returns `passed: true`           | Quiz lesson is marked complete (idempotent — re-passing is a no-op).              |
| `POST /quiz-attempts/:id/submit` returns `passed: false`          | No effect on progress. Never un-completes a previously-passed quiz.               |
| `GET /lessons/:id/playback` (enrolled, non-instructor, non-admin) | Enrollment's `currentLessonId` + `lastAccessedAt` are updated.                    |
| `GET /lessons/:id` (enrolled, non-instructor, non-admin)          | Same as above — covers quiz lessons (no playback URL) and any future lesson type. |
| Course instructor or `ADMIN` opens a lesson                       | `currentLessonId` is **not** bumped (they're authoring/inspecting, not learning). |
| Last remaining lesson in a course gets completed                  | `Enrollment.completedAt` is stamped.                                              |
| A previously-complete course has a lesson un-marked               | `Enrollment.completedAt` is cleared back to `null`.                               |

`bumpCurrentLesson` is best-effort — if it fails internally, the playback URL
or lesson response is still returned successfully. The player will load even
if the resume position doesn't get updated.

---

## Cache invalidation (frontend hint)

After `POST` or `DELETE /lessons/:id/complete`, invalidate:

- `GET /courses/:slug/progress`
- `GET /me/enrollments`
- `GET /courses/:slug/access` — because its `enrollment.completedAt` flips when
  the last lesson completes / un-completes.
