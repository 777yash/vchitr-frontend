# Design system — wireframe poster

A near-monochrome visual language taken from wireframe line-art posters: hairline frames, condensed uppercase display type, tiny mono captions, warped grids and topographic lines. It changes presentation only; routes, data and behaviour are untouched.

- Tokens: `src/index.css`
- Primitives: `src/styles/chrome.css` (global, every class prefixed `ui-`)
- Line art: `src/components/art/` (decorative SVG components)

## Rules

1. **Two themes, one system.** The existing toggle switches between *Paper* (light, lavender-grey `#E2E2EB`) and *Ink* (dark, `#0B0B0D`). Every colour comes from a `--c-*` token; never hardcode hex values in component CSS.
2. **One accent.** Lavender-grey `--c-accent` is for hover fills, active/selected states, selection and tags. Nothing else gets colour.
3. **Red means trouble.** `--c-signal` (desaturated red) is only for errors, invalid fields and destructive actions.
4. **Flat and square.** No `border-radius`, no shadows, no gradients, no `backdrop-filter`. Depth comes from 1px hairlines, inversion and spacing.
5. **Tiny chrome, readable content.** Captions, labels and nav can be 10–12px mono uppercase. Lessons, notes, questions and form input text stay at 15–16px sentence case (`.ui-prose`, `--fs-read`).
6. **Art is decoration.** Line-art components are `aria-hidden`, never carry meaning and never intercept pointer events.
7. **Uppercase through CSS.** Keep copy in sentence case in the source; the classes apply `text-transform`.

## Tokens

| Group | Tokens |
| --- | --- |
| Colour | `--c-bg`, `--c-surface`, `--c-surface-2`, `--c-fg`, `--c-muted`, `--c-line`, `--c-line-strong`, `--c-accent`, `--c-on-accent`, `--c-accent-text` (accent hue dark enough for text on Paper), `--c-signal`, `--c-signal-bg`, `--c-focus` |
| Fixed Ink | `--ink-bg`, `--ink-surface`, `--ink-fg`, `--ink-soft`, `--ink-muted`, `--ink-line`, `--ink-line-strong`, `--ink-accent`, `--ink-signal` — identical in both themes, for surfaces that are always dark (code blocks, poster heroes) |
| Families | `--font-display` (Archivo, condensed via `--wdth-display`), `--font-body` (IBM Plex Sans), `--font-mono` (IBM Plex Mono), `--font-serif` |
| Type scale | `--fs-micro` 10 · `--fs-caption` 11 · `--fs-small` 12 · `--fs-body-sm` 13 · `--fs-body` 15 · `--fs-read` 16 · `--fs-h3` · `--fs-h2` · `--fs-h1` · `--fs-display` (fluid `clamp()`) |
| Spacing | `--s-1` … `--s-10` = 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px |
| Geometry | `--radius` (0), `--hairline` (1px), `--measure` (65ch), `--container` (1320px) |
| Layers | `--z-base`, `--z-raised`, `--z-sticky`, `--z-overlay`, `--z-nav`, `--z-modal`, `--z-grain` |
| Motion | `--ease`, `--dur-fast` 120ms, `--dur` 200ms, `--dur-slow` 400ms |

All text/background pairs used by the primitives meet WCAG AA (muted text is about 5.7:1 on Paper and 6:1 on Ink; signal red is about 5.2:1 and 6:1).

The legacy variables (`--bg-color`, `--text-color`, `--card-bg`, `--border-color`, `--btn-*`, `--ui-font`…) are aliases to the new tokens so older CSS keeps working. Remove them once every component has migrated.

## Primitives (`chrome.css`)

| Class | Use |
| --- | --- |
| `ui-container` | Max-width page gutter |
| `ui-grid-1px` | CSS grid whose gaps render as 1px dividers (children get `--c-bg`) |
| `ui-grid-overlay` | 24px blueprint grid background (`--grid-size` to change) |
| `ui-divider` (`--strong`, `--dashed`) | Full-width hairline rule on `<hr>` |
| `ui-invert` | Swap foreground and background for a block |
| `ui-frame` (`--soft`) | Hairline box |
| `ui-corners` | Registration ticks on all four corners (`--tick`, `--tick-color`) |
| `ui-window`, `__bar`, `__controls`, `__body` | Poster panel with a title bar |
| `ui-display` (`--xl`, `--md`, `--sm`, `--outline`) | Condensed uppercase headline |
| `ui-caption` (`--micro`, `--strong`) | Mono uppercase metadata |
| `ui-blurb` | Short marketing copy, 13px |
| `ui-prose` | Long-form reading text, 16px at 65ch |
| `ui-data` | Mono tabular numbers |
| `ui-link` | Underlined inline link with accent hover |
| `ui-btn` (`--solid`, `--ghost`, `--bracket`, `--danger`, `--sm`, `--lg`, `--block`) | Buttons and button-styled links |
| `ui-field`, `ui-label`, `ui-input`, `ui-check`, `ui-field__hint`, `ui-field__error` | Forms; `aria-invalid="true"` turns an input red |
| `ui-alert` (`--error`), `ui-alert__tag` | Inline status messages |
| `ui-tag` (`--accent`, `--inverse`, `--signal`) | Square badges |
| `ui-skeleton` | Static hatched placeholder (no shimmer loop) |
| `ui-art` (`--fill`, `--muted`, `--drift`) | Sizing and colour for line-art SVGs |
| `ui-sr-only` | Visually hidden, still announced |

