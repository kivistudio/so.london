# AGENTS.md — orientation for AI assistants working on this repo

This file is read by Claude Code, Cursor, Aider, OpenAI Codex, etc. Ground yourself in it before making changes. It assumes you've read `README.md`.

## What this repo is

`shortobsessions.com` — an umbrella brand for short, intense fixations. One clean Astro
static site: an umbrella shell plus self-contained obsession "parts", each its own route.

- **`/`** — landing page (video background + obsession buttons).
- **`/about/`** — about page.
- **`/anna-atkins/`** — _Photographs of British Algæ_ reader (Anna Atkins, 1843–1853):
  310 plates, 3 volumes, flip-book reading view.
- **`/notes/`** — running notes on hyperfocus / short obsessions (MDX, with side/footnotes).
- **`/inspirations/`** — a running list of influences (Markdown).

Built with **Astro** (vanilla output, no React, no client framework). The Anna Atkins reader
is a single-file vanilla HTML/CSS/JS page (`src/pages/anna-atkins/index.astro`) that imports
its generated data and serves its images from `public/anna-atkins/`.

This repo is the extracted, tidied successor to the original `studio-tools` repo (formerly
`so.london`, GitHub `kivistudio/atkins-cyanotypes`), which kept the site tangled with a pile
of image-processing tools and data-acquisition scripts. Those stay behind in `studio-tools`.

## Engineering principles

These are load-bearing across every change. They override habits.

- **Always pin to the latest stable.** When picking a version for any dependency — Astro,
  Node, pnpm, anything in `package.json` — check the current stable release before pinning,
  and use it. If a major version dropped recently, read its migration notes.
- **Code for maintainability.** The next person to open a file should understand it without a
  tour. Clear naming, small focused files, intentional structure. If you're writing a comment
  to explain _what_ code does, rename the thing instead. Reserve comments for _why_.
- **Best software engineering practices, applied honestly.** Boring conventions over clever
  ones. One way to do each thing. Don't add abstraction until the second concrete use case
  exists. Don't introduce a framework or build tool unless its absence is actively painful.
- **Verify your own work.** Before claiming done, run the relevant smoke (`pnpm build`,
  `pnpm preview`, a Playwright screenshot). If you can't verify something, say so.

## Running locally

```sh
# One-time
mise install                 # installs the Node version pinned in mise.toml
corepack enable              # lets package.json's "packageManager": "pnpm@…" auto-fetch
make install                 # alias for `pnpm install`

# Local dev
make dev                     # http://localhost:4321/
make build                   # → dist/
make preview                 # serve dist/ statically
make clean                   # nuke dist/, node_modules, .astro
```

Browser testing — Playwright via uvx:

```sh
uvx --from playwright python your_test.py
```

## The Anna Atkins data

The reader imports two generated files and serves one image folder:

- `public/anna-atkins/plates.json` — 310 plates (catalog view): taxonomy, habitat, range,
  and the exact species string for the iNaturalist photo lookup.
- `public/anna-atkins/volumes.json` — 3 volumes, 742 pages in original book reading order
  (recto + verso + front matter + synthetic blanks): drives the flip-book + shelf.
- `public/anna-atkins/book/` — 741 NYPL `q`-size JPGs (~1600px long edge, ~970 MB committed).
  Every visual in the reader reads the same `{NNN}_{slug}_id{imageID}.jpg` per capture.

`plates.json` and `volumes.json` are imported directly by
`src/pages/anna-atkins/index.astro` and serialized into `window.__PLATES__` /
`window.__VOLUMES__` via Astro's `define:vars`.

**There is no data pipeline in this repo.** These artifacts are generated in the
`studio-tools` repo (from the NYPL API + a ~94 GB ProtonDrive archive of TIFF masters) and
copied here. To regenerate, run the pipeline there and copy the outputs over.

## Anna Atkins reader conventions

- **Single-file, self-contained.** The reader is one `.astro` page with inline global CSS +
  scripts. It does not use `BaseLayout` or the shared components — that is deliberate, keep it.
  (Breaking it into components is a possible future task, not a current invariant.)
- **Single image folder.** Everything visual lives in `public/anna-atkins/book/`. Reader
  spread, hero shelf cover, catalog row thumbnail, expand-panel preview, lightbox — all read
  the same file per capture.
- **Reader rules:**
  - The flip-book uses CSS `rotateY` 3D transforms with `backface-visibility: hidden`.
  - `<html>` gets the class `reader-open` while the reader is open — that locks body scroll
    so the 3D-flipping leaf doesn't trigger a scrollbar flash.
  - Counter and page-jump input count **rectos only**: `isRecto(p)` is true when the page is
    neither `blank: true` nor `extra: true`.
  - Spread indexing: `rightIdx = 0` is the closed cover; `rightIdx = 2` is the first open
    spread; flips advance/retreat by 2.
- **iNaturalist photo lookup is strict.** Only an exact species-name match counts; no genus or
  modern-name fallback. Cards without a match show a striped placeholder.
- **Catalog vs reader order.** The page below the hero is a Werner-style catalog table (one
  section per algal group) with click-to-expand rows, ordered alphabetically by genus then
  species. The reader is the only place that follows the original NYPL book order.
- **iNat photos are fetched on demand** — only when a catalog row is expanded, once per panel.
- **Range-map column is a placeholder** — every row renders the same tiny abstract SVG. Real
  range data replaces it later; don't wire up a world map yet.

