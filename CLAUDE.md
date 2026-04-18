# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Vite HMR)
npm run build      # Type-check + production build (tsc -b && vite build)
npm run lint       # ESLint
npm run preview    # Preview production build
```

There is no test runner configured in this project.

## Architecture

**Stack:** React 19 + TypeScript + Vite. Routing via `react-router-dom` v7. Markdown rendering via `marked` + `highlight.js`. `axios` is installed but not yet used.

**Entry point:** `src/main.tsx` → `src/App.tsx` wraps everything in `<BrowserRouter>` and renders `<Navigation>` above a `<Routes>` switch.

**Routes:**
- `/` → `Home`
- `/subjects` → `Subjects` — card grid; clicking a subject navigates to `/notes/:subjectName`
- `/notes` and `/notes/:subjectName` → `Notes`
- `/faq` → `Faq`
- `/contact` → `Contact`

**Navigation (`src/components/Navigation.tsx`):** A slide-out panel triggered by a draggable hamburger button. The button is positioned with CSS `left: ${posX}px` and can be dragged horizontally using Pointer Events API. Theme (light/dark) is persisted to `localStorage` and applied via `data-theme` attribute on `<html>`. Other pages can open the nav by dispatching a `toggle-main-nav` custom event on `window`.

**Notes page (`src/pages/Notes.tsx`):** Split into a collapsible sidebar file-explorer and a main content area. The tree is a recursive `NoteItem[]` structure (`file | folder`). All tree operations (add, rename, delete, search filtering) are pure functions that return new arrays — state is in-memory only with no backend persistence. The `subjectName` URL param auto-expands the matching top-level folder on mount. `TreeItem` is a self-contained recursive component defined in the same file.

**MarkdownEditor (`src/components/MarkdownEditor.tsx`):** Three modes — `edit`, `split`, `preview`. In edit mode a transparent syntax-highlighting overlay (`md-highlight-overlay`) sits on top of the `<textarea>` and scrolls in sync with it. Line numbers are rendered separately and also sync-scrolled. Keyboard shortcuts: `Ctrl+B` bold, `Ctrl+I` italic, `Ctrl+K` link, `` Ctrl+` `` inline code, `Tab` inserts two spaces.

**Icons (`src/components/Icons.tsx`):** All icons are inline SVG functional components — not a third-party icon library. Add new icons here following the existing pattern.

**CSS:** Each component/page has a co-located `.css` file. Global CSS variables for theming live in `src/index.css` under `[data-theme="light"]` / `[data-theme="dark"]` selectors.

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
