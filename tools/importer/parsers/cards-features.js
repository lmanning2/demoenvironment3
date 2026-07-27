/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-features.
 * Base: cards. Source: https://www.nileair.com/ (#layout-content > div.choose-area.pb-4)
 * Generated: 2026-07-27
 *
 * Cards (with images) convention: 2 columns; first row is the block name (added by
 * createBlock); each subsequent row is one card -> [ image/icon | text content ].
 *
 * Source: `.single-choose` items. Each item wraps an anchor containing an <img>
 * icon and an `h4.title` (whose text sits inside a nested <span>). We build a
 * linked heading so the card title remains clickable.
 */
export default function parse(element, { document }) {
  const cells = [];

  const items = element.querySelectorAll('.single-choose');
  items.forEach((item) => {
    const icon = item.querySelector('img');
    const link = item.querySelector('a');
    const titleEl = item.querySelector('h4.title, h4, .title');
    const label = titleEl ? titleEl.textContent.trim() : (link ? link.textContent.trim() : '');

    let headingCell = '';
    if (label) {
      const h = document.createElement('h4');
      if (link && link.getAttribute('href')) {
        const a = document.createElement('a');
        a.href = link.getAttribute('href');
        a.textContent = label;
        h.appendChild(a);
      } else {
        h.textContent = label;
      }
      headingCell = h;
    }

    if (!icon && !headingCell) return;
    cells.push([icon || '', headingCell]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-features', cells });
  element.replaceWith(block);
}
