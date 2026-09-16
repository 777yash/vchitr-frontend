# Class 10 focused practice

Focused practice covers all 14 Class 10 Mathematics chapters. Each chapter has five concept revision cards and 45 original multiple-choice questions stored in Neon and served by the backend: 70 cards and 630 adaptive questions in total. The existing 70 fixed chapter-test questions and 14 final-test questions remain unchanged. No LLM is called.

Open Learning → Maths → any chapter → **Review concepts & focused practice**. After a chapter test, its result also shows concept feedback and a link to practice weak concepts. Expand a revision card for an explanation, worked example, common mistake and checklist.

All chapters use the same screens and endpoints. Availability comes from published database content; adding these banks requires no frontend runtime change. Evidence, drafts and practice history remain separate for each chapter. Backend CLASS10_CONTENT.md maps all 70 concepts and documents coverage limits. These are finite starter banks, not full textbook exercises or an exam simulator; questions have not received teacher review.

The backend selects up to five fresh questions, prioritizing weak concepts and matching difficulty to previous first-answer evidence. A draft resumes the exact stored questions and answers. After submission, the backend grades the saved snapshot and returns updated concept feedback. Practice history includes its concept focus and difficulty mix; it does not replace official chapter history or count toward final-test eligibility.

Fewer than three distinct answered questions means more evidence is needed. Repeated fixed tests do not inflate this evidence. Difficulty changes gradually, while the student's saved education level remains unchanged. If fewer fresh questions remain, the set is shorter. Once the bank is exhausted, repeated revision is clearly labeled and excluded from new evidence. Course reset clears both kinds of results and derived evidence while keeping level and read markers. All 14 official chapter tests must be submitted to unlock the final; no minimum score is required.

Backend schema 002 and the adaptive API must exist before publishing banks. ADAPTIVE.md documents the selection policy. Publish all banks atomically with `python -m scripts.seed_adaptive --bank all --content-only`, then verify with `python -m scripts.verify_adaptive_db --bank all`. Repeated publication checks immutable content. The existing UI discovers newly published chapters on the next request.

Verified 17 September 2026: 43 backend tests passed, including independently worked answer keys for all 540 new questions, all-chapter isolation, bank exhaustion, reset and final eligibility. Isolated Neon/API checks covered repeated publication, material retrieval, redacted questions, saved drafts, backend grading and separate history for every chapter. Adaptive-only submissions kept the final locked; submitting all 14 official chapter tests unlocked and graded the 14-question final.

All 14 banks were published to the app's vchitr-main database on 17 September 2026. The runtime role can read all content; existing courses, attempts, preferences and read markers were preserved. The deployed backend already exposes the adaptive API.

Browser verification covered Probability's DB revision card, fresh retake, saved draft surviving reload, backend-graded submission, updated feedback and separate history; Statistics formulas and revision cards rendered correctly. The course overview showed all 14 official submissions and the final result. No browser console warnings or errors were observed.
