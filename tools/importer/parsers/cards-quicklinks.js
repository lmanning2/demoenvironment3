/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-quicklinks.
 * Base: cards. Source: https://www.nileair.com/ (#layout-content > div.feature-area.demo_bg)
 * Generated: 2026-07-27
 *
 * Cards (with images) convention: 2 columns; first row is the block name (added by
 * createBlock); each subsequent row is one card -> [ image/icon | text content ].
 *
 * Source: `.single-feature` items, each with an <img> icon and an `h4.title > a`
 * linked heading.
 */
export default function parse(element, { document }) {
  const cells = [];

  const items = element.querySelectorAll('.single-feature');
  items.forEach((item) => {
    const icon = item.querySelector('img');
    const heading = item.querySelector('h4.title, h4, .title');
    if (!icon && !heading) return;
    cells.push([icon || '', heading || '']);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-quicklinks', cells });
  element.replaceWith(block);
}
