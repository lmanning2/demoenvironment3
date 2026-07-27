/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import bookingWidgetParser from './parsers/booking-widget.js';
import carouselHeroParser from './parsers/carousel-hero.js';
import cardsQuicklinksParser from './parsers/cards-quicklinks.js';
import cardsFeaturesParser from './parsers/cards-features.js';
import carouselFaresParser from './parsers/carousel-fares.js';
import cardsNewsParser from './parsers/cards-news.js';
import heroAppParser from './parsers/hero-app.js';
import accordionParser from './parsers/accordion.js';
import newsletterParser from './parsers/newsletter.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/nileair-cleanup.js';
import sectionsTransformer from './transformers/nileair-sections.js';

// PARSER REGISTRY
const parsers = {
  'booking-widget': bookingWidgetParser,
  'carousel-hero': carouselHeroParser,
  'cards-quicklinks': cardsQuicklinksParser,
  'cards-features': cardsFeaturesParser,
  'carousel-fares': carouselFaresParser,
  'cards-news': cardsNewsParser,
  'hero-app': heroAppParser,
  accordion: accordionParser,
  newsletter: newsletterParser,
};

// TRANSFORMER REGISTRY (cleanup first, then section breaks/metadata)
const transformers = [cleanupTransformer, sectionsTransformer];

// PAGE TEMPLATE CONFIGURATION (embedded from page-templates.json)
const PAGE_TEMPLATE = {
  name: 'home',
  description: 'Nile Air home page styled after Qatar Airways homepage.',
  urls: ['https://www.nileair.com/'],
  blocks: [
    { name: 'booking-widget', instances: ['body > div.header-bottom.gray_bg'] },
    { name: 'carousel-hero', instances: ['#layout-content > div.slider_area'] },
    { name: 'section-quicklinks', instances: ['#layout-content > div.feature-area.demo_bg'], section: 'grey' },
    { name: 'cards-quicklinks', instances: ['#layout-content > div.feature-area.demo_bg'] },
    { name: 'cards-features', instances: ['#layout-content > div.choose-area.pb-4'] },
    { name: 'carousel-fares', instances: ['#layout-content > div.promotions_area'] },
    { name: 'cards-news', instances: ['#layout-content > div.news-area', '#layout-content > div.container'] },
    { name: 'hero-app', instances: ['#layout-content > div.app-area.max-bg'] },
    { name: 'section-faq', instances: ['#layout-content > div.faq-area.gray_bg'], section: 'dark' },
    { name: 'accordion', instances: ['#layout-content > div.faq-area.gray_bg'] },
    { name: 'newsletter', instances: ['#layout-content > div.newsletter-area'] },
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
  template.blocks
    .filter((b) => !b.name.startsWith('section-'))
    .forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
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
    const seen = new Set();
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      if (seen.has(block.element)) return;
      seen.add(block.element);
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
