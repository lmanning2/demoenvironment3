/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-app.
 * Base: hero. Source: https://www.nileair.com/ (#layout-content > div.app-area.max-bg)
 * Generated: 2026-07-27
 *
 * Hero convention: 1 column, 3 rows. Row 1 is the block name (added by createBlock).
 * Row 2 (single cell) holds the optional background image. Row 3 (single cell) holds
 * the title / subheading / CTA content.
 *
 * Source: `.app-area` has a background image (inline style on the area and an
 * `img.app-hand`) plus `.app-content` with a <p> eyebrow, an `h1.title` heading and
 * an `.app-download` group of two store-badge links (each an <a><img></a>).
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 2: background image — prefer the inline background-image URL, else img.app-hand.
  let bgImg = null;
  const style = element.getAttribute('style') || '';
  const bgMatch = style.match(/background-image:\s*url\((['"]?)([^'")]+)\1\)/);
  if (bgMatch) {
    bgImg = document.createElement('img');
    let src = bgMatch[2];
    try { src = new URL(src, document.baseURI).href; } catch (e) { /* keep as-is */ }
    bgImg.src = src;
    bgImg.alt = '';
  } else {
    bgImg = element.querySelector('img.app-hand, img');
  }
  cells.push([bgImg || '']);

  // Row 3: content cell.
  const content = element.querySelector('.app-content') || element;
  const eyebrow = content.querySelector('p');
  const heading = content.querySelector('h1, h2, .title');
  const ctaLinks = Array.from(content.querySelectorAll('.app-download a, a'));

  const contentCell = [];
  if (eyebrow) contentCell.push(eyebrow);
  if (heading) contentCell.push(heading);
  ctaLinks.forEach((a) => contentCell.push(a));

  if (contentCell.length === 0 && !bgImg) {
    element.replaceWith(...element.childNodes);
    return;
  }
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-app', cells });
  element.replaceWith(block);
}
