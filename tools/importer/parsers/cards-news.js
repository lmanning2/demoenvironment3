/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-news.
 * Base: cards. Source: https://www.nileair.com/ (#layout-content > div.news-area | div.container)
 * Generated: 2026-07-27
 *
 * Cards (with images) convention: 2 columns; first row is the block name (added by
 * createBlock); each subsequent row is one card -> [ image | text content ].
 *
 * Source: `a.news-card` items (the whole card is a link). Image is in
 * `.news-card-cover > img`; text is in `.news-card-content` (h3 title, a <p><small>
 * date, and a <p> excerpt). We keep the card title linked to the article URL.
 */
export default function parse(element, { document }) {
  const cells = [];

  const cards = element.querySelectorAll('a.news-card, .news-card');
  cards.forEach((card) => {
    const img = card.querySelector('.news-card-cover img, img');
    const content = card.querySelector('.news-card-content') || card;
    const title = content.querySelector('h3, h2, h4');
    const paras = Array.from(content.querySelectorAll('p'));
    const href = card.matches('a') ? card.getAttribute('href') : (card.querySelector('a') && card.querySelector('a').getAttribute('href'));

    if (!img && !title && paras.length === 0) return;

    const contentCell = [];
    if (title) {
      if (href) {
        const h = document.createElement(title.tagName.toLowerCase());
        const a = document.createElement('a');
        a.href = href;
        a.textContent = title.textContent.trim();
        h.appendChild(a);
        contentCell.push(h);
      } else {
        contentCell.push(title);
      }
    }
    paras.forEach((p) => contentCell.push(p));

    cells.push([img || '', contentCell]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news', cells });
  element.replaceWith(block);
}
