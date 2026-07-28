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
  snapchat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.3c2.4 0 4.4 1.9 4.5 4.3 0 .6 0 1.2-.1 1.8.2.1.5.2.8.2.4 0 .8-.2 1-.3.2-.1.3-.1.5-.1.4 0 .8.3.8.7 0 .5-.6.8-1.2 1-.4.2-.9.3-1 .6-.1.2 0 .5.2.8.7 1.3 1.8 2 3 2.4.4.1.6.3.6.6 0 .6-1.3 1-2 1.1-.1 0-.2.2-.3.5-.1.3-.2.6-.6.6-.3 0-.6-.1-1-.2-.4-.1-.9-.2-1.5-.2-.4 0-.7 0-1 .1-.7.2-1.3.9-2.5.9s-1.8-.7-2.5-.9c-.3-.1-.6-.1-1-.1-.6 0-1.1.1-1.5.2-.4.1-.7.2-1 .2-.4 0-.5-.3-.6-.6-.1-.3-.2-.5-.3-.5-.7-.1-2-.5-2-1.1 0-.3.2-.5.6-.6 1.2-.4 2.3-1.1 3-2.4.2-.3.3-.6.2-.8-.1-.3-.6-.4-1-.6-.6-.2-1.2-.5-1.2-1 0-.4.4-.7.8-.7.2 0 .3 0 .5.1.2.1.6.3 1 .3.3 0 .6-.1.8-.2-.1-.6-.1-1.2-.1-1.8C7.6 4.2 9.6 2.3 12 2.3z"/></svg>',
};

function iconFor(name) {
  const key = name.trim().toLowerCase();
  return SOCIAL_ICONS[key] || '';
}

// Turn a heading into an accessible collapsible toggle for its sibling list.
function makeCollapsible(heading, list) {
  heading.setAttribute('role', 'button');
  heading.setAttribute('tabindex', '0');
  heading.setAttribute('aria-expanded', 'false');
  if (list) {
    list.id = list.id || `footer-col-${Math.random().toString(36).slice(2, 8)}`;
    heading.setAttribute('aria-controls', list.id);
  }
  const toggle = () => {
    const open = heading.getAttribute('aria-expanded') === 'true';
    heading.setAttribute('aria-expanded', open ? 'false' : 'true');
  };
  heading.addEventListener('click', toggle);
  heading.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
}

export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Classify each top-level section by its content — the DA fragment structure
  // varies (headings may be any level, groups may share one section), so we
  // detect by content instead of relying on element order.
  [...footer.children].forEach((sec) => {
    const wrapper = sec.querySelector(':scope > .default-content-wrapper') || sec;
    const headings = [...wrapper.querySelectorAll('h1, h2, h3, h4, h5, h6')];
    const lists = [...wrapper.querySelectorAll('ul')];
    const hasImg = !!wrapper.querySelector('img');

    // Brand/logo row: an image and no link lists.
    if (hasImg && lists.length === 0) {
      sec.classList.add('footer-brand');
      return;
    }

    // Column groups: two or more headings, each followed by a link list.
    if (headings.length >= 2) {
      sec.classList.add('footer-columns');
      headings.forEach((h) => {
        const col = document.createElement('div');
        col.className = 'footer-column';
        h.replaceWith(col);
        col.append(h);
        // Absorb following siblings up to the next heading/column.
        let next = col.nextElementSibling;
        while (next && !/^H[1-6]$/.test(next.tagName) && !next.classList.contains('footer-column')) {
          const move = next;
          next = next.nextElementSibling;
          col.append(move);
        }
        makeCollapsible(h, col.querySelector('ul'));
      });
      return;
    }

    // Social row: a list whose links match known platforms.
    if (lists.length >= 1) {
      const links = [...lists[0].querySelectorAll('a')];
      const socialMatches = links.filter((a) => iconFor(a.textContent)).length;
      if (socialMatches >= 2) {
        sec.classList.add('footer-social');
        links.forEach((a) => {
          const svg = iconFor(a.textContent);
          if (svg) {
            a.setAttribute('aria-label', a.textContent.trim());
            a.innerHTML = svg;
            a.classList.add('footer-social-icon');
          }
        });
        return;
      }
      // Otherwise a legal / policy links row.
      sec.classList.add('footer-legal');
    }
  });

  block.append(footer);
}
