# Lesson Attachments API

Powers the **"المرفقات"** section of the instructor lesson form (the "إضافة
ملف PDF أو شريحة" button) plus the public download list students see under
the player.

All authenticated endpoints require the bearer JWT in
`Authorization: Bearer <token>`. All responses are wrapped in
`{ success, message, data }`.

> ⚠️ **Endpoint name correction.** The base path is
> **`/lessons/:lessonId/attachments`** (collection) and
> **`/lesson-attachments/:id`** (single item). It is **NOT**
> `/lessons/:id/file` — that path doesn't exist. Update any frontend
> placeholder code that references the old guess.

---

## Quick reference

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/lessons/:lessonId/attachments` | bearer JWT | List attachments for a lesson |
| `POST` | `/lessons/:lessonId/attachments` | INSTRUCTOR (owner) or ADMIN | Upload a new attachment (multipart) |
| `PATCH` | `/lesson-attachments/:id` | INSTRUCTOR (owner) or ADMIN | Rename an attachment |
| `DELETE` | `/lesson-attachments/:id` | INSTRUCTOR (owner) or ADMIN | Delete an attachment |

The list is **also embedded** in the lesson detail response — `GET
/lessons/:id` returns `data.attachments[]` with the same shape — so the
frontend doesn't need a separate call to render the existing list. Only
call `GET /lessons/:lessonId/attachments` when you want a fresh fetch
after an upload/delete.

---

## GET `/lessons/:lessonId/attachments`

| Param | Where | Type |
|---|---|---|
| `lessonId` | path | UUID |

### Response 200

```json
{
  "success": true,
  "message": "Attachments retrieved successfully",
  "data": [
    {
      "id": "c1dbc7d4-1ba0-4a70-8802-2fa022089689",
      "title": "ملخص الوحدة الأولى",
      "fileUrl": "https://pub-2da766ccb48c485895ae36b58be35142.r2.dev/lesson-attachments/<lessonId>/<timestamp>-<filename>",
      "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "fileSizeBytes": 17974,
      "createdAt": "2026-04-30T16:24:20.244Z"
    }
  ]
}
```

`fileSizeBytes` may come back as a JSON string (TypeORM returns Postgres
`bigint` as string) — coerce with `Number(...)` on the client before
formatting. Same convention as money fields.

`fileUrl` is a **public, permanent CDN URL** — paste directly into an
`<a href="...">` tag. No signing required.

---

## POST `/lessons/:lessonId/attachments` (multipart)

The button on the form should hit this endpoint with `multipart/form-data`.

| | |
|---|---|
| **Auth** | INSTRUCTOR (course owner) or ADMIN |
| **Content-Type** | `multipart/form-data` |
| **Form fields** | `file` (the file blob), `title` (string, 1–200 chars) |
| **Max size** | 50 MB |
| **Allowed MIME** | PDFs, Office docs (DOCX/XLSX/PPTX), MS Excel/PowerPoint, ZIP/RAR/7z/TAR/GZIP, JSON, plain text / CSV / Markdown, any `image/*`, any `audio/*`. Anything else → 400. |

### Errors

- **400** — file missing, > 50 MB, or wrong MIME type. Also if `title` is
  missing/empty.
- **403** — caller isn't the course owner and isn't admin.
- **404** — lesson not found.

### Response 200

```json
{
  "success": true,
  "message": "Attachment created successfully",
  "data": {
    "id": "new-attachment-uuid",
    "title": "ملخص الوحدة الأولى",
    "fileUrl": "https://pub-2da766ccb48c485895ae36b58be35142.r2.dev/lesson-attachments/<lessonId>/1714560000000-cleaned-filename.docx",
    "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "fileSizeBytes": 17974,
    "createdAt": "2026-05-02T11:30:00.000Z"
  }
}
```

The full upload happens in one round-trip — by the time you get the 200,
the file is already in object storage and the row is in the DB.

### Frontend snippet

```ts
async function uploadAttachment(
  lessonId: string,
  file: File,
  title: string,
): Promise<LessonAttachment> {
  const form = new FormData();
  form.append('file', file);
  form.append('title', title);

  const res = await fetch(`/api/lessons/${lessonId}/attachments`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}` },
    body: form,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message ?? 'Upload failed');
  return json.data;
}
```

> Don't set `Content-Type` manually — the browser fills in the multipart
> boundary automatically when you pass a `FormData` body.

---

## PATCH `/lesson-attachments/:id`

Rename an attachment. The file itself is immutable — to "replace" it,
delete the old attachment and POST a new one.

| Param | Where | Type |
|---|---|---|
| `id` | path | UUID (the **attachment** id, not the lesson id) |

### Request body

```json
{ "title": "اسم جديد للملف" }
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | 1–200 chars |

### Errors

- **400** validation, **403** not owner/admin, **404** attachment missing.

### Response 200

Same shape as the create response, with the updated `title`.

---

## DELETE `/lesson-attachments/:id`

Hard-delete the attachment row + remove the file from storage.

| Param | Where | Type |
|---|---|---|
| `id` | path | UUID (attachment id) |

### Errors

- **403** not owner/admin, **404** attachment missing.

### Response 200

```json
{ "success": true, "message": "Attachment deleted successfully" }
```

---

## Storage layout

Files are written to:

```
lesson-attachments/{lessonId}/{timestampMs}-{safeOriginalName}
```

`safeOriginalName` is sanitized (`[a-zA-Z0-9._-]` only, capped at 100
chars). Bucket comes from `STORAGE_BUCKET`, public URL prefix from
`STORAGE_PUBLIC_URL` — same as every other upload in the system.

---

## Cache invalidation (frontend hint)

After a successful upload, rename, or delete, invalidate:

- `GET /lessons/:id` — its embedded `attachments` array is stale
- `GET /lessons/:lessonId/attachments` — same data, separate cache key
- `GET /me/instructor/courses/:slug` — only if your UI shows attachment
  counts at the course header (it currently doesn't)

The lesson's `durationSeconds`, module duration, and course aggregates are
**not** affected by attachment mutations.
