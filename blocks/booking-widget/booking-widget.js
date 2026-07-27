/**
 * Booking Widget (hardcoded / static visual example)
 *
 * This is NOT a functional booking engine. It renders a static visual
 * representation of the Nile Air flight-reservation widget in the style of a
 * Qatar-Airways booking bar: a dark navy band with a tab row
 * (Flights / My Bookings / Flight Status, the active one carrying a gold
 * underline) and, below the tabs, a single horizontal row of search fields
 * (From / To, trip type, dates, passengers) plus a gold circular Search
 * button. All values come from authored content and are display-only.
 *
 * Authored content model (as produced by the parser, one cell per row, each
 * cell holding a stack of <p> elements):
 *   Row 1 ("Tabs"):          Flights, My Bookings, Flight Status
 *   Row 2 ("Flights search"): From: ..., To: ..., Trip type: ..., Dates: ...,
 *                             Passengers: ..., <option text>, Action: Search
 *
 * The decorate function is defensive: any missing field falls back to a
 * sensible default so the widget always renders as a complete static example.
 */

function textLines(cell) {
  if (!cell) return [];
  return [...cell.querySelectorAll('p')]
    .map((p) => p.textContent.trim())
    .filter(Boolean);
}

// Split a "Label: value" paragraph into { label, value }.
function splitLabelled(line) {
  const idx = line.indexOf(':');
  if (idx === -1) return { label: '', value: line.trim() };
  return {
    label: line.slice(0, idx).trim(),
    value: line.slice(idx + 1).trim(),
  };
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// Build a labelled field: small caps label above a larger value.
function field(label, value, extraClass = '') {
  const wrap = el('div', `booking-widget-field ${extraClass}`.trim());
  if (label) wrap.append(el('span', 'booking-widget-field-label', label));
  wrap.append(el('span', 'booking-widget-field-value', value));
  return wrap;
}

export default function decorate(block) {
  const rows = [...block.children];

  // Row 1 = tabs. The first <p> is the section title ("Tabs"), the rest are labels.
  const tabsCell = rows[0] ? rows[0].querySelector(':scope > div') || rows[0] : null;
  let tabLabels = textLines(tabsCell);
  if (tabLabels[0] && /^tabs$/i.test(tabLabels[0])) tabLabels = tabLabels.slice(1);
  if (!tabLabels.length) tabLabels = ['Flights', 'My Bookings', 'Flight Status'];

  // Row 2 = flights search. First <p> is the title ("Flights search").
  const searchCell = rows[1] ? rows[1].querySelector(':scope > div') || rows[1] : null;
  let searchLines = textLines(searchCell);
  if (searchLines[0] && /^flights search$/i.test(searchLines[0])) {
    searchLines = searchLines.slice(1);
  }

  const values = {};
  let optionText = 'Show Premium Business class only';
  searchLines.forEach((line) => {
    const { label, value } = splitLabelled(line);
    const key = label.toLowerCase();
    if (key === 'from') values.from = value;
    else if (key === 'to') values.to = value;
    else if (key === 'trip type' || key === 'trip') values.trip = value;
    else if (key === 'dates') values.dates = value;
    else if (key === 'passengers') values.passengers = value;
    else if (key === 'action') values.action = value;
    else if (!label) optionText = value; // unlabelled line = the option text
  });

  const from = values.from || 'CAI - Cairo, Egypt';
  const to = values.to || 'Your Destination';
  const trip = values.trip || 'Round Trip';
  const dates = values.dates || '07/27/2026 - 07/29/2026';
  const passengers = values.passengers || '(1)';
  const searchLabel = values.action || 'Search';

  // Split "CAI - Cairo, Egypt" into a code + city pair when possible.
  const splitCity = (raw, fallbackCode) => {
    const parts = raw.split(/\s*-\s*/);
    if (parts.length >= 2) {
      return { code: parts[0].trim(), city: parts.slice(1).join(' - ').trim() };
    }
    return { code: fallbackCode, city: raw.trim() };
  };
  const fromLoc = splitCity(from, 'From');
  const toLoc = splitCity(to, 'To');

  block.textContent = '';

  // --- Tabs -----------------------------------------------------------------
  const tabList = el('div', 'booking-widget-tabs');
  tabList.setAttribute('role', 'tablist');
  tabLabels.forEach((label, idx) => {
    const tab = el('button', 'booking-widget-tab', label);
    tab.type = 'button';
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
    if (idx === 0) tab.classList.add('is-active');
    tab.addEventListener('click', () => {
      tabList.querySelectorAll('.booking-widget-tab').forEach((t) => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
    });
    tabList.append(tab);
  });

  // --- Search panel ---------------------------------------------------------
  const panel = el('div', 'booking-widget-panel');
  panel.setAttribute('role', 'tabpanel');

  const fieldsRow = el('div', 'booking-widget-fields');

  // From / swap / To grouped as one route field.
  const route = el('div', 'booking-widget-route');
  const fromField = field(fromLoc.city, fromLoc.code, 'booking-widget-airport');
  const swap = el('span', 'booking-widget-swap');
  swap.setAttribute('aria-hidden', 'true');
  const toField = field(toLoc.city, toLoc.code, 'booking-widget-airport');
  route.append(fromField, swap, toField);
  fieldsRow.append(route);

  fieldsRow.append(field('', trip, 'booking-widget-trip has-caret'));
  fieldsRow.append(field('', dates, 'booking-widget-dates'));
  fieldsRow.append(field('', `Passengers ${passengers}`, 'booking-widget-passengers has-caret'));

  const searchBtn = el('button', 'booking-widget-search');
  searchBtn.type = 'button';
  const searchText = /^search$/i.test(searchLabel) ? 'Search flights' : searchLabel;
  searchBtn.setAttribute('aria-label', searchText);
  searchBtn.append(el('span', 'booking-widget-search-label', searchText));
  fieldsRow.append(searchBtn);

  // --- Options row ----------------------------------------------------------
  const options = el('div', 'booking-widget-options');
  options.append(el('span', 'booking-widget-options-title', 'Search Options'));
  const optToggle = el('label', 'booking-widget-option-toggle');
  const box = el('span', 'booking-widget-checkbox');
  box.setAttribute('aria-hidden', 'true');
  optToggle.append(box, el('span', undefined, optionText));
  options.append(optToggle);

  panel.append(fieldsRow, options);
  block.append(tabList, panel);
}
