# Lesson Video Upload API (Bunny Stream, direct-to-CDN)

The instructor edit page can either:

1. **Old flow** — instructor opens Bunny dashboard, uploads a video manually,
   copies the GUID, pastes it into `bunnyVideoId` via `PATCH /lessons/:id`.
2. **New flow** (this doc) — instructor selects a file in our UI, the file
   uploads **directly from the browser to Bunny Stream** via the TUS
   resumable-upload protocol. No copy-paste, no Bunny dashboard trip, and
   the file bytes never touch our backend.

The browser **never sees the Bunny API key**. We only hand it short-lived,
single-video signed credentials.

---

## The flow at a glance

```
[browser]                                       [redlog backend]                [bunny stream]
   │                                                  │                              │
   │  1. POST /lessons/:id/video/upload               │                              │
   ├─────────────────────────────────────────────────▶│                              │
   │                                                  │  POST /library/{lib}/videos  │
   │                                                  ├─────────────────────────────▶│
   │                                                  │  ◀─ { guid }                 │
   │                                                  │                              │
   │                                                  │  set lesson.bunnyVideoId     │
   │                                                  │  set lesson.thumbnailUrl     │
   │                                                  │  sign TUS credentials        │
   │                                                  │                              │
   │  ◀─ { tusEndpoint, signature, expirationTime, ... }                             │
   │                                                  │                              │
   │  2. tus-js-client uploads file directly to Bunny                                │
   ├────────────────────────────────────────────────────────────────────────────────▶│
   │  ◀─ progress events                                                             │
   │                                                                                 │
   │  3. (every ~5s) GET /lessons/:id/video/status    │                              │
   ├─────────────────────────────────────────────────▶│  GET /library/.../videos/X   │
   │                                                  ├─────────────────────────────▶│
   │                                                  │  ◀─ { length, status }       │
   │                                                  │                              │
   │                                                  │  if length>0, sync           │
   │                                                  │  lesson.durationSeconds and  │
   │                                                  │  recompute module/course     │
   │                                                  │  duration totals             │
   │                                                  │                              │
   │  ◀─ { isReady, lessonDurationSeconds, ... }                                     │
   │                                                                                 │
   │  4. when isReady === true → stop polling, refresh the lesson form               │
```

---

## POST `/lessons/:id/video/upload`

**Auth:** `INSTRUCTOR` (course owner) or `ADMIN`. Bearer JWT required.

Creates a brand-new empty video on Bunny Stream, attaches its GUID to the
lesson (replacing any prior `bunnyVideoId`), and returns short-lived TUS
credentials.

### Request

No body. Lesson `:id` is the path param.

### Errors

- **403** — caller isn't the course owner and isn't admin.
- **404** — lesson not found.
- **502** — Bunny API unreachable / returned an error (rare).
- **503** — backend missing `BUNNY_STREAM_LIBRARY_ID` or
  `BUNNY_STREAM_API_KEY` env vars.

### Response 200

```json
{
  "success": true,
  "message": "Video upload credentials issued",
  "data": {
    "tusEndpoint": "https://video.bunnycdn.com/tusupload",
    "libraryId": "12345",
    "videoId": "98f9e1a3-1234-5678-9abc-def012345678",
    "signature": "f9c8a4e1...",
    "expirationTime": 1714563600,
    "expiresAt": "2026-05-02T10:00:00.000Z",
    "bunnyVideoId": "98f9e1a3-1234-5678-9abc-def012345678"
  }
}
```

| Field | Notes |
|---|---|
| `tusEndpoint` | Always `https://video.bunnycdn.com/tusupload` — Bunny's TUS server. |
| `libraryId` | String form of the library ID, used as a TUS upload header. |
| `videoId` | The freshly-created Bunny GUID — also already saved on the lesson as `bunnyVideoId`. |
| `signature` | `SHA256(libraryId + apiKey + expirationTime + videoId)`. Sent as `AuthorizationSignature` upload header. |
| `expirationTime` | Unix seconds. Default TTL is **1 hour**. Sent as `AuthorizationExpire` upload header. |
| `expiresAt` | Same moment as `expirationTime`, ISO format — for client-side TTL display / decisions. |
| `bunnyVideoId` | Echo of `videoId`, named to match the field on the lesson. |

### Side effects

- Bunny: a new empty video row is created in your library (visible on Bunny's
  dashboard with the lesson title).
- DB: `lesson.bunnyVideoId` is overwritten with the new GUID and
  `lesson.thumbnailUrl` is set to the deterministic Bunny CDN thumbnail URL
  (`https://{cdnHostname}/{guid}/thumbnail.jpg`).
- `lesson.durationSeconds` is **NOT** touched — the new video is empty and
  has length=0 until the upload completes.

### Notes

- If the lesson already had a `bunnyVideoId` pointing at an old video, that
  old video stays on Bunny (orphan). Add a cleanup job later if storage
  costs become an issue.
- Re-calling this endpoint cancels any in-flight upload semantically (the
  lesson now points at a new GUID), but Bunny will still accept bytes for
  the old GUID. The frontend should abort any pending tus.Upload before
  starting a new one.
- If the user abandons the flow (closes the tab), the lesson keeps the
  empty Bunny GUID. Re-calling `/video/upload` on the same lesson creates a
  fresh empty video and replaces the GUID — no manual cleanup needed.

---

## Frontend usage with `tus-js-client`

Install once: `npm i tus-js-client`.

