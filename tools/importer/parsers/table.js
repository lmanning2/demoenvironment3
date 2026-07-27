/* eslint-disable */
/* global WebImporter */
/**
 * Parser for table (vanilla Block Collection Table, 'striped' variation).
 * Base: table. Source: https://www.nileair.com/baggage-allowance
 *   (#layout-content > div.page-wrapper:nth-of-type(3) table | #layout-content table.table)
 * Generated: 2026-07-27
 *
 * Table convention: first row is the block name with the variation in parentheses
 * (added by createBlock -> 'Table (striped)'); each subsequent row is a data row with
 * one cell per column. The source is a standard <table> with a <thead> header row and
 * <tbody> data rows; cell text is wrapped in <span> elements which we flatten to text.
 */
export default function parse(element, { document }) {
  // The instance selector targets the <table> itself; guard for a wrapper too.
  const table = element.matches('table') ? element : element.querySelector('table');
  if (!table) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cellText = (cell) => cell.textContent.replace(/\s+/g, ' ').trim();

  const cells = [];
  const rows = Array.from(table.querySelectorAll('tr'));
  rows.forEach((tr) => {
    const rowCells = Array.from(tr.querySelectorAll('th, td')).map((c) => cellText(c));
    if (rowCells.length) cells.push(rowCells);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'table (striped)', cells });
  element.replaceWith(block);
}
