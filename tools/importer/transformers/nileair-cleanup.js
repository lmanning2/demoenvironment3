/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Nile Air (nileair.com) site-wide cleanup.
 *
 * Removes non-authorable site chrome so the import contains only page-level
 * authorable content. Header/nav, the social-icon row and the footer are
 * auto-populated by the EDS header/footer blocks and must not be imported as
 * page content.
 *
 * All selectors are taken from the captured DOM, documented in each page's
 * migration-work/pages/<template>/page-structure.json "excludedBoilerplate":
 *   - body > header.header-area.gray_bg  -> site header/nav (header block)
 *   - body > div.social-section.gray_bg  -> social icons row (footer/boilerplate)
 *   - #layout-footer                     -> footer (footer block)
 *
 * NOTE: `body > div.header-bottom.gray_bg` is intentionally NOT removed. Although
 * it is listed under excludedBoilerplate on the baggage/pets pages, it is the
 * flight booking widget which is mapped to the authorable `booking-widget` block
 * (template-level, reused from the home template). Its extraction is handled by
 * the block parser, so the cleanup transformer must leave it in place.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // No modals/overlays/cookie banners were found in the captured DOM for nileair.com,
    // so there is nothing that must be removed prior to block parsing.
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome (selectors from captured DOM / page-structure.json).
    WebImporter.DOMUtils.remove(element, [
      'header.header-area',
      'div.social-section',
      '#layout-footer',
    ]);

    // Safe removal of non-authorable technical elements that may appear in the
    // live page DOM but never represent page content.
    WebImporter.DOMUtils.remove(element, [
      'script',
      'style',
      'noscript',
      'iframe',
      'link',
    ]);
  }
}
