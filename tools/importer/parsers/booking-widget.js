/* eslint-disable */
/* global WebImporter */
/**
 * Parser for booking-widget.
 * Base: booking-widget (new static/hardcoded block).
 * Source: https://www.nileair.com/ (body > div.header-bottom.gray_bg)
 * Generated: 2026-07-27
 *
 * The source is a functional, JS-driven tabbed flight-search widget. Per project
 * requirement this block is a HARDCODED / STATIC visual example, so the parser
 * emits a stable table representation of the static content model described in the
 * home authoring-analysis (tabs + example Flights-panel search fields). The messy
 * functional source DOM is intentionally NOT scraped; the block is not functional.
 */
export default function parse(element, { document }) {
  const p = (text) => {
    const el = document.createElement('p');
    el.textContent = text;
    return el;
  };
  const boldP = (text) => {
    const el = document.createElement('p');
    const s = document.createElement('strong');
    s.textContent = text;
    el.appendChild(s);
    return el;
  };
  const labeled = (label, value) => {
    const el = document.createElement('p');
    const s = document.createElement('strong');
    s.textContent = `${label}: `;
    el.append(s, document.createTextNode(value));
    return el;
  };

  const cells = [];

  // Tabs row: the three widget tabs as example labels.
  cells.push([[boldP('Tabs'), p('Flights'), p('My Bookings'), p('Flight Status')]]);

  // Flights-panel static example search fields.
  const fields = [boldP('Flights search')];
  fields.push(labeled('From', 'CAI - Cairo, Egypt'));
  fields.push(labeled('To', 'Your Destination'));
  fields.push(labeled('Trip type', 'Round Trip'));
  fields.push(labeled('Dates', '07/27/2026 - 07/29/2026'));
  fields.push(labeled('Passengers', '(1)'));
  fields.push(p('Show Premium Business class only'));
  fields.push(labeled('Action', 'Search'));
  cells.push([fields]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'booking-widget', cells });
  element.replaceWith(block);
}
