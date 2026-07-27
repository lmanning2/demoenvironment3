/* eslint-disable */
/* global WebImporter */
/**
 * Parser for newsletter.
 * Base: newsletter (new static block).
 * Source: https://www.nileair.com/ (#layout-content > div.newsletter-area)
 * Generated: 2026-07-27
 *
 * Static email-capture widget. The AEM Forms plugin is not enabled for this DA
 * migration, so — like booking-widget and contact-form — the newsletter is a static
 * visual example. The parser emits a stable single-column table modelling the
 * heading, subtext, email placeholder and subscribe button described in the
 * home authoring-analysis. Not a functional form.
 */
export default function parse(element, { document }) {
  // Prefer real source content; fall back to the documented static example.
  const srcHeading = element.querySelector('h1, h2, h3, .title');
  const srcSubtext = element.querySelector('p');
  const srcInput = element.querySelector('input');
  const srcButton = element.querySelector('button, a.btn');

  const heading = document.createElement('h2');
  heading.textContent = (srcHeading && srcHeading.textContent.trim()) || 'Sign up for Exclusive Online Offers';

  const subtext = document.createElement('p');
  subtext.textContent = (srcSubtext && srcSubtext.textContent.trim())
    || 'Exclusive access to special offers and promotions.';

  const placeholder = (srcInput && (srcInput.getAttribute('placeholder') || '').trim()) || 'Email Address';
  const emailField = document.createElement('p');
  const emailLabel = document.createElement('strong');
  emailLabel.textContent = 'Email: ';
  emailField.append(emailLabel, document.createTextNode(placeholder));

  const button = document.createElement('p');
  const buttonStrong = document.createElement('strong');
  buttonStrong.textContent = (srcButton && srcButton.textContent.trim()) || 'Subscribe!';
  button.appendChild(buttonStrong);

  const cells = [
    [[heading, subtext, emailField, button]],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'newsletter', cells });
  element.replaceWith(block);
}
