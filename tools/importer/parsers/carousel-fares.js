/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-fares.
 * Base: carousel. Source: https://www.nileair.com/ (#layout-content > div.promotions_area)
 * Generated: 2026-07-27
 *
 * Carousel convention: 2 columns; first row is the block name (added by createBlock);
 * each subsequent row is one card/slide -> [ image (alone) | text content ].
 *
 * Source: fare cards are `.sing_promt` inside an owl-carousel. Image lives in
 * `.sing_promt_img > img`; text in `.sing_promt_text` (h3 route, <span> fare label,
 * <p> price). Owl clones slides for looping, so we dedupe by route heading.
 */
export default function parse(element, { document }) {
  const cells = [];

  const items = element.querySelectorAll('.sing_promt');
  const seen = new Set();

  items.forEach((item) => {
    const img = item.querySelector('.sing_promt_img img, img');
    const textWrap = item.querySelector('.sing_promt_text') || item;
    const heading = textWrap.querySelector('h3, h2, h4');
    const fareLabel = textWrap.querySelector('span');
    const price = textWrap.querySelector('p');

    const key = (heading && heading.textContent.trim()) || (img && img.getAttribute('alt')) || '';
    if (!key || seen.has(key)) return;
    seen.add(key);

    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (fareLabel) {
      const label = document.createElement('p');
      label.textContent = fareLabel.textContent.trim();
      contentCell.push(label);
    }
    if (price) contentCell.push(price);

    cells.push([img || '', contentCell]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-fares', cells });
  element.replaceWith(block);
}
