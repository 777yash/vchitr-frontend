# Class 10 learning pilot

## Scope and sources

Learning → Maths → study level → High school → Class 10 course → chapter material → chapter practice → review → final course test.

The pilot includes all 14 chapter headings in the NCERT Class X Mathematics sequence. Each chapter has a short original explanation, a worked example, a common mistake and five original multiple-choice questions. The final test has 14 separate questions, one per chapter. This is starter coverage, not a replacement for the textbook, a full curriculum treatment, or a board-exam simulation.

References consulted on 10 September 2026:

- [NCERT contents](https://ncert.nic.in/textbook/pdf/jemh1ps.pdf): chapter sequence. The indexed contents are marked 2025–26; the fetched Polynomials chapter is marked 2026–27. Do not represent this pilot as an audited exam-year syllabus.
- [NCERT Polynomials](https://ncert.nic.in/textbook/pdf/jemh102.pdf): zeroes and coefficient relationships.
- [IIT Kanpur SATHEE: Real Numbers](https://sathee.iitk.ac.in/ncert-books/class-10/nb-math-10/math-10-chapter-01-real-numbers/): prime factorisation and irrationality.
- [IIT Kanpur SATHEE: Arithmetic Progressions](https://sathee.iitk.ac.in/ncert-books/class-10/nb-math-10/math-10-chapter-05-arithmetic-progressions/): AP terms and sums.

Each lesson links directly to its NCERT chapter PDF. NCERT PDF retrieval was intermittent during research. Mathematical explanations and test questions are newly written, not copied exercises. No NCERT affiliation is implied. A teacher should review depth and syllabus coverage before a classroom rollout.

## Saved learning flow

Home → Learning → subject. The backend looks up the signed-in user's subject preference. The first visit prompts for a level and stores the selection in Neon. Later visits retrieve the corresponding course immediately. Profile → Learning preferences changes the level for that subject. Changing levels preserves the user's previous course results.

Only High school / Class 10 Maths has published content initially. Other levels are shown as coming soon and cannot be selected. Math, Maths and Mathematics route to the same subject. Selected levels are no longer controlled by query parameters; chapter and study/test view remain addressable in the URL.

Every course, chapter and test opening fetches the backend, which queries PostgreSQL. There is no bundled coursework, question-bank fallback or browser-local grading. Lessons remain short original notes with NCERT references, not the full textbook.

## Tests, results and reset

- Start a test to create a server-issued attempt with an immutable question snapshot. The browser receives question text/options, without keys or explanations.
- Save draft stores partial answers in the account; save before leaving to resume on another device. Submission saves and grades all answers. Draft revisions prevent stale devices from overwriting newer saves.
- The server grades one point per correct answer. No time limit or negative marking. It rejects missing/invalid answers and client-supplied scores. Identical submission retries return the same result.
- Review shows selected answers, correct answers, explanations, latest score, best score and history. Fixed-question retakes preserve earlier results. Short-test feedback is a practice signal, not validated mastery.
- The final contains 14 separate questions, one per chapter. It unlocks after every distinct chapter has a submitted test, regardless of score. Eligibility is enforced by the backend when opening, starting and submitting the final.
- The course overview has a confirmed reset action. It deletes that user's drafts, attempts and scores for that course and relocks the final. Read markers, subject preference, other users and other courses remain intact. Stale attempt IDs cannot restore deleted results.
- Previous browser-only pilot scores are not imported as trusted server results.

## Backend and storage

The backend repository owns `data/ncert-maths-10-v1.json`, the versioned seed source. Runtime requests retrieve its published copy from Neon.

Four tables in the existing modules schema:

| Table | Stores |
| --- | --- |
| learning_courses | Course ID, subject, level, complete lesson and question-bank document |
| learning_preferences | Selected level per user and subject |
| learning_progress | Read markers per user and course |
| learning_attempts | Question snapshots, answers, revisions, server scores and timestamps |

All learning endpoints require bearer authentication and scope preferences/results to the authenticated user ID. Successful responses use `Cache-Control: no-store`. Database failures surface errors with retry controls. No credentials are shipped to the frontend.

The configured `vchitr-main` database lives on the Neon branch named `development`; the default branch named `production` is a different database environment. Backend `LEARNING.md` documents the exact migration, role prerequisite, API contract and seed commands. Deploy the matching backend before the frontend.

## Later LLM integration

The level remains curriculum scope; weak chapter performance does not change a student's school level. A future generator can select recent missed concepts and create a validated question snapshot within the chosen chapter and level. Keep the current server-owned attempt IDs, ownership checks, snapshot grading, idempotent submission and final coverage rules. Validate generated math and schema before publishing, with the fixed bank available as a fallback. No LLM calls are implemented in this release.

## Loading performance

Session verification is shared by Navigation and RequireAuth: one in-flight request, 60-second memory reuse, and invalidation on token change/logout. Failed validation remains retryable. Every protected backend request still authenticates the user. A cached display name alone never counts as verified authentication.

Home preloads the public subject catalog on pointer hover, keyboard focus and click so it can run alongside session verification. Catalog metadata is reused for 30 seconds in memory. Coursework, saved levels and results are still retrieved fresh on each resource opening.

Maths requests `GET /learning/subjects/Maths?include_course=true` for the saved level and course overview together. Older backends can ignore this optional flag; the frontend then uses the existing separate course request. Deploying the matching backend enables both the combined response and connection pooling.

## Verification checks

Backend: `python -m unittest discover -s tests -v` — 20 regressions cover auth, preferences, level switching, ownership, key redaction, saved drafts, snapshots, grading, retakes, resets, final eligibility and the 14-chapter/84-question seed.

Frontend: `node --experimental-strip-types --test tests/learning.test.mjs`, TypeScript, ESLint and production build. The existing Vite bundle-size warning remains.

PostgreSQL: migration and repeat seed tested on an isolated Neon branch; verified document equality, four tables, foreign keys and the unique active-draft index. Real local-backend HTTP checks against that branch cover authentication, concurrent draft creation, cross-account isolation, draft revision conflicts, 13/14 locked versus 14/14 unlocked final, grading, idempotent submission, retakes and course reset. Disposable test accounts remain only on the expiring verification branch.

To try the feature, run the backend and frontend with matching API configuration, sign in, and choose Learning → Maths. Select High school once. Reopen Maths or visit Profile → Learning preferences to confirm it was saved.

Release verification (13 September 2026): published all 14 chapters and 84 questions to the app's `vchitr-main` database and verified retrieval using its runtime role. No test attempts were added there. Browser checks against the isolated branch confirmed remembered level, saved draft after reload, server grading, retake history with separate latest/best scores, Profile preferences and reset confirmation/cancel. No browser console errors were recorded during the flow.
