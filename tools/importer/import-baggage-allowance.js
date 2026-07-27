/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroCoverParser from './parsers/hero-cover.js';
import tableParser from './parsers/table.js';
import accordionParser from './parsers/accordion.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/nileair-cleanup.js';
import sectionsTransformer from './transformers/nileair-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-cover': heroCoverParser,
  table: tableParser,
  accordion: accordionParser,
};

// TRANSFORMER REGISTRY
const transformers = [cleanupTransformer, sectionsTransformer];

// PAGE TEMPLATE CONFIGURATION (embedded from page-templates.json)
const PAGE_TEMPLATE = {
  name: 'baggage-allowance',
  description: 'Nile Air baggage allowance page styled after Qatar Airways baggage/allowance.',
  urls: ['https://www.nileair.com/baggage-allowance'],
  blocks: [
    { name: 'hero-cover', instances: ['#layout-content > div.page-wrapper:nth-of-type(2)'] },
    { name: 'table', instances: ['#layout-content > div.page-wrapper:nth-of-type(3) table', '#layout-content table.table'] },
    { name: 'accordion', instances: ['#baggage-allowance-faqs', '#layout-content > div.page-wrapper:nth-of-type(6) div.faq-box-area'] },
  ],
};

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();
  template.blocks
    .filter((b) => !b.name.startsWith('section-'))
    .forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
        });
      });
    });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/',
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