```ts
import * as tus from 'tus-js-client';

async function uploadLessonVideo(lessonId: string, file: File) {
  // 1. ask backend for credentials
  const res = await fetch(`/api/lessons/${lessonId}/video/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}` },
  });
  const { data: c } = await res.json();

  // 2. start TUS upload directly to Bunny
  return new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: c.tusEndpoint,
      retryDelays: [0, 3000, 5000, 10000, 20000, 60000, 60000],
      headers: {
        AuthorizationSignature: c.signature,
        AuthorizationExpire: String(c.expirationTime),
        VideoId: c.videoId,
        LibraryId: c.libraryId,
      },
      metadata: {
        filetype: file.type,
        title: file.name,
      },
      onError: reject,
      onProgress: (bytesUploaded, bytesTotal) => {
        const pct = ((bytesUploaded / bytesTotal) * 100).toFixed(1);
        console.log(`${pct}% uploaded`);
      },
      onSuccess: () => resolve(),
    });
    upload.start();
  });
}
```

After `onSuccess`, kick off polling for encoding status (next section).

---

## GET `/lessons/:id/video/status`

**Auth:** `INSTRUCTOR` (owner) or `ADMIN`. Bearer JWT required.

Polls the upload + encoding status of this lesson's Bunny video. When the
video transitions to status ≥ 3 (finished), this same call also auto-syncs
`lesson.durationSeconds` from Bunny and recomputes `Module.durationMinutes`
+ `Course.durationMinutes`. Frontend doesn't have to do a separate refresh.

### Errors

- **403** — caller isn't the course owner and isn't admin.
- **404** — lesson missing, or no `bunnyVideoId` is attached yet (call
  `POST /lessons/:id/video/upload` first).
- **502** — Bunny API unreachable.

### Response 200

```json
{
  "success": true,
  "message": "Video status retrieved",
  "data": {
    "bunnyVideoId": "98f9e1a3-1234-5678-9abc-def012345678",
    "status": 4,
    "statusLabel": "resolution-finished",
    "isReady": true,
    "lengthSeconds": 720,
    "width": 1920,
    "height": 1080,
    "lessonDurationSeconds": 720,
    "thumbnailUrl": "https://vz-...b-cdn.net/98f9e1a3-1234-5678-9abc-def012345678/thumbnail.jpg"
  }
}
```

| Field | Notes |
|---|---|
| `status` | Raw Bunny status code: `0=queued`, `1=processing`, `2=encoding`, `3=finished`, `4=resolution-finished`, `5=failed`. |
| `statusLabel` | Human-readable form of `status`. |
| `isReady` | `status >= 3 && status <= 4`. Frontend stops polling when this flips true. |
| `lengthSeconds` | Reported by Bunny. **0** while encoding. |
| `width` / `height` | Final video dimensions. **0** while encoding. |
| `lessonDurationSeconds` | The DB value AFTER this poll's auto-sync. Should equal `lengthSeconds` once `isReady`. |
| `thumbnailUrl` | The current `lesson.thumbnailUrl`. Bunny generates the file a few seconds after upload at the deterministic path. |

### Recommended polling cadence

- After `tus.Upload.onSuccess`, start polling at **5 s intervals**.
- Stop when `isReady === true` OR `status === 5` (failed).
- Cap at ~60 polls (5 minutes) and show a "still encoding, check back later"
  message if not ready by then. Most short videos finish in well under a
  minute.

### Side effects

- DB: if Bunny's `length > 0` and the lesson's stored duration is stale,
  `lesson.durationSeconds` is updated and `Module.durationMinutes` +
  `Course.durationMinutes` are recomputed.
- No DB write happens on a poll where length is still 0 (avoid noisy churn).

---

## Why this design

**Why TUS (not direct PUT to Bunny):** TUS gives resumable uploads — if the
user's connection drops at 80%, the upload picks up where it left off
instead of starting over. Big wins on long videos and flaky mobile
connections.

**Why short-lived credentials:** The signed token is single-purpose
(one specific video, ≤ 1 hour). A leaked token can't be used to upload to
any other video, and it's useless after expiry.

**Why we set `bunnyVideoId` on the lesson up-front, not after upload:** the
GUID is the only way to track an in-flight upload. Saving it immediately
means the same lesson edit page can show "currently uploading…" if the user
refreshes mid-flow. The trade-off is that an abandoned upload leaves a
broken pointer — fixed by re-calling `/video/upload` on the same lesson,
which generates a fresh GUID.

**Why backend polls for status (not Bunny webhooks):** Bunny webhooks
require a publicly reachable HTTPS endpoint and per-event signature
verification — more setup. Polling from an authenticated browser tab is
simpler, cheap (one HTTP call per 5 s), and works in dev without ngrok.
Add webhooks later if encoding lag becomes annoying for long videos.

---

## Required env vars

Both endpoints in this doc require:

- `BUNNY_STREAM_LIBRARY_ID` — your Bunny Stream library ID (numeric, from
  Bunny dashboard).
- `BUNNY_STREAM_API_KEY` — the **Stream API key** from the library
  settings. **NOT** the token-auth-key (that's only for embed signing).
- `BUNNY_STREAM_CDN_HOSTNAME` — for the deterministic thumbnail URL.

Without these, both endpoints return **503 Service Unavailable** with a
clear message naming the missing variable.

---

## Cache invalidation (frontend hint)

After a successful upload + the first `isReady === true` status poll,
invalidate:

- `GET /lessons/:id` (lesson detail — `bunnyVideoId` / `thumbnailUrl` /
  `durationSeconds` may all have changed)
- `GET /me/instructor/courses/:slug/curriculum` (lesson chips show
  duration)
- `GET /me/instructor/courses/:slug` (course header chips —
  `totalLessons` / `durationMinutes`)
- `GET /me/instructor/courses` (the table — `durationMinutes` cell)
