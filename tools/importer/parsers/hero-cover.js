/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-cover.
 * Base: hero.
 * Sources:
 *   baggage-allowance (#layout-content > div.page-wrapper:nth-of-type(2))
 *   travelling-pets   (#layout-content > div.page-wrapper:nth-of-type(2))
 * Generated: 2026-07-27
 *
 * Hero convention: 1 column, 3 rows. Row 1 is the block name (added by createBlock).
 * Row 2 (single cell) holds the wide cover image. Row 3 (single cell) holds the
 * optional heading + intro paragraph.
 *
 * Source: `.img-cover > img` is the cover photograph; `.about-content` contains an
 * optional <h4> heading and <p> intro (both empty in the current sources).
 */
export default function parse(element, { document }) {
  const cells = [];

  const cover = element.querySelector('.img-cover img, img');
  cells.push([cover || '']);

  const content = element.querySelector('.about-content') || element;
  const heading = content.querySelector('h1, h2, h3, h4');
  const intro = content.querySelector('p');

  const contentCell = [];
  if (heading && heading.textContent.trim()) contentCell.push(heading);
  if (intro && intro.textContent.trim()) contentCell.push(intro);
  if (contentCell.length === 0) contentCell.push('');
  cells.push([contentCell]);

  if (!cover && contentCell.every((c) => c === '')) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-cover', cells });
  element.replaceWith(block);
}
