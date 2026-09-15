# Class 10 focused practice

Adaptive practice covers Class 10 Real Numbers and Polynomials. Each chapter has five concept revision cards and 45 original multiple-choice questions stored in Neon and served by the backend. Other chapters retain their existing lessons and chapter tests. No LLM is called.

Open Learning → Maths → Real Numbers or Polynomials. The lesson offers focused practice. After a chapter test, its result also shows concept feedback and a link to practice weak concepts. Expand a revision card for an explanation, worked example, common mistake and checklist.

Polynomials uses the same screens and endpoints. Its five concepts cover zeroes, degree/graphs, sum, product/coefficient relations and forming quadratics. Availability comes from the database; adding this chapter requires publishing its bank, without a frontend code change. Evidence and practice history remain separate for each chapter. Graph questions describe contacts in text, and this starter bank has not received teacher review.

Polynomials verified 15 September 2026: 38 backend tests passed, including all 45 independent answer keys and cross-chapter isolation. Isolated Neon/API tests covered repeat publishing, immutable content, baseline feedback, concurrent starts, drafts, grading, fresh retakes and final eligibility. Browser checks confirmed the chapter link, DB revision material, submission, feedback and difficulty progression with no console errors. Content was published to the app database after confirming the deployed adaptive API exists; existing course documents and student records were preserved. No new frontend runtime deployment is required for this chapter.

The backend selects up to five fresh questions, prioritizing weak concepts and matching difficulty to previous first-answer evidence. A draft resumes the exact stored questions and answers. After submission, the backend grades the saved snapshot and returns updated concept feedback. Practice history includes its concept focus and difficulty mix; it does not replace official chapter history or count toward final-test eligibility.

Fewer than three distinct answered questions means more evidence is needed. Repeated fixed tests do not inflate this evidence. Difficulty changes gradually, while the student's saved education level remains unchanged. If fewer fresh questions remain, the set is shorter. Once the bank is exhausted, repeated revision is clearly labeled and excluded from new evidence. Course reset clears both kinds of results and derived evidence while keeping level and read markers.

Deploy the backend migration and API before this frontend. Backend `ADAPTIVE.md` documents the schema, seed commands and selection policy. The starter bank has arithmetic regression checks but has not received teacher review. These signals are practice guidance, not a validated measure of mastery.

Verification: frontend unit tests, TypeScript, ESLint and production build; backend unit tests; isolated Neon checks for concurrent starts, reset/submission races, ownership, grading, draft recovery, question freshness and final-test eligibility.

Verified 15 September 2026: 34 backend tests and 5 frontend tests passed. Browser checks covered concept revision, a saved draft surviving reload, server-graded submission, separate history, a fresh retake and mobile layout without horizontal overflow. No browser console warnings or errors were observed. The migration and bank were published to the application's vchitr-main database on its development branch, with existing attempt payloads preserved and runtime-role access checked. Application deployment remains a separate step.
