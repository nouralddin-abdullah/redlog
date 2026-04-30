/**
 * Display helpers for lesson attachments.
 * The API returns `fileSizeBytes` as a string (potentially large), so we
 * always parse defensively.
 */

export function formatBytes(input: string | number | null | undefined): string {
  const n = typeof input === 'string' ? Number.parseInt(input, 10) : input ?? 0;
  if (!Number.isFinite(n) || n <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(k)));
  const value = n / k ** i;
  const rounded = value < 10 ? value.toFixed(1) : Math.round(value).toString();
  return `${rounded} ${units[i]}`;
}

const MIME_LABEL: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/zip': 'ZIP',
  'application/x-zip-compressed': 'ZIP',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  'image/png': 'PNG',
  'image/jpeg': 'JPG',
  'image/gif': 'GIF',
  'image/webp': 'WEBP',
  'image/svg+xml': 'SVG',
  'video/mp4': 'MP4',
  'audio/mpeg': 'MP3',
  'text/plain': 'TXT',
  'text/csv': 'CSV',
};

export function fileLabel(mimeType: string, fileUrl?: string): string {
  if (MIME_LABEL[mimeType]) return MIME_LABEL[mimeType]!;
  if (fileUrl) {
    const m = fileUrl.match(/\.([a-z0-9]+)(?:\?|#|$)/i);
    if (m && m[1]) return m[1].toUpperCase();
  }
  return 'FILE';
}
