export interface LessonAttachment {
  id: string;
  title: string;
  fileUrl: string;
  mimeType: string;
  /** Returned as a string by the API; we coerce in helpers when displaying. */
  fileSizeBytes: string;
  createdAt: string;
}
