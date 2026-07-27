/**
 * Newsletter signup (static visual example)
 *
 * Renders a heading + subtext (from the first authored cell / default content
 * placed above) alongside an email input and a subscribe button. This is a
 * display-only widget for the migration; it does not submit anywhere.
 *
 * Expected content model (table rows):
 *   Row 1 (block name): newsletter
 *   Row: | Sign up for Exclusive Online Offers\nExclusive access... |
 *   Optional row: | placeholder | Email Address |
 *   Optional row: | button | Subscribe! |
 */

export default function decorate(block) {
  const rows = [...block.children];
  let heading = '';
  let subtext = '';
  let placeholder = 'Email Address';
  let buttonLabel = 'Subscribe!';

  rows.forEach((row) => {
    const cells = [...row.children];
    const key = cells[0] ? cells[0].textContent.trim().toLowerCase() : '';
    if (key === 'placeholder' && cells[1]) {
      placeholder = cells[1].textContent.trim();
    } else if (key === 'button' && cells[1]) {
      buttonLabel = cells[1].textContent.trim();
    } else {
      // treat as content cell (heading + subtext)
      const h = row.querySelector('h1, h2, h3, h4, h5, h6');
      if (h && !heading) heading = h.textContent.trim();
      const p = row.querySelector('p');
      if (p && !subtext) subtext = p.textContent.trim();
      if (!h && !p && cells[0] && !heading) heading = cells[0].textContent.trim();
    }
  });

  block.textContent = '';

  const intro = document.createElement('div');
  intro.className = 'newsletter-intro';
  if (heading) {
    const h = document.createElement('h2');
    h.textContent = heading;
    intro.append(h);
  }
  if (subtext) {
    const p = document.createElement('p');
    p.textContent = subtext;
    intro.append(p);
  }

  const form = document.createElement('div');
  form.className = 'newsletter-form';
  const input = document.createElement('input');
  input.type = 'email';
  input.className = 'newsletter-input';
  input.setAttribute('placeholder', placeholder);
  input.setAttribute('aria-label', placeholder);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'newsletter-button';
  button.textContent = buttonLabel;
  form.append(input, button);

  block.append(intro, form);
}
