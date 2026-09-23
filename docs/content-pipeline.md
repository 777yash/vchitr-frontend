# Adaptive chapter explanations

Lessons now consume backend-selected explanation depth. There is no manual tier control. Education level remains a separate profile preference.

The backend reuses distinct first-answer evidence across a chapter's concepts. With fewer than ten counted answers or incomplete concept coverage it serves Default. With sufficient evidence: below 60% selects Beginner, 60–79% Default, and 80%+ Advanced. Repeated questions do not add evidence. Course-result reset returns selection to Default.

The existing lesson endpoint returns a contentVariant with requested/served tiers, selection evidence and either a saved generated lesson or a base-content fallback. An enabled backend serves Neon content on every request; the frontend never invokes an LLM. Missing/invalid/outdated variants show the original lesson with an explanatory notice. Old or disabled backends continue to render original lessons.

Adapted lessons render plain-text sections, examples, self-check prompts, takeaways, section links, estimated reading time and teacher-review status. React escapes provider text. Existing read markers, chapter practice, final eligibility and reset flows are preserved.

NVIDIA NIM/OpenRouter, OpenAI and Anthropic use backend-only provider adapters. The backend's CONTENT_PIPELINE.md documents configuration, publication and migration. CONTENT_PIPELINE_ENABLED must remain false until schema 003 is applied. The browser receives neither provider credentials nor generation controls.

This implements the lesson-generation pipeline, not tutor chat, generated tests, section engagement tracking or the full PRD aptitude engine. Live generation and Neon rollout need provider credentials and a working schema-owner connection.

Validation: 56 backend tests, 5 frontend tests, TypeScript, ESLint and production build passed. Local HTTP and browser checks verified automatic depth, cache reuse, section navigation, reload persistence and original-lesson fallbacks. These checks used SQLite and fixture content; live model generation and the Neon migration remain unverified.
