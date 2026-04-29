export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  /** We intentionally don't use icon / colorPrimary / colorSecondary in the UI,
   *  but we type them so future endpoints stay aligned. */
  icon: string | null;
  colorPrimary: string | null;
  colorSecondary: string | null;
  createdAt: string;
  updatedAt: string;
}
