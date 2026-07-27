/**
 * Contact Form (static visual example)
 *
 * This is NOT a functional form. The AEM Forms plugin is not enabled for this
 * DA migration, so - like the hardcoded booking-widget and the static
 * newsletter block - this renders a display-only visual representation of the
 * Nile Air pet-travel contact form: labelled fields, a subject dropdown, a
 * two-column email/mobile row, a message textarea and a Send button. Nothing
 * is submitted anywhere.
 *
 * Expected content model (table rows). The first cell of each row is a key:
 *   Row 1 (block name): contact-form
 *   Row "text":     | text     | name          | Name                      | Your name          |
 *   Row "select":   | select   | subject       | Why do you need to...     | opt1, opt2 |
 *   Row "email":    | email    | email         | Email                     | email@domain.com   |
 *   Row "tel":      | tel      | phone         | Mobile number             | Mobile number      |
 *   Row "textarea": | textarea | message-body  | Message                   |                    |
 *   Row "submit":   | submit   | Send          |
 *
 * Cell layout per field row: [ type | name | label | placeholder-or-options ]
 * For a "select" row the 4th cell is a comma-separated list of options.
 * The first "email" and first "tel"/"text" that follow are paired into a
 * side-by-side row automatically (matching the source's two-column layout).
 * Missing rows fall back to sensible defaults so the form always renders.
 */

function readRows(block) {
  return [...block.children].map((row) => [...row.children].map((c) => c.textContent.trim()));
}

function makeLabel(text, htmlFor) {
  const label = document.createElement('label');
  label.className = 'contact-form-label';
  if (htmlFor) label.setAttribute('for', htmlFor);
  label.textContent = text;
  return label;
}

function makeField(def) {
  const wrap = document.createElement('div');
  wrap.className = 'contact-form-field';

  const id = `contact-form-${def.name}`;
  wrap.append(makeLabel(def.label, id));

  let control;
  if (def.type === 'textarea') {
    control = document.createElement('textarea');
    control.rows = 3;
  } else if (def.type === 'select') {
    control = document.createElement('select');
    (def.options || []).forEach((opt, idx) => {
      const option = document.createElement('option');
      option.textContent = opt;
      option.value = idx === 0 ? '' : opt;
      if (idx === 0) option.selected = true;
      control.append(option);
    });
  } else {
    control = document.createElement('input');
    control.type = def.type === 'tel' ? 'text' : def.type;
  }
  control.className = 'contact-form-control';
  control.id = id;
  control.name = def.name;
  if (def.placeholder) control.setAttribute('placeholder', def.placeholder);
  control.setAttribute('aria-label', def.label);
  wrap.append(control);
  return wrap;
}

export default function decorate(block) {
  const rows = readRows(block);

  const fields = [];
  let submitLabel = 'Send';

  rows.forEach((cells) => {
    const key = (cells[0] || '').toLowerCase();
    if (key === 'submit') {
      submitLabel = cells[1] || 'Send';
    } else if (['text', 'email', 'tel', 'select', 'textarea'].includes(key)) {
      fields.push({
        type: key,
        name: cells[1] || key,
        label: cells[2] || cells[1] || '',
        placeholder: key === 'select' ? '' : (cells[3] || ''),
        options: key === 'select'
          ? (cells[3] || '').split(',').map((s) => s.trim()).filter(Boolean)
          : null,
      });
    }
  });

  // Fallback content so the static example always renders.
  if (fields.length === 0) {
    fields.push(
      {
        type: 'text', name: 'name', label: 'Name', placeholder: 'Your name',
      },
      {
        type: 'select',
        name: 'subject',
        label: 'Why do you need to contact us?',
        options: ['Select Subject', 'Contact us Regardign Travelling With Pets'],
      },
      {
        type: 'email', name: 'email', label: 'Email', placeholder: 'email@domain.com',
      },
      {
        type: 'tel', name: 'phone', label: 'Mobile number', placeholder: 'Mobile number',
      },
      { type: 'textarea', name: 'message-body', label: 'Message' },
    );
  }

  block.textContent = '';

  const form = document.createElement('form');
  form.className = 'contact-form-form';
  form.setAttribute('novalidate', '');
  // Display-only: prevent any accidental submission/navigation.
  form.addEventListener('submit', (e) => e.preventDefault());

  // Pair a consecutive email + tel/text field into a two-column row.
  for (let i = 0; i < fields.length; i += 1) {
    const def = fields[i];
    const next = fields[i + 1];
    if (
      def.type === 'email'
      && next
      && (next.type === 'tel' || next.type === 'text')
    ) {
      const row = document.createElement('div');
      row.className = 'contact-form-row';
      row.append(makeField(def), makeField(next));
      form.append(row);
      i += 1;
    } else {
      form.append(makeField(def));
    }
  }

  const submit = document.createElement('button');
  submit.type = 'button';
  submit.className = 'contact-form-submit';
  submit.textContent = submitLabel;
  form.append(submit);

  block.append(form);
}
