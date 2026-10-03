# vCHITR frontend

React + TypeScript + Vite interface for the vCHITR learning platform.

## Run

```bash
npm ci
cp .env.example .env
npm run dev
```

Set `VITE_API_BASE_URL` to the backend origin. Optional `VITE_GOOGLE_CLIENT_ID` enables Google sign-in. Provider keys belong only in backend settings.

```bash
npm run build
npm run lint
```

## Learning flow

Sign in → Learning → enroll in Maths → choose High school once. The course loads all 14 NCERT Class 10 chapters from the backend. Change the saved subject level in Profile. Lessons, tests, saved drafts, result history, reading progress, tutor conversations and Notes persist through backend APIs.

Chapter explanations/tests use server-derived learning depth. Missing explanations generate automatically when backend flags are enabled; authored material remains available while drafts await review or the provider is unavailable. Check status never starts a generation. Retakes show last/best scores and preserve attempts until reset. Submit every chapter test to unlock the final.

Homepage composition and shared original navigation are preserved. Supporting screens use the same monochrome theme, concise copy, original SVG room tiles and lightweight Motion reveals. Reduced-motion preferences disable decorative effects; no WebGL or extra animation engine is required.

Backend operational/API/database docs: [vcFastApi](https://github.com/xdh4uv/vcFastApi). Live frontend: [vchitr-frontend.vercel.app](https://vchitr-frontend.vercel.app/).
