/* eslint-disable */
/* global WebImporter */
/**
 * Parser for contact-form.
 * Base: form (new static block). Source: https://www.nileair.com/travelling-pets (#contact-us)
 * Generated: 2026-07-27
 *
 * The source is a functional contact form (POSTs to /api/sendMail/pets with
 * reCAPTCHA). The AEM Forms plugin is NOT enabled for this DA migration, so — like
 * booking-widget and newsletter — this is a static visual example. The parser emits
 * a stable single-column table modelling the labelled fields (Name, subject select,
 * Email + Mobile number, Message) and the Send button described in the
 * travelling-pets authoring-analysis. Not a functional form.
 */
export default function parse(element, { document }) {
  const line = (labelText, valueText) => {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = `${labelText}: `;
    p.append(strong, document.createTextNode(valueText));
    return p;
  };

  // Field labels from source (with static example placeholders/options).
  const labelOf = (name, fallback) => {
    const input = element.querySelector(`[name="${name}"]`);
    if (input) {
      const wrap = input.closest('.mb-3, .col-md-6, div');
      const lbl = wrap && wrap.querySelector('.form-label, label');
      if (lbl && lbl.textContent.trim()) return lbl.textContent.trim();
    }
    return fallback;
  };
  const placeholderOf = (name, fallback) => {
    const input = element.querySelector(`[name="${name}"]`);
    return (input && (input.getAttribute('placeholder') || '').trim()) || fallback;
  };

  const contentCell = [];
  contentCell.push(line(labelOf('name', 'Name'), placeholderOf('name', 'Your name')));
  contentCell.push(line(labelOf('subject', 'Why do you need to contact us?'), 'Select Subject'));
  contentCell.push(line(labelOf('email', 'Email'), placeholderOf('email', 'email@domain.com')));
  contentCell.push(line(labelOf('phone', 'Mobile number'), placeholderOf('phone', 'Mobile number')));
  contentCell.push(line(labelOf('message-body', 'Message'), ''));

  const submitSrc = element.querySelector('button[type="submit"], button, input[type="submit"]');
  const submit = document.createElement('p');
  const submitStrong = document.createElement('strong');
  submitStrong.textContent = (submitSrc && submitSrc.textContent.trim()) || 'Send';
  submit.appendChild(submitStrong);
  contentCell.push(submit);

  const cells = [[contentCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'contact-form', cells });
  element.replaceWith(block);
}
