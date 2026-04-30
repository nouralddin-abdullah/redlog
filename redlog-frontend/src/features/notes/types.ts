export interface LessonNote {
  id: string;
  text: string;
  timestampSeconds: number;
  lessonId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteInput {
  text: string;
  timestampSeconds: number;
}

export interface UpdateNoteInput {
  text?: string;
  timestampSeconds?: number;
}
