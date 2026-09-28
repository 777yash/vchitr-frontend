# Learning surface refresh

> **Superseded (2026-09-29):** the frosted-glass surfaces described below were replaced by the wireframe poster system — see `docs/design-system.md`. Learning surfaces now use hairline frames, no blur, no shadows and no rounded corners. The motion, dialog, skeleton and data-contract notes below still apply.

The learning subject selector, level selector, course workspace, lessons, practice, results and history originally shared a monochrome frosted surface treatment. Education levels, grading, eligibility and persistence use the existing API contracts.

## Performance choices

- Motion is imported dynamically from `motion/mini` only when a learning reveal mounts. Content remains visible and usable while the module loads or if loading fails. Reduced-motion users skip the import and entrance animation.
- Short native opacity/transform animations; CSS handles button feedback. No animation loops, scroll listeners, animated blur, pointer tracking, additional fonts or image downloads.
- Only the desktop chapter sidebar and test toolbar use a fixed 10px backdrop blur. Phone layouts use an opaque toolbar and native modal chapter drawer. Reduced-transparency preferences remove blur; unsupported browsers use the existing opaque fallback surfaces.
- Native `dialog` supplies modal focus containment and Escape dismissal. Native `details` remains functional without optional CSS size interpolation.
- Skeletons reserve content space without continuous shimmer. API requests and backend work are unchanged.

Production Vite build comparison (gzip, decimal KB):

| Asset | Before | After |
| --- | ---: | ---: |
| Initial JavaScript | 438.56 | 440.00 |
| CSS | 10.63 | 12.58 |
| Optional learning animation module | 0 | 3.80 |

Initial transfer increases by about 3.39 KB. Learning adds another 3.80 KB on first use of animation. The existing large main-bundle warning remains. These are build-size measurements, not a claim of identical frame rates or field Core Web Vitals on every device.

## Verification

TypeScript, ESLint, production build and five existing frontend tests pass. Browser checks used a disposable local FastAPI/SQLite fixture: subject selection, first-time level selection, course navigation, generated lessons, desktop/mobile layouts, light/dark themes, mobile drawer focus and Escape return, answer selection, draft save, reload persistence and a successful 5/5 backend-graded retake. No production data was modified. Reduced-motion and reduced-transparency fallbacks were inspected in source; device preference emulation was not available in the browser tool.
