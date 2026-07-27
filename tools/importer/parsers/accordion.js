/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion (vanilla Block Collection accordion).
 * Base: accordion.
 * Sources:
 *   home              (#layout-content > div.faq-area.gray_bg)   -> .card > .card-header>button + .card-body
 *   baggage-allowance (#baggage-allowance-faqs, .faq-box-area)   -> .accordion-item > h2.accordion-header + .accordion-body
 *   travelling-pets   (#pets, #travelling-with-pets-faqs)        -> .accordion-item > h2.accordion-header>button + .accordion-body
 * Generated: 2026-07-27
 *
 * Accordion convention: 2 columns; first row is the block name (added by
 * createBlock); each subsequent row is one item -> [ title (mandatory) | content
 * (mandatory) ].
 *
 * The source markup varies across pages, so we support both the Bootstrap "card"
 * pattern and the "accordion-item" pattern, and extract the title from either a
 * nested <button> or the header element's own text.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Handle both `.accordion-item` and Bootstrap `.card` item wrappers.
  const items = element.querySelectorAll(':scope .accordion-item, :scope .card');

  items.forEach((item) => {
    // Title: header text, preferring a nested button when present.
    const header = item.querySelector('.accordion-header, .card-header, h2, h3');
    let titleText = '';
    if (header) {
      const btn = header.querySelector('button');
      titleText = (btn ? btn.textContent : header.textContent).trim();
    }

    // Content: the body region (may contain <p>, <ul>, etc.).
    const body = item.querySelector('.accordion-body, .card-body');

    if (!titleText && !body) return;

    const titleEl = document.createElement('p');
    titleEl.textContent = titleText;

    const contentCell = [];
    if (body) {
      Array.from(body.childNodes).forEach((node) => {
        if (node.nodeType === 1) contentCell.push(node);
        else if (node.nodeType === 3 && node.textContent.trim()) {
          const p = document.createElement('p');
          p.textContent = node.textContent.trim();
          contentCell.push(p);
        }
      });
    }
    if (contentCell.length === 0) contentCell.push('');

    cells.push([titleEl, contentCell]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
