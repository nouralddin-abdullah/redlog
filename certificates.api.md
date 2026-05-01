# Certificates API

All authenticated endpoints require the bearer JWT in
`Authorization: Bearer <token>`. All responses are wrapped in
`{ success, message, data }`.

---

## How a certificate is issued

Certificates are **never issued by an explicit API call**. They're created
automatically inside `LessonProgressService` the moment a course transitions
from "in progress" to "complete" — i.e. when `Enrollment.completedAt` flips
from `null` to a date because the user just finished the last lesson (or
passed the last quiz).

- **One certificate per `(userId, courseId)`** — guaranteed by a unique
  constraint.
- **Idempotent** — un-completing then re-completing a course does NOT issue a
  second certificate. The original row is reused.
- **Snapshotted** — `studentName`, `courseTitle`, and `instructorName` are
  copied at issue time. Renaming the user, course, or instructor later does
  NOT mutate any previously-issued certificate.
- **Best-effort** — if certificate issuance fails (e.g. transient DB error),
  the course is still marked complete. The certificate can be reissued the
  next time progress is recomputed because of the idempotency guarantee.

---

## Certificate number format

```
RDLG-YYYY-XXXX-XXXX
```

Example: `RDLG-2026-A4F2-9XK8`

- `RDLG` — fixed prefix.
- `YYYY` — UTC year of issue.
- `XXXX-XXXX` — 8 random hex characters (uppercase) split into two groups for
  legibility.

The verify endpoint accepts the code in any case and trims surrounding
whitespace, so users can paste it loosely.

---

## GET `/me/certificates`

List the current user's certificates, newest first.

**Response 200**

```json
{
  "success": true,
  "message": "Certificates retrieved successfully",
  "data": [
    {
      "id": "9c8b7a6d-1111-2222-3333-444455556666",
      "certificateNumber": "RDLG-2026-A4F2-9XK8",
      "courseId": "course-uuid",
      "studentName": "نور عبدو",
      "courseTitle": "مقدمة في الأشعة",
      "instructorName": "د. سامي حسن",
      "issuedAt": "2026-05-01T10:42:11.000Z",
      "course": {
        "id": "course-uuid",
        "slug": "intro-to-radiology",
        "thumbnail": "https://cdn.example.com/courses/intro.jpg"
      }
    }
  ]
}
```

`studentName`, `courseTitle`, and `instructorName` are the **snapshotted**
values from issue time. The embedded `course.slug` / `course.thumbnail` are
**live** so the frontend can link back to the current course landing page.

---

## GET `/me/certificates/:id`

Get a single certificate owned by the current user.

- **403** if the certificate exists but belongs to another user.
- **404** if the certificate does not exist.

**Response 200** — same shape as one item from the list endpoint above.

---

## GET `/certificates/verify/:code` _(public — no auth)_

Verify a certificate by its printed code. Used by anyone (employer, school,
LinkedIn viewer) to confirm a certificate is authentic. Returns only the
snapshotted public fields — no internal IDs, no `userId`, no `courseId`.

- **404** if the code does not match any certificate.

**Response 200**

```json
{
  "success": true,
  "message": "Certificate is valid",
  "data": {
    "valid": true,
    "certificateNumber": "RDLG-2026-A4F2-9XK8",
    "studentName": "نور عبدو",
    "courseTitle": "مقدمة في الأشعة",
    "instructorName": "د. سامي حسن",
    "issuedAt": "2026-05-01T10:42:11.000Z"
  }
}
```

The code lookup is case-insensitive and tolerates leading/trailing
whitespace, so `rdlg-2026-a4f2-9xk8` and `  RDLG-2026-A4F2-9XK8  ` both work.

---

## What the frontend does

The backend deliberately does NOT generate PDF certificates. The frontend:

1. Renders a certificate page (HTML/CSS, full RTL Arabic support) from the
   `GET /me/certificates/:id` JSON.
2. "Download" button = `window.print()` → user saves as PDF via the browser's
   print dialog.
3. "Share" button copies a verify URL like
   `https://radlog.example.com/verify/RDLG-2026-A4F2-9XK8` to the clipboard.
4. The verify page calls `GET /certificates/verify/:code` and shows
   "✅ Valid certificate" with the snapshotted names — no auth required.

---

## Cache invalidation (frontend hint)

After a `POST /lessons/:id/complete` that flips a course to fully complete,
invalidate `GET /me/certificates` — a new certificate row may have just been
issued.
