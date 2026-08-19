# Design: Port Short Obsessions + Anna Atkins into a clean `so.london` repo

**Date:** 2026-08-19
**Status:** Design — awaiting review before implementation plan

## Problem

The original repo (`kivistudio/atkins-cyanotypes`, local folder formerly `so.london`,
now renamed `studio-tools`) grew into a junk drawer: the Astro site lives alongside
image-processing tools (`tools/vectorizer`, `tools/image_editor`, `tools/gradio-editor`,
`tools/editor`, `tools/print_prep`, `tools/image_mcp`), OCR scripts (`scripts/mistral`),
print-prep output, a data-acquisition pipeline, and ~94 GB of external archive tooling.
The clean, deployable site is a small island in that mess.

Goal: extract just the site into a fresh `so.london` repo, leaving the tools and
pipeline behind in `studio-tools`.

## Decisions (settled)

| Decision | Choice | Rationale |
|---|---|---|
| Topology | **One clean repo**, Anna Atkins as a route | Simplest mental model; one build, one deploy, one CNAME. |
| Route for the reader | `/anna-atkins/` (renamed from `/atkins/`) | Cleaner, human URL on the shared domain. |
| Domain | `shortobsessions.com` root; reader at `shortobsessions.com/anna-atkins` | Single domain keeps link equity; no DNS/subdomain/cert work. |
| Git history | **Fresh start** — new repo, new initial commit | History stays recoverable in `studio-tools`. Fresh start also means the ~970 MB `book/` folder is a one-time snapshot, not accumulated across history. |
| Data | **Artifacts only** (Option A) | Carry generated `plates.json`, `volumes.json`, `book/`. The acquisition + generation pipeline stays in `studio-tools`. Also fixes an existing wart: pipeline `.py` files currently sit in `public/atkins/` and ship publicly into `dist/`. |
| GitHub | `kivistudio/so.london` | Same org as before. |

### Why not a subdomain (`atkins.shortobsessions.com`)?

A subdomain would let Anna Atkins be its own repo + independent deploy, and would keep
the ~970 MB image blob out of the umbrella repo. Both were rejected in favour of the
simpler single-repo/subpath model. The one real cost of the subpath choice is repo size
(~1 GB clone); the escape hatches (subdomain split, Git LFS, build-time image fetch)
remain open if that ever becomes painful. Not pre-solved (YAGNI).

## What moves vs. what stays

### Carried into `so.london`
- `src/` — pages (`index`, `about`, `tshirts`, `anna-atkins`), `layouts/BaseLayout.astro`,
  `components/*` (`BackgroundVideo`, `Nav`, `IntroDefinition`, `ObsessionButton`, `Wordmark`,
  `GridOverlay`), `styles/tokens.css`.
- Build config: `astro.config.mjs`, `package.json`, `pnpm-lock.yaml`, `.nvmrc`, `mise.toml`,
  `Makefile`, `.gitignore`.
- Deploy: `.github/workflows/deploy.yml`, `public/CNAME`.
- **Only the `assets/` referenced by `src/` imports** (landing video, `short-obsessions.jpg`,
  any svgs/colours actually imported). Verify by grep before copying.
- Anna Atkins **generated artifacts**: `plates.json`, `volumes.json`, `book/` → under
  `public/anna-atkins/`.
- Trimmed docs: a fresh `AGENTS.md` / `README.md` describing only the site.

### Left behind in `studio-tools`
- All of `tools/`, `scripts/mistral`, `print_prep_out/`, `iiif_master.tif`,
  `printspace-profiles.zip`, `conversation_files/`.
- The Anna Atkins data pipeline: `public/atkins/*.py`, root `atkins/` (`download_*`,
  `frame_versos.py`, `metadata.csv`, `captures_*.json`, `download_horniman.py`).
- The `encode_landing_video.py` helper stays with the source `.avi` unless we decide the
  site repo needs to re-encode (probably not — ship the encoded mp4 as an asset).

## The `/atkins` → `/anna-atkins` rename (mechanical, contained)

Touch points (all find-and-replace, confirmed by grep):
- `src/pages/atkins/index.astro` → `src/pages/anna-atkins/index.astro`, and inside it:
  - two JSON import paths (`../../../public/atkins/...` → `../../../public/anna-atkins/...`)
  - ~7 absolute asset refs: one CSS `url("/atkins/book/...")`, one `fetch('/atkins/plates.json')`,
    and several template `src="/atkins/book/..."`.
- `public/atkins/` → `public/anna-atkins/` (artifacts only — no `.py`).
- `src/pages/index.astro`: `ObsessionButton href="/atkins/"` → `"/anna-atkins/"`.
- Optional: a redirect from old `/atkins/` for any external links (decide later).

## Explicitly out of scope (separate follow-up)

**Modularising the Anna Atkins reader.** `index.astro` is a 1974-line standalone HTML
document (own `<head>`, ~1300 lines inline global CSS, inline scripts) that does not use
`BaseLayout` or shared components. It gets ported **as-is** so the risky refactor is not
tangled with the risky repo split. Breaking it into components / adopting the shared
Nav+theme is a later, independent task.

## Execution — two phases

De-risk by standing up a working clean site *before* dragging in the heavy reader.

### Phase 1 — clean umbrella (landing / about / tshirts)
1. Copy the site skeleton (config, `src/` minus the atkins page, referenced assets, workflow, CNAME).
2. Pin dependencies to latest stable (repo principle) while the surface is small.
3. `pnpm install && pnpm build && pnpm preview`; verify the three pages. Temporarily
   drop/forward the Anna Atkins button (route not present yet).
4. Domain handover: a custom domain verifies on only one repo at a time. Move
   `shortobsessions.com` from `atkins-cyanotypes` Pages settings to `so.london`. Expect a
   brief overlap; the old repo can keep building until cutover.

### Phase 2 — Anna Atkins as `/anna-atkins`
1. Copy `atkins/index.astro` → `anna-atkins/index.astro`; apply the rename find-and-replace.
2. Copy `plates.json`, `volumes.json`, `book/` → `public/anna-atkins/` (no `.py`).
3. Update the landing button href.
4. `pnpm build && pnpm preview`, then Playwright-screenshot the flip-book, catalog, and
   lightbox (repo verification rule).
5. Push; verify live at `/anna-atkins`.

## Verification
- `pnpm build` clean, `pnpm preview` serves all four routes.
- Playwright screenshots of landing + the three Anna Atkins views.
- No `.py` files in `dist/`. No broken `/atkins/` references remain.
