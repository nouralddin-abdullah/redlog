/**
 * Types for the Certificates API. Mirrors `certificates.api.md`.
 *
 * Snapshot semantics: `studentName`, `courseTitle`, and `instructorName` are
 * frozen at issue time and never change, even if the underlying user / course /
 * instructor records are renamed later. The embedded `course` object is live —
 * use it for linking back to the course landing page.
 */

export interface CertificateCourse {
  id: string;
  slug: string;
  thumbnail: string | null;
}

export interface Certificate {
  id: string;
  /** Format: `RDLG-YYYY-XXXX-XXXX` (uppercase hex). */
  certificateNumber: string;
  courseId: string;
  /** Snapshot — name as it was at issue time. */
  studentName: string;
  /** Snapshot — title as it was at issue time. */
  courseTitle: string;
  /** Snapshot — instructor name as it was at issue time. */
  instructorName: string;
  issuedAt: string;
  course: CertificateCourse;
}

/**
 * Response from the public verify endpoint. No internal IDs, no `userId` or
 * `courseId` — only the snapshotted public fields plus the `valid` flag.
 */
export interface CertificateVerifyResult {
  valid: true;
  certificateNumber: string;
  studentName: string;
  courseTitle: string;
  instructorName: string;
  issuedAt: string;
}
