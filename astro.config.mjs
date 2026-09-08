import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

export default defineConfig({
  site: 'https://shortobsessions.com',
  output: 'static',
  build: { format: 'directory' },
  trailingSlash: 'ignore',
  integrations: [mdx()],
  markdown: {
    rehypePlugins: [
      // Every external link in markdown/MDX opens in a new tab, with rel set for
      // security (noopener) and privacy (noreferrer). Relative/internal links
      // are left untouched. MDX inherits this via extendMarkdownConfig.
      [
        rehypeExternalLinks,
        { target: '_blank', rel: ['noopener', 'noreferrer'] },
      ],
      // Headings become self-linking anchors: rehypeSlug adds an id to each
      // heading, then rehypeAutolinkHeadings wraps the heading text in an
      // <a href="#id"> so every header is a permalink to itself. Order matters —
      // slug must run before autolink so the ids exist to link to.
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
    ],
  },
});
