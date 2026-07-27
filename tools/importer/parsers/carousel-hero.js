/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero.
 * Base: carousel. Source: https://www.nileair.com/ (#layout-content > div.slider_area)
 * Generated: 2026-07-27
 *
 * Carousel convention: 2 columns; first row is the block name; each subsequent row
 * is one slide -> [ image (mandatory, alone in cell 1) | text content (title +
 * description + CTA) in cell 2 ].
 *
 * Source is an owl-carousel; slides live in `.owl-item .sing_slider`. Owl clones
 * the first/last slides for looping (`.owl-item.cloned`) so we dedupe by heading
 * text. The slide background is set via a `--bg-desktop` CSS custom property on
 * `.sing_slider` (no <img> element), so we synthesize an <img> from that URL.
 */
export default function parse(element, { document }) {
  // createBlock adds the block-name header row automatically; do not add one here.
  const cells = [];

  const slides = element.querySelectorAll('.sing_slider');
  const seen = new Set();

  slides.forEach((slide) => {
    const textWrap = slide.querySelector('.slider_text');
    const heading = textWrap && textWrap.querySelector('h1, h2, h3');
    const text = textWrap && textWrap.querySelector('p');
    const cta = textWrap && textWrap.querySelector('a.btn, a');

    const key = (heading && heading.textContent.trim()) || '';
    if (!key || seen.has(key)) return;
    seen.add(key);

    // Background image from the --bg-desktop custom property (no <img> in source).
    let img = null;
    const style = slide.getAttribute('style') || '';
    const match = style.match(/--bg-desktop:\s*url\((['"]?)([^'")]+)\1\)/);
    if (match) {
      img = document.createElement('img');
      let src = match[2];
      try { src = new URL(src, document.baseURI).href; } catch (e) { /* keep as-is */ }
      img.src = src;
      img.alt = key;
    }

    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (text) contentCell.push(text);
    if (cta) contentCell.push(cta);

    cells.push([img || '', contentCell]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
