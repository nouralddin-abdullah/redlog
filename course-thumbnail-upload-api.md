# Course Thumbnail Upload API

Powers the **الصورة** tab on the instructor course-edit page. One endpoint —
the frontend uploads the image as multipart, the backend stores it in object
storage (S3 or R2 depending on `STORAGE_PROVIDER`) and updates
`Course.thumbnail` to the resulting public URL in the same round-trip.

---

## POST `/courses/:id/thumbnail`

| | |
|---|---|
| **Auth** | `INSTRUCTOR` or `ADMIN`. Owner-only (admins bypass). |
| **Content-Type** | `multipart/form-data` |
| **File field** | `file` |
| **Max size** | 5 MB |
| **Allowed MIME** | `image/jpeg`, `image/png`, `image/gif`, `image/webp` |

### Errors

- **400** — file missing, too large, or wrong MIME type.
- **403** — caller isn't the course owner and isn't an admin.
- **404** — `:id` doesn't match a course.

### Response 200

```json
{
  "success": true,
  "message": "Thumbnail uploaded successfully",
  "data": {
    "thumbnail": "https://cdn.example.com/course-thumbnails/<courseId>-1714560000000-thumbnail.jpg"
  }
}
```

The `thumbnail` field is the **public CDN URL** — paste it directly into an
`<img src="…">` tag. `Course.thumbnail` has already been persisted by the
time the response is returned, so a follow-up `GET /me/instructor/courses/:slug`
will reflect the new URL.

---

## Recommended client behavior

1. **Pre-validate on the client** before posting — saves a round-trip on
   obviously-wrong files.

   - Aspect ratio: 16:9 (e.g. 1920×1080)
   - Min resolution: 1280×720
   - Format: JPG or PNG (WEBP also accepted)
   - Avoid heavy text / huge logos that the catalog grid would crop
   - Avoid third-party brand marks

2. **Show optimistic preview** during upload using
   `URL.createObjectURL(file)` then swap to the returned URL on success.

3. **No need to call `PATCH /courses/:id` afterwards** — the upload endpoint
   already saved `Course.thumbnail`. (Useful if the user typed a different
   thumbnail URL manually in some other field — that's an edge case, just
   PATCH it normally.)

---

## Storage layout

Files are written to:

```
course-thumbnails/{courseId}-{timestampMs}-{safeOriginalName}
```

- `safeOriginalName` is sanitized: only `[a-zA-Z0-9._-]` survives, capped at
  100 chars. Used to keep filenames human-debuggable in the bucket.
- The bucket is whichever `STORAGE_BUCKET` env var points to; the public URL
  prefix comes from `STORAGE_PUBLIC_URL`.
- **The previous thumbnail file is NOT deleted** when a new one is uploaded
  — keeps the upload path simple and lets a bulk-cleanup job handle orphans
  later if storage costs become an issue. The `Course.thumbnail` column
  always points at the latest one, so users never see the old file.

---

## Why a dedicated endpoint instead of just PATCHing `thumbnail`

`PATCH /courses/:id` accepts a `thumbnail` URL string — but it expects the
URL to already exist somewhere accessible. Without this endpoint the
frontend would have to either:

- Call S3/R2 directly with a presigned URL (more rope to misuse), or
- Round-trip through some other upload service.

This endpoint hides storage details from the frontend and matches the same
pattern already used by `POST /api/quiz/images` and the lesson-attachment
upload.

---

## Cache invalidation (frontend hint)

After a successful upload, invalidate:

- `GET /me/instructor/courses/:slug` (the course detail you're editing)
- `GET /me/instructor/courses` (the table — its row thumbnail will be stale)
- `GET /courses/:slug` (the public catalog detail, if the course is
  published)
