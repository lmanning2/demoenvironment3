/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Nile Air (nileair.com) section breaks + section metadata.
 *
 * The home template renders 9 authorable sections. Two of them carry section
 * styling that must survive the import as Section Metadata blocks:
 *   - Quick-links  -> style "grey"  (#layout-content > div.feature-area.demo_bg)
 *   - FAQ          -> style "dark"  (#layout-content > div.faq-area.gray_bg)
 *
 * The page-templates.json schema for this migration expresses sections through
 * `blocks[].section` markers (rather than a top-level `sections` array), so this
 * transformer derives the ordered section list from `payload.template.blocks`:
 * each block's first instance selector is a top-level section container, and
 * blocks that share a container are the same section (de-duplicated). For each
 * section after the first we insert an <hr> before it, and for each section with
 * a `section` style marker we insert a Section Metadata block.
 *
 * All selectors come from the captured DOM (page-structure.json section selectors
 * and page-templates.json block instances). Section styles come from the template.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

/**
 * Build the ordered, de-duplicated list of sections from the template blocks.
 * Blocks sharing the same top-level container selector belong to one section.
 * A section's style is the first non-empty `section` marker among its blocks.
 * @returns {Array<{ selector: string, style: string|undefined }>}
 */
function getSectionsFromTemplate(payload) {
  const blocks = (payload && payload.template && payload.template.blocks) || [];
  const sections = [];
  const seen = new Map();
  blocks.forEach((block) => {
    const selector = block.instances && block.instances[0];
    if (!selector) return;
    if (seen.has(selector)) {
      // Same container: adopt a style marker if this block carries one.
      if (block.section && !seen.get(selector).style) {
        seen.get(selector).style = block.section;
      }
      return;
    }
    const entry = { selector, style: block.section };
    seen.set(selector, entry);
    sections.push(entry);
  });
  return sections;
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const sections = getSectionsFromTemplate(payload);
    if (sections.length < 2) return;

    const doc = element.ownerDocument;

    // Process in reverse so inserted nodes never shift the elements still to come.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const { selector, style } = sections[i];
      const sectionEl = element.querySelector(selector);
      if (!sectionEl) continue;

      // Section Metadata block for styled sections (grey / dark).
      if (style) {
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style },
        });
        sectionEl.after(metadataBlock);
      }

      // Section break before every section except the first.
      if (i > 0) {
        sectionEl.before(doc.createElement('hr'));
      }
    }
  }
}