```html
<section class="ui-window">
  <header class="ui-window__bar">
    <span>Chapter 04 / Polynomials</span>
    <span class="ui-window__controls" aria-hidden="true">□ □ ✕</span>
  </header>
  <div class="ui-window__body">…</div>
</section>

<label class="ui-field">
  <span class="ui-label">Email</span>
  <input class="ui-input" type="email" aria-invalid="true" aria-describedby="email-error" />
  <span class="ui-field__error" id="email-error">Enter a valid email address</span>
</label>
```

## Line art (`components/art`)

Import from `components/art`. All strokes use `currentColor` and stay 1px at any size. Output is deterministic per `seed`, so a page draws the same art on every visit.

| Component | Key props | Notes |
| --- | --- | --- |
| `WarpedGrid` | `warp` (`wave` · `pinch` · `well`), `intensity` 0–1, `cols`, `rows`, `seed` | Stretches to fill; `well` is the vortex |
| `TopoWaves` | `variant` (`ridge` · `contour`), `lines`, `intensity`, `seed` | Ridges stretch; contours crop to cover |
| `Globe` | `size` | Small wireframe globe mark |
| `Crosshair` | `size`, `ring` | Registration mark |
| `StarRow` | `count`, `size`, `gap` | Asterisk ornament row |

```tsx
<div style={{ position: 'relative' }}>
  <WarpedGrid className="ui-art--fill ui-art--muted" warp="well" intensity={0.9} seed={6} />
</div>
```

Geometry lives in `art/geometry.ts` as pure functions and is covered by `tests/art.test.mjs` (determinism, bounds, ridge lines never crossing, contour rings staying nested).

## Shared components

| Component | Treatment |
| --- | --- |
| Navigation | Solid hairline bar (no blur), condensed logo with globe mark, mono links with `[ ]` on the active page, square avatar, text theme toggle (`Light`/`Dark`). On phones the close button moves to the right edge. Drag behaviour unchanged. |
| MarkdownEditor | Hairline toolbar and segmented mode switch; monochrome syntax tokens; preview headings in the display face; code blocks are always an Ink panel with a monochrome highlight.js palette overriding `github-dark-dimmed`. Overlay and textarea keep identical metrics so the caret stays aligned. |
| CountryCodeSelect | `profile` variant follows the theme; `dark` variant uses the fixed Ink palette for always-dark screens. |
| Helpr | Window with a title bar. Not mounted anywhere yet. |

## Pages

Every page follows the active theme (Paper or Ink).

| Page | Layout |
| --- | --- |
| Home | Poster hero: meta strip, condensed `vCHITR` wordmark, two figure windows (vortex grid, terrain), tick-rule footer |
| Login / Signup / Onboarding | Window card with a title bar over a contour-map backdrop |
| Subjects | Three line-art cards on a 1px grid; inverted notes-vault band |
| Subject selection | Learning: cards with a warped-grid figure strip. Competitive: framed contour figure with a coming-soon label |
| Learning workspace | Hairline sidebar with an inverted active chapter, numeral stats strip, framed panels, lavender selected answers, solid sticky test toolbar |
| FAQ | Oversized title column beside a numbered hairline list; random line-art backdrop |
| Contact | Mail window over a random line-art backdrop |
| Profile | Data sheet: square initials block, 1px-divided details grid, learning preferences rows |
| Notes | Hairline sidebar tree (inverted active note), square tabs, framed empty state |

`RandomImageBackground` now draws one of four line-art compositions per mount instead of loading photos.

## Global behaviour

- A fixed film-grain overlay (`body::after`) sits above the UI at 5–7% opacity with `pointer-events: none`.
- `index.html` applies the saved theme before first paint, matching the initial state in `Navigation.tsx`, so dark-mode users never see a light flash.
- `prefers-reduced-motion` shortens every animation and transition to near zero.
- Scrollbars are thin and hairline-coloured (`scrollbar-color`).
