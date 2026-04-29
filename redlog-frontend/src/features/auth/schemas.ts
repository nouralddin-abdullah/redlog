import { z } from 'zod';

const email = z
  .string()
  .min(1, 'البريد الإلكتروني مطلوب')
  .email('صيغة البريد الإلكتروني غير صحيحة');

const password = z
  .string()
  .min(8, 'كلمة السر يجب أن تكون 8 أحرف على الأقل')
  .max(50, 'كلمة السر يجب ألا تتجاوز 50 حرفاً');

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'كلمة السر مطلوبة'),
  remember: z.boolean().optional(),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  name: z
    .string()
    .min(2, 'الاسم قصير جداً')
    .max(100, 'الاسم طويل جداً')
    .regex(/^[\p{L}\s'.-]+$/u, 'يحتوي الاسم على أحرف غير مسموحة'),
  email,
  password,
  country: z
    .string()
    .length(2, 'استخدم رمز ISO من حرفين')
    .regex(/^[A-Za-z]{2}$/, 'رمز الدولة غير صحيح')
    .optional()
    .or(z.literal('')),
  timezone: z
    .string()
    .min(1)
    .optional()
    .or(z.literal('')),
  avatar: z.instanceof(File).nullable().optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const forgotPasswordSchema = z.object({
  email,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
