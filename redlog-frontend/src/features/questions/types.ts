export interface QuestionUser {
  id: string;
  name: string;
  avatar: string | null;
}

export interface QuestionReply {
  id: string;
  text: string;
  questionId: string;
  userId: string;
  user: QuestionUser;
  createdAt: string;
  updatedAt: string;
}

export interface LessonQuestion {
  id: string;
  text: string;
  likesCount: number;
  repliesCount: number;
  /** Only meaningful for authenticated users; defaults to false otherwise. */
  likedByMe: boolean;
  lessonId: string;
  userId: string;
  user: QuestionUser;
  /** Embedded array — single level, no nesting. */
  replies: QuestionReply[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionInput {
  text: string;
}
export type UpdateQuestionInput = CreateQuestionInput;
export type CreateReplyInput = CreateQuestionInput;
export type UpdateReplyInput = CreateQuestionInput;

export interface LikeResponse {
  success: true;
  liked: boolean;
}
