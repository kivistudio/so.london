# so.london

The clean home for **shortobsessions.com** — an umbrella brand for short, intense
fixations. Each "obsession" lives in its own world inside the same static deploy:

- **`/`** — landing page (video background + obsession buttons)
- **`/about/`** — about page
- **`/tshirts/`** — 66 thousand tshirts product page (Shopify checkout via cart permalink)
- **`/anna-atkins/`** — *Photographs of British Algæ* reader (Anna Atkins, 1843–1853):
  310 cyanotype plates, 3 volumes, flip-book reading view

Built with **Astro** (vanilla output, no client framework). Deploys to GitHub Pages.

This repo is the extracted, tidied successor to the original `studio-tools` repo
(formerly `so.london`, GitHub `kivistudio/atkins-cyanotypes`), which kept the site
tangled together with a pile of image-processing tools and data-acquisition scripts.
Those tools stay behind in `studio-tools`; this repo carries only the site and the
**generated** Anna Atkins data (`plates.json`, `volumes.json`, `book/`).

See `docs/superpowers/specs/` for the port design.
