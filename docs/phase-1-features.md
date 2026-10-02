# Learning engagement, tutor and Notes

The learning workspace now includes section progress/active-time tracking, a configurable test prompt,
question timing, course aptitude/confidence/progress and a chapter tutor with saved conversation history,
feedback, review flags and saved Notes. The subject catalog separates enrolled and available subjects.
Only learning/Notes routes changed; homepage, FAQ and Contact remain unchanged.

Tracking uses a single timer and observer for the active lesson/test. Hidden/unfocused/idle windows do
not count. Saves batch periodically, retry with backoff and deduplicate by UUID. Network failure does not
block studying or grading. Stale-source/invalid events stop retrying until the lesson is reloaded.
No new frontend dependency was added. Answers render as escaped text, never provider-supplied HTML.

The backend controls availability through ENGAGEMENT_ENABLED. Older/disabled deployments retain the
existing subject catalog/course flow. TUTOR_ENABLED independently gates new provider requests; stored
answers, feedback and Notes remain available after tutor generation is disabled. The old sample editor
is no longer the Notes route; Notes now retrieve/save/delete through authenticated backend endpoints.

Backend rollout details and aptitude policy: [PHASE1_FEATURES.md](https://github.com/xdh4uv/vcFastApi/blob/master/PHASE1_FEATURES.md).
Deploy the updated frontend before enabling enrollment enforcement. Apply and verify V4–V6 through
Flyway before enabling engagement; the legacy app database first needs a correctly audited baseline.
Live NIM generation was not used during this change.

Verification: frontend typecheck, lint, production build and five existing regressions pass. Browser
checks used an explicit local SQLite fixture plus stub tutor, covering enrollment, saved levels,
chapter reading UI, tutor conversation, Notes persistence/filtering and backend grading. They do not
establish live provider quality, production deployment success or the Phase 1 p95 performance target.
