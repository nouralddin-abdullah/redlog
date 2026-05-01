# Instructor Dashboard API

All endpoints require the bearer JWT in `Authorization: Bearer <token>`.
All responses are wrapped in `{ success, message, data }`.

> **Money fields are JSON strings.** Same convention as everywhere else in the
> API (`pricePaid`, `Course.price`, etc.). Earnings values like
> `thisMonthEarnings` and `earningsSeries[].amount` come back as `"49.99"`.

---

## Course publish workflow

Every new course starts in `draft`. The instructor must `submit-for-review` and
an admin must `approve` (or `reject`) before a course appears in the public
catalog.

### State machine

```
   ┌────────┐  submit-for-review   ┌───────────────┐
   │ draft  │ ───────────────────▶ │pending_review │
   └────────┘                      └───────┬───────┘
        ▲                       approve  │ │  reject (with adminNote)
        │                                ▼ ▼
        │           ┌──────────┐   ┌──────────┐
        └────────── │published │   │ rejected │
            unpublish└──────────┘   └────┬─────┘
                                         │ resubmit
                                         ▼
                                    pending_review
```

`publishedAt` is stamped the **first** time a course is approved and is never
overwritten — so "published since" is stable even if the course later flips
back to draft and is re-published.

### Endpoints

| Method | Path                             | Auth                        | What it does                                                                                                          |
| ------ | -------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/courses/:id/submit-for-review` | Instructor (owner) or Admin | `draft` or `rejected` → `pending_review`. Clears any prior `adminNote`.                                               |
| `POST` | `/courses/:id/approve`           | Admin                       | `pending_review` → `published`. Stamps `publishedAt` on first approval.                                               |
| `POST` | `/courses/:id/reject`            | Admin                       | `pending_review` → `rejected`. Body: `{ "adminNote": "string (5-2000 chars)" }`. The note is shown to the instructor. |
| `POST` | `/courses/:id/unpublish`         | Instructor (owner) or Admin | `published` → `draft`. Preserves `publishedAt`.                                                                       |

All four return the updated `CourseDTO`. **400** if the course is in a status
that can't make the requested transition.

### Course shape additions

`CourseDTO` now includes:

```json
{
  "status": "draft | pending_review | published | rejected",
  "submittedAt": "2026-04-30T14:00:00.000Z" | null,
  "reviewedAt":  "2026-05-01T09:30:00.000Z" | null,
  "adminNote":   "Course thumbnail violates the brand guidelines, please replace." | null,
  "publishedAt": "2026-05-01T09:30:00.000Z" | null
}
```

`isPublished` is **gone**. Use `status === "published"` instead.

`POST /courses` and `PATCH /courses/:id` no longer accept `isPublished` (or
`status`) — change status only via the workflow endpoints above.

The public catalog (`GET /courses`) still returns only `published` courses.
Admin/instructor list views can pass `?publishedOnly=false&status=pending_review`
(or any other status) to filter to a specific lifecycle state.

---

## Platform fee setting

A single configurable knob controls how `pricePaid` is split between the
instructor and the platform:

```
PaymentSettings.instructorRevenueSharePercent   (default 70.00)
```

**Retroactive** — there's no per-enrollment snapshot. Changing the value updates
every dashboard earnings calculation immediately. If you need historical
stability later, snapshot at enrollment-creation time as a follow-up.

### Updating it (admin)

`PATCH /admin/payment-settings` (existing endpoint) now also accepts:

```json
{ "instructorRevenueSharePercent": 65 }
```

Validation: `0 ≤ value ≤ 100`.

### How it's applied

`instructorEarnings = pricePaid × instructorRevenueSharePercent / 100`

Used by every money figure in the dashboard payload below.

---

## Question answered tracking

`LessonQuestion.answeredByInstructorAt` (new column) is automatically:

- **Set to `now()`** the first time the **course's instructor** posts a reply.
- **Cleared back to `null`** when the instructor's last reply is deleted.
- **Untouched** by admin replies — admins moderating doesn't dismiss the
  question from the instructor's "to-answer" queue.

This powers the dashboard's `pendingQuestionsCount` KPI and the
`pendingQuestions` panel — both filter on `answeredByInstructorAt IS NULL`.

---

## GET `/me/instructor/dashboard`

Roles: `INSTRUCTOR` or `ADMIN`. One round-trip — returns everything the
dashboard page needs.

**Response 200**

```json
{
  "success": true,
  "message": "Dashboard retrieved successfully",
  "data": {
    "kpis": {
      "averageRating": 4.8,
      "reviewsCount": 919,
      "pendingQuestionsCount": 3,
      "thisMonthEarnings": "283500.00",
      "lastMonthEarnings": "248684.21",
      "earningsPercentChange": 14,
      "activeStudents": 3500,
      "currency": "EGP"
    },
    "earningsSeries": [
      { "monthIso": "2025-12-01T00:00:00.000Z", "amount": "180000.00" },
      { "monthIso": "2026-01-01T00:00:00.000Z", "amount": "210000.00" },
      { "monthIso": "2026-02-01T00:00:00.000Z", "amount": "245000.00" },
      { "monthIso": "2026-03-01T00:00:00.000Z", "amount": "232000.00" },
      { "monthIso": "2026-04-01T00:00:00.000Z", "amount": "258000.00" },
      { "monthIso": "2026-05-01T00:00:00.000Z", "amount": "283500.00" }
    ],
    "totalEarningsLast6Months": "1408500.00",
    "topCourses": [
      {
        "id": "course-uuid",
        "slug": "ct-imaging",
        "title": "الأشعة المقطعية للصدر",
        "thumbnail": "https://cdn.example.com/...",
        "studentsCount": 1400,
        "completionPercent": 58,
        "rating": 4.7
      }
    ],
    "recentActivity": [
      {
        "type": "enrollment",
        "studentName": "نور عبدو",
        "courseId": "course-uuid",
        "courseTitle": "أساسيات الأشعة التشخيصية",
        "amount": "999.00",
        "rating": null,
        "createdAt": "2026-05-01T04:42:11.000Z"
      },
      {
        "type": "review",
        "studentName": "مى عبد الفتاح",
        "courseId": "course-uuid-2",
        "courseTitle": "الرنين المغناطيسي للدماغ",
        "amount": null,
        "rating": 5,
        "createdAt": "2026-05-01T01:30:00.000Z"
      }
    ],
    "pendingQuestions": [
      {
        "id": "question-uuid",
        "text": "ممكن توضح الفرق بين قيم ADC في السكتة الحادة والمزمنة بمثال عملي؟",
        "studentName": "كريم وحيد",
        "lessonId": "lesson-uuid",
        "lessonTitle": "تسلسلات DWI و ADC",
        "courseId": "course-uuid",
        "courseTitle": "الرنين المغناطيسي للدماغ",
        "createdAt": "2026-04-30T21:42:11.000Z"
      }
    ],
    "statusCounts": {
      "draft": 1,
      "pendingReview": 1,
      "published": 3,
      "rejected": 1
    }
  }
}
```

### Field notes

- **`kpis.earningsPercentChange`** is a signed integer (negative = down,
  positive = up). **`null`** when last month's gross was zero — frontend
  should render "—" rather than "+∞%".
- **`kpis.activeStudents`** = total enrollments across all of this instructor's
  courses (reads `InstructorProfile.studentsCount`). Same semantics as Udemy's
  count — NOT a unique-students count.
- **`earningsSeries`** always has exactly **6 entries** (oldest → newest, one
  per calendar month including the current). Empty months come back with
  `amount: "0.00"` so the sparkline never has gaps.
- **`topCourses`** only includes `published` courses. Up to 5, ordered by
  `studentsCount DESC`. `completionPercent` is **null** when the course has 0
  enrollments — frontend should render an empty state.
- **`recentActivity`** is a unioned feed of the 10 newest enrollments + 10
  newest reviews on this instructor's courses, then sorted by `createdAt DESC`
  and trimmed to 10.
- **`pendingQuestions`** is the 10 newest unanswered questions
  (`answeredByInstructorAt IS NULL`). Click-through goes to
  `lessonId` + opens the question for inline reply.
- **`statusCounts`** maps directly to the four status pills at the bottom of
  the dashboard.

---

## GET `/me/instructor/courses`

Roles: `INSTRUCTOR` or `ADMIN`. Powers the **"كورساتي"** table — every course
this instructor owns, with cached aggregates + per-course all-time earnings,
plus the four status-pill counts for the filter tabs.

### Query parameters

| Param    | Type                                                  | Default | Notes                                                                            |
| -------- | ----------------------------------------------------- | ------- | -------------------------------------------------------------------------------- |
| `status` | `draft` / `pending_review` / `published` / `rejected` | — (all) | Filters the list. The status counts in the response always reflect the FULL set. |
| `search` | string                                                | —       | Case-insensitive substring match on `title`.                                     |
| `page`   | int ≥ 1                                               | `1`     |                                                                                  |
| `limit`  | int 1..100                                            | `20`    |                                                                                  |

### Response 200

```json
{
  "success": true,
  "message": "Courses retrieved successfully",
  "data": {
    "data": [
      {
        "id": "course-uuid",
        "slug": "diagnostic-imaging-fundamentals",
        "title": "أساسيات الأشعة التشخيصية",
        "thumbnail": "https://cdn.example.com/courses/diag.jpg",
        "status": "published",
        "totalLessons": 42,
        "durationMinutes": 720,
        "price": "999.00",
        "currency": "EGP",
        "studentsCount": 1200,
        "totalEarnings": "1245753.00",
        "rating": 4.8,
        "reviewsCount": 91,
        "updatedAt": "2026-04-21T10:42:11.000Z",
        "submittedAt": "2026-01-04T08:00:00.000Z",
        "reviewedAt": "2026-01-05T11:30:00.000Z",
        "publishedAt": "2026-01-05T11:30:00.000Z",
        "adminNote": null
      },
      {
        "id": "course-uuid-2",
        "slug": "pediatric-imaging",
        "title": "أشعة الأطفال",
        "thumbnail": "https://cdn.example.com/courses/peds.jpg",
        "status": "pending_review",
        "totalLessons": 24,
        "durationMinutes": 360,
        "price": "899.00",
        "currency": "EGP",
        "studentsCount": 0,
        "totalEarnings": "0.00",
        "rating": 0,
        "reviewsCount": 0,
        "updatedAt": "2026-04-30T14:00:00.000Z",
        "submittedAt": "2026-04-30T14:00:00.000Z",
        "reviewedAt": null,
        "publishedAt": null,
        "adminNote": null
      },
      {
        "id": "course-uuid-3",
        "slug": "musculoskeletal-imaging",
        "title": "أشعة العظام والمفاصل",
        "thumbnail": "https://cdn.example.com/courses/mskl.jpg",
        "status": "rejected",
        "totalLessons": 30,
        "durationMinutes": 480,
        "price": "1099.00",
        "currency": "EGP",
        "studentsCount": 0,
        "totalEarnings": "0.00",
        "rating": 0,
        "reviewsCount": 0,
        "updatedAt": "2026-04-02T11:00:00.000Z",
        "submittedAt": "2026-04-01T09:00:00.000Z",
        "reviewedAt": "2026-04-02T11:00:00.000Z",
        "publishedAt": null,
        "adminNote": "صور المعاينة منخفضة الجودة، يرجى إعادة رفعها."
      }
    ],
    "total": 6,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "statusCounts": {
      "all": 6,
      "draft": 1,
      "pendingReview": 1,
      "published": 3,
      "rejected": 1
    }
  }
}
```

### Field notes

- **`totalEarnings`** is **all-time** (not just this month) and AFTER the
  current `instructorRevenueSharePercent`. Same retroactive semantics as the
  dashboard — change the % and every number here updates.
- **`price`** and **`totalEarnings`** are JSON **strings** (decimal stability,
  consistent with the rest of the API).
- **`statusCounts`** always counts the full set, NOT the filtered page —
  filter tabs stay stable as the user types into search.
- **Sort order** is `updatedAt DESC` (newest edits first). Not configurable
  for now — add a `sortBy` query param later if needed.
- The list includes `draft`, `pending_review`, and `rejected` courses too —
  this is the instructor's private view, not the public catalog.
- Action endpoints for the row icons already exist:
  - **Edit** (pencil): `PATCH /courses/:id`
  - **View** (eye): `GET /courses/:slug` (public) or `/courses/:slug/curriculum`
  - **More menu** (...): `POST /courses/:id/submit-for-review`,
    `POST /courses/:id/unpublish`, `DELETE /courses/:id`

---

## GET `/me/instructor/courses/:slug`

Roles: `INSTRUCTOR` or `ADMIN`. Returns the **full course detail** for the
instructor edit page.

- Returns the course **regardless of status** (draft, pending_review, published,
  rejected) — the instructor needs to edit drafts before they're approved.
- **403** if the caller isn't the course owner and isn't an admin.
- **404** if the slug doesn't match a course.

**Response 200**

```json
{
  "success": true,
  "message": "Course retrieved successfully",
  "data": {
    "id": "course-uuid",
    "slug": "diagnostic-imaging-fundamentals",
    "title": "أساسيات الأشعة التشخيصية",
    "description": "كورس شامل…",
    "longDescription": "ماذا سيتعلم الطالب وماذا يحتاج قبل الاشتراك…",
    "thumbnail": "https://cdn.example.com/courses/diag.jpg",
    "badge": "الأكثر طلباً",
    "whatYouWillLearn": ["قراءة أشعة الصدر", "تفسير CT للبطن", "..."],
    "prerequisites": ["معرفة أساسية بعلم التشريح"],
    "features": ["شهادة إتمام", "وصول مدى الحياة", "..."],
    "price": "999.00",
    "originalPrice": "1499.00",
    "rating": 4.8,
    "studentsCount": 1200,
    "reviewsCount": 91,
    "durationMinutes": 720,
    "totalLessons": 42,
    "status": "published",
    "submittedAt": "2026-01-04T08:00:00.000Z",
    "reviewedAt": "2026-01-05T11:30:00.000Z",
    "adminNote": null,
    "publishedAt": "2026-01-05T11:30:00.000Z",
    "categoryId": "category-uuid",
    "instructorId": "user-uuid",
    "category": { "id": "...", "slug": "...", "name": "...", "...": "..." },
    "instructor": {
      "id": "user-uuid",
      "name": "د. سامي حسن",
      "avatar": "https://...",
      "instructorProfile": {
        "rating": 4.7,
        "studentsCount": 3500,
        "...": "..."
      }
    },
    "createdAt": "2025-12-15T10:00:00.000Z",
    "updatedAt": "2026-04-21T10:42:11.000Z"
  }
}
```

**The basic-info, price, and image tabs all read from this single payload.**
Save buttons on each tab call the existing `PATCH /courses/:id` (no separate
endpoint per tab — same body, partial update, only the changed fields).

`PATCH /courses/:id` accepts: `title`, `description`, `longDescription`,
`thumbnail`, `badge`, `whatYouWillLearn`, `prerequisites`, `features`,
`price`, `originalPrice`, `categoryId`. Server-managed (NOT settable here):
`slug`, `status`, `rating`, `studentsCount`, `reviewsCount`,
`durationMinutes`, `totalLessons`, `publishedAt`, `submittedAt`, `reviewedAt`,
`adminNote`, `instructorId`. Status changes go through the workflow endpoints.

---

## GET `/me/instructor/courses/:slug/curriculum`

Roles: `INSTRUCTOR` or `ADMIN`. Modules + lessons tree for the curriculum
tab. **Same data shape as the public `GET /courses/:slug/curriculum`**, but
with the same ownership check as `/me/instructor/courses/:slug` — instructors
see their drafts before they're published.

- **403** if the caller isn't the course owner and isn't an admin.
- **404** if the slug doesn't match a course.

**Response 200**

```json
{
  "success": true,
  "message": "Curriculum retrieved successfully",
  "data": [
    {
      "id": "module-uuid",
      "title": "مقدمة في علم الأشعة",
      "order": 1,
      "durationMinutes": 22,
      "courseId": "course-uuid",
      "lessons": [
        {
          "id": "lesson-uuid-1",
          "title": "تاريخ الأشعة وتطورها",
          "type": "video",
          "order": 1,
          "durationSeconds": 600,
          "isPreview": true,
          "moduleId": "module-uuid"
        },
        {
          "id": "lesson-uuid-2",
          "title": "التعرف على الأجهزة الأساسية",
          "type": "video",
          "order": 2,
          "durationSeconds": 720,
          "isPreview": false,
          "moduleId": "module-uuid"
        },
        {
          "id": "lesson-uuid-3",
          "title": "اختبار قصير: الأساسيات",
          "type": "quiz",
          "order": 3,
          "durationSeconds": 600,
          "isPreview": false,
          "moduleId": "module-uuid"
        }
      ],
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

Use `lesson.type` to render the correct row icon (▶ for `video`, ☰ for
`quiz`) and `durationSeconds` for the "10د" / "12د" badge. `module.lessons`
comes back already ordered by `lesson.order ASC`.

**Module / lesson mutations** are the existing endpoints — they're not new:

| Method   | Path                         | Auth                        | Purpose                               |
| -------- | ---------------------------- | --------------------------- | ------------------------------------- |
| `POST`   | `/courses/:id/modules`       | Instructor (owner) or Admin | "إضافة وحدة جديدة"                    |
| `PATCH`  | `/modules/:id`               | Instructor (owner) or Admin | Rename a module / re-order            |
| `DELETE` | `/modules/:id`               | Instructor (owner) or Admin | Delete a module (cascades to lessons) |
| `POST`   | `/modules/:moduleId/lessons` | Instructor (owner) or Admin | "إضافة درس"                           |
| `PATCH`  | `/lessons/:id`               | Instructor (owner) or Admin | Edit a lesson                         |
| `DELETE` | `/lessons/:id`               | Instructor (owner) or Admin | Soft-delete a lesson                  |

---

## Thumbnail upload

The image tab (الصورة) uploads via a dedicated multipart endpoint. See the
separate [Course Thumbnail Upload API](./course-thumbnail-upload-api.md)
doc for full details — short version:

```
POST /courses/:id/thumbnail   multipart/form-data field "file"
```

Returns the new public URL and updates `Course.thumbnail` in one round-trip.

---

## Cache invalidation (frontend hint)

After any of these actions, invalidate `/me/instructor/dashboard`
**and `/me/instructor/courses`**:

- The instructor posts a reply on a question (changes `pendingQuestions`,
  `pendingQuestionsCount`).
- A new enrollment is granted on one of their courses (changes
  `recentActivity`, KPIs, earnings).
- A new review lands on one of their courses (changes `recentActivity`,
  `kpis.averageRating`, `reviewsCount`).
- Admin approves/rejects one of their courses, or instructor submits/unpublishes
  (changes `statusCounts`).
- Admin updates `instructorRevenueSharePercent` (changes every money figure).
