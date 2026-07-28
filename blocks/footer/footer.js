import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// Inline brand-agnostic social glyphs keyed by the platform name in the link text.
const SOCIAL_ICONS = {
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V13h2.6v8h3.6z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.9 8.8H3.6V21h3.3V8.8zM5.3 3.4A1.9 1.9 0 105.3 7.2a1.9 1.9 0 000-3.8zM21 21h-3.3v-6c0-1.5-.5-2.5-1.9-2.5-1 0-1.6.7-1.9 1.4-.1.2-.1.6-.1.9V21H10.5s.1-11.1 0-12.2h3.3v1.7c.4-.7 1.2-1.7 3-1.7 2.2 0 3.9 1.4 3.9 4.5V21z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4.5c2.4 0 2.7 0 3.6.1 2.5.1 3.6 1.3 3.7 3.7 0 .9.1 1.2.1 3.6s0 2.7-.1 3.6c-.1 2.4-1.3 3.6-3.7 3.7-.9.1-1.2.1-3.6.1s-2.7 0-3.6-.1c-2.5-.1-3.6-1.3-3.7-3.7C4.5 14.7 4.5 14.4 4.5 12s0-2.7.1-3.6C4.7 5.9 5.9 4.7 8.3 4.6c.9 0 1.3-.1 3.7-.1zM12 2.7c-2.5 0-2.8 0-3.7.1-3.3.1-5.1 2-5.3 5.3C3 9 3 9.3 3 12s0 2.9.1 3.9c.1 3.3 2 5.1 5.3 5.3.9 0 1.2.1 3.7.1s2.8 0 3.7-.1c3.3-.1 5.1-2 5.3-5.3 0-.9.1-1.2.1-3.9s0-2.9-.1-3.9c-.1-3.3-2-5.1-5.3-5.3-.9 0-1.2-.1-3.8-.1zM12 7.1a4.9 4.9 0 100 9.8 4.9 4.9 0 000-9.8zm0 8.1a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4zM17.1 5.8a1.1 1.1 0 100 2.3 1.1 1.1 0 000-2.3z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.5 3h3.1l-6.8 7.7L21.8 21h-6.2l-4.9-6.4L5.1 21H2l7.3-8.3L2.2 3h6.4l4.4 5.8L17.5 3zm-1.1 16.1h1.7L7.6 4.8H5.8l10.6 14.3z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.6 7.2c-.2-.9-.9-1.6-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8c.2.9.9 1.6 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3-5.2 3z"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.6 3c.3 2.2 1.6 3.6 3.7 3.8v2.4c-1.2.1-2.3-.3-3.6-1v6.4c0 4.6-5 6-7.6 2.7-1.7-2.2-.9-6 3.4-6.1v2.5c-.3 0-.7.1-1 .2-1 .3-1.5 1-1.4 2 .2 1.9 3.6 2.4 3.3-1.3V3h3.2z"/></svg>',
};

function iconFor(name) {
  const key = name.trim().toLowerCase();
  return SOCIAL_ICONS[key] || '';
}

export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Column groups (2nd wrapper): make each h2 a collapsible toggle with a chevron.
  const columns = footer.children[1];
  if (columns) {
    columns.querySelectorAll('h2').forEach((h2) => {
      const group = h2.closest('div') || h2.parentElement;
      const list = group.querySelector('ul');
      h2.setAttribute('role', 'button');
      h2.setAttribute('tabindex', '0');
      h2.setAttribute('aria-expanded', 'false');
      if (list) list.id = list.id || `footer-col-${Math.random().toString(36).slice(2, 8)}`;
      if (list) h2.setAttribute('aria-controls', list.id);
      const toggle = () => {
        const open = h2.getAttribute('aria-expanded') === 'true';
        h2.setAttribute('aria-expanded', open ? 'false' : 'true');
      };
      h2.addEventListener('click', toggle);
      h2.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });
  }

  // Social row (3rd wrapper): swap text links for brand-agnostic SVG icons.
  const social = footer.children[2];
  if (social) {
    social.querySelectorAll('li a').forEach((a) => {
      const svg = iconFor(a.textContent);
      if (svg) {
        a.setAttribute('aria-label', a.textContent.trim());
        a.innerHTML = svg;
        a.classList.add('footer-social-icon');
      }
    });
  }

  block.append(footer);
}
