# Radlog Seed Data

ملفات البيانات الأولية لتعبئة قاعدة البيانات.

## ملاحظات مهمة

### 1. ترتيب الإدراج (Insert Order)
عشان الـ FK constraints تتحقق صح:
1. `categories.json` أولاً
2. `instructors.json` (هم Users بـ `role = INSTRUCTOR`)
3. `courses.json` (يعتمد على categories + instructors)

### 2. الحقول المحسوبة (Derived Fields)
الحقول دي **محسوبة** من جداول تانية، لكن مدرجة هنا كـ initial cached values:
- `rating` — متوسط الـ Reviews
- `studentsCount` — عدد الـ Enrollments
- `reviewsCount` — عدد الـ Reviews
- `totalLessons` — عدد الـ Lessons في كل الـ Modules

تقدر تحدثها بـ trigger أو scheduled job بدلاً من تخزينها يدوي.

### 3. الـ Thumbnails
الـ URLs في الـ JSON هي placeholders. استبدلها بالصور الحقيقية من الـ CDN.

### 4. Instructors كـ Users
الـ instructors في الفايل ده هما Users عاديين بـ `role = "INSTRUCTOR"`. لما تدرجهم في جدول `users`:
- ولّد `password` hash لكل واحد (الـ password placeholder)
- ضع `isEmailVerified = true`
- `onboarding = true` (لأنهم مكتملين البيانات)

### 5. الألوان (color1 / color2)
انتقلت من `Course` إلى `Category` — كل كورس يرث الـ accent colors من الـ category بتاعتها.

### 6. السعر
السعر بالجنيه المصري (EGP) — عدّله حسب العملة المعتمدة عندك.
