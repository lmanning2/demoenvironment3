/*
 * Table Block
 * Recreate a table
 * https://www.hlx.live/developer/block-collection/table
 */

function buildTable(rows, colIndices, header) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  rows.forEach((row, i) => {
    const tr = document.createElement('tr');
    colIndices.forEach((c) => {
      const cell = row[c];
      const isHead = i === 0 && header;
      const td = document.createElement(isHead ? 'th' : 'td');
      if (isHead) td.setAttribute('scope', 'col');
      td.innerHTML = cell ? cell.innerHTML : '';
      tr.append(td);
    });
    if (i === 0 && header) thead.append(tr);
    else tbody.append(tr);
  });
  table.append(thead, tbody);
  return table;
}

/*
 * Qatar-style tabbed allowance table: splits a single Business/Economy table
 * into two class-specific tables toggled by tabs.
 */
function buildAllowanceTabs(block, rows, bizIdx, ecoIdx) {
  block.classList.add('table-allowance');
  block.textContent = '';

  const colCount = rows[0].length;
  const allCols = [...Array(colCount).keys()];
  const variants = [
    { key: 'business', label: rows[0][bizIdx].textContent.trim(), cols: allCols.filter((c) => c !== ecoIdx) },
    { key: 'economy', label: rows[0][ecoIdx].textContent.trim(), cols: allCols.filter((c) => c !== bizIdx) },
  ];

  const tablist = document.createElement('div');
  tablist.className = 'table-allowance-tabs';
  tablist.setAttribute('role', 'tablist');

  const panels = document.createElement('div');
  panels.className = 'table-allowance-panels';

  variants.forEach((variant, i) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'table-allowance-tab';
    tab.setAttribute('role', 'tab');
    tab.id = `allowance-tab-${variant.key}`;
    tab.setAttribute('aria-controls', `allowance-panel-${variant.key}`);
    tab.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    tab.textContent = variant.label;

    const panel = document.createElement('div');
    panel.className = 'table-allowance-panel';
    panel.id = `allowance-panel-${variant.key}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    if (i !== 0) panel.hidden = true;
    panel.append(buildTable(rows, variant.cols, true));

    tab.addEventListener('click', () => {
      tablist.querySelectorAll('.table-allowance-tab').forEach((t) => t.setAttribute('aria-selected', 'false'));
      panels.querySelectorAll('.table-allowance-panel').forEach((p) => { p.hidden = true; });
      tab.setAttribute('aria-selected', 'true');
      panel.hidden = false;
    });

    tablist.append(tab);
    panels.append(panel);
  });

  block.append(tablist, panels);
}

export default async function decorate(block) {
  const rows = [...block.children].map((row) => [...row.children]);
  const header = !block.classList.contains('no-header');

  // Detect a Business/Economy allowance table and render it as tabbed views.
  const headerText = header && rows[0]
    ? rows[0].map((c) => c.textContent.trim().toLowerCase()) : [];
  const bizIdx = headerText.findIndex((t) => t.includes('business'));
  const ecoIdx = headerText.findIndex((t) => t.includes('economy'));
  if (bizIdx !== -1 && ecoIdx !== -1) {
    buildAllowanceTabs(block, rows, bizIdx, ecoIdx);
    return;
  }

  const table = buildTable(rows, rows[0] ? [...rows[0].keys()] : [], header);
  block.replaceChildren(table);
}