## Conventions to keep (site-wide)

- **Astro, vanilla output, no React.** `<script>` blocks for small interactivity (the Anna
  Atkins reader). No CSS framework — design tokens in `src/styles/tokens.css` + scoped
  component styles.
- **Semantic HTML first.** Use the element that means what you intend, not a styled `<div>`.
  Landmarks (`<main>`, `<nav>`, `<header>`, `<footer>`); one `<h1>` per page (an `.sr-only`
  one is fine when the visible mark is a logo) and no skipped heading levels; a `<section>`
  with a heading for each thematic block; real lists (`<ul>`/`<ol>`/`<li>`) for lists;
  `<button>` for actions vs `<a>` for navigation; `<figure>`/`<figcaption>` for media; notes
  as an endnotes `<section>` (`role="doc-endnotes"`), never a page `<footer>`. Every
  `target="_blank"` link carries `rel="noopener noreferrer"`. Reach for `<div>`/`<span>` only
  when no semantic element fits (e.g. a pure layout wrapper).
- **`assets/` at the repo root is the shared asset library** for non-source files (encoded
  video, the intro image). Astro consumes from here via Vite `import`; Vite hashes the URLs in
  `dist/_astro/`.
- **`public/` is for files that need a fixed public URL** — `CNAME` and the `anna-atkins/`
  subtree (data + images).
- **Custom domain via `public/CNAME`.** GitHub Pages reads it on every deploy.

## Design system — tokens are the source of truth

`src/styles/tokens.css` is the single source for colour, spacing, and type.
**Use the tokens; don't invent values.** No ad-hoc hex, no off-scale `px`, no
one-off spacing in a component. If you genuinely need a value that doesn't
exist ask before adding a token to `tokens.css` (and document the _why_).

**Colour roles** — each tone maps to exactly one job; keep it that way:

- `--fg` (ink) — all structure & content: titles, section headings, body, the
  set-off name. Headings are full-ink, never greyed.
- `--fg-dim` — _only_ secondary/meta text: footnotes, sign-off, colophon.
  Never used to manufacture heading hierarchy.
- `--cv-red` — the single functional accent, reserved for footnote markers.
- Backgrounds come from `--bg` (light pages `#FBF9F5`, dark pages `--ink`).
  `--paper` is the light-_ink_ for text on dark surfaces (landing chrome, the
  Anna Atkins reader) — it is not a background.

**Type scale** (Jost) — hierarchy comes from size + weight + space, never from
greying a heading down:

| Size | Weight                                   | Role                      |
| ---- | ---------------------------------------- | ------------------------- |
| 28px | 500 Medium, lowercase                    | page title                |
| 18px | 400 Book                                 | body, lists, footnotes    |
| 15px | 500 Medium, UPPERCASE + `--nav-tracking` | section label / kicker    |
| 13px | 400                                      | meta (sign-off, colophon) |
| 11px | 400, tracked caps                        | nav / back link           |

**Spacing** — every gap is a step on the 8-pt `--s-*` scale; nothing ad-hoc.
Vertical-rhythm rule: **space above a heading ≫ space below it** (`--s-8` above,
`--s-4` below ≈ 4:1) so each heading groups with the text it introduces.
Paragraph gap `--s-5`.

These follow the Swiss / International Typographic Style (Müller-Brockmann,
Ruder): objective hierarchy through a small rational scale and active
whitespace; black + one accent; flush-left, ragged-right; restraint over
decoration.

> The type-scale sizes currently live inline in `about.astro`. Promoting them
> to named tokens in `tokens.css` (e.g. `--text-title`, `--text-label`) is a
> good follow-up so future pages reuse the scale instead of re-typing it.

## Build hygiene

- `dist/`, `node_modules/`, `.astro/` are gitignored.
- `public/anna-atkins/book/` (~970 MB) **is** committed on purpose — the site must be
  self-contained for GitHub Pages.

## Pitfalls observed in earlier sessions

- JSON-injection regexes that stopped on the first `;` silently truncated data (some titles
  contain semicolons). Always anchor on end-of-line.
- `body.style.overflow = 'hidden'` alone wasn't enough to suppress the document scrollbar
  during page flips; a `.reader-open` class on `<html>` that locks html + body fixed it.
- **Background video with `z-index: -1` inside a body without its own stacking context renders
  behind the body's background — invisible.** `src/styles/tokens.css` adds `isolation: isolate`
  to `body` to fix this; don't remove it.
- **`libvpx-vp9` produced larger files than `libx264` for the landing footage.** We ship only
  the H.264 mp4 (`assets/video/landing.mp4`). Don't add a webm back unless you've verified it's
  actually smaller.

## Deployment

GitHub Pages, source = GitHub Actions, workflow at `.github/workflows/deploy.yml`:

1. `pnpm/action-setup` + `actions/setup-node@v4` (reads `.nvmrc`).
2. `pnpm install --frozen-lockfile`.
3. `pnpm build` with `PUBLIC_SHOPIFY_DOMAIN=${{ secrets.SHOPIFY_DOMAIN }}` injected.
4. Upload `./dist` as the Pages artifact and deploy.

Custom domain `shortobsessions.com` is set via `public/CNAME`. Repo:
`https://github.com/kivistudio/so.london`.

## When in doubt

Read the actual content rather than guessing. For visual changes, run `make dev` and use
Playwright (via `uvx --from playwright python ...`) to screenshot what you change before
claiming success.
