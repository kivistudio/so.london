/**
 * Build a footnote set from an ordered list of note contents (HTML strings).
 *
 * Markers escalate with asterisks by position: 1st note *, 2nd **, 3rd ***, …
 * — assigned automatically, no numbers to manage. Reorder the array and the
 * asterisks re-count themselves.
 *
 * Deterministic on purpose: everything is computed here, in one place, rather
 * than accumulated as a side effect during render (Astro renders components
 * concurrently, so a shared render-time registry would race).
 *
 * Pair with <FootnoteRef> (the inline marker) and <Footnotes> (the list):
 *
 *   ---
 *   import FootnoteRef from '../components/FootnoteRef.astro';
 *   import Footnotes from '../components/Footnotes.astro';
 *   import { createFootnotes } from '../lib/footnotes.js';
 *   const notes = createFootnotes([
 *     `First note text…`,
 *     `Second note text…`,
 *   ]);
 *   ---
 *   …power of AI<FootnoteRef note={notes[0]} /> as a way…
 *   …presence<FootnoteRef note={notes[1]} /> (it will…
 *   <Footnotes notes={notes} />
 */
export function createFootnotes(contents) {
  return contents.map((content, i) => {
    const n = i + 1;
    return {
      n,
      content,
      marker: '*'.repeat(n),
      id: `fn-${n}`,
      refId: `fn-${n}-ref`,
    };
  });
}
