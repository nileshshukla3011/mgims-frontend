// Pre-publication content checks against GIGW 3.0 / UX4G / WCAG (WEB-CMP-6, WEB-RPT-3, WEB-IA-4). They run on the
// text an editor submits, so problems are caught before content goes live. Errors block submission; warnings do not.
// Page-level checks (contrast, structure) run in the site's automated accessibility tests instead.

export type IssueSeverity = 'error' | 'warning';

export interface ContentIssue {
  rule: string;
  severity: IssueSeverity;
  /** Field name as shown to the editor, e.g. "Overview". */
  field: string;
  message: string;
  excerpt?: string;
  guideline: string;
}

interface Rule {
  id: string;
  severity: IssueSeverity;
  guideline: string;
  test: (text: string) => string | null;
  message: string;
}

const excerptAround = (text: string, index: number, length = 60) =>
  `${index > 20 ? '…' : ''}${text.slice(Math.max(0, index - 20), index + length).trim()}${index + length < text.length ? '…' : ''}`;

const firstMatch = (re: RegExp) => (text: string) => {
  const m = re.exec(text);
  return m ? excerptAround(text, m.index) : null;
};

const RULES: Rule[] = [
  {
    id: 'placeholder',
    severity: 'error',
    guideline: 'GIGW 3.0 content quality',
    message: 'Placeholder text is still in the content.',
    test: firstMatch(/lorem ipsum|\bTBD\b|\bTODO\b|\bxx{2,}\b|\[insert[^\]]*\]/i),
  },
  {
    id: 'markup',
    severity: 'error',
    guideline: 'GIGW 3.0 content quality',
    message: 'HTML tags or codes such as &amp;nbsp; were pasted into the text. Remove them.',
    test: firstMatch(/&(amp|nbsp|quot|lt|gt|#\d+);|<\/?[a-z][a-z0-9]*(\s[^>]*)?>/i),
  },
  {
    id: 'vague-link-text',
    severity: 'warning',
    guideline: 'WCAG 2.4.4 Link purpose',
    message: 'Words like "click here" or "read more" do not say where a link goes. Name the destination instead.',
    test: firstMatch(/\b(click here|read more|more details here|see here)\b/i),
  },
  {
    id: 'bare-url',
    severity: 'warning',
    guideline: 'WCAG 2.4.4 Link purpose',
    message: 'A web address is written out in full. Screen readers read it letter by letter; describe the page instead.',
    test: firstMatch(/https?:\/\/\S{12,}/i),
  },
  {
    id: 'file-format',
    severity: 'warning',
    guideline: 'GIGW 3.0: downloadable files show format and size',
    message: 'A document is mentioned without its format and size, e.g. "(PDF, 1.2 MB)".',
    test: (text) => {
      const m = /\S+\.(pdf|docx?|xlsx?|pptx?)\b/i.exec(text);
      return m && !/\((pdf|word|excel|powerpoint|docx?|xlsx?)[^)]*\b(kb|mb)\)/i.test(text) ? excerptAround(text, m.index) : null;
    },
  },
  {
    id: 'all-caps',
    severity: 'warning',
    guideline: 'UX4G readability',
    message: 'Long runs of CAPITAL LETTERS are hard to read. Use sentence case.',
    test: firstMatch(/\b[A-Z][A-Z'&-]+(\s+[A-Z][A-Z'&-]+){3,}\b/),
  },
  {
    id: 'colour-only',
    severity: 'warning',
    guideline: 'WCAG 1.4.1 Use of colour',
    message: 'Instructions should not depend on colour alone ("the red button").',
    test: firstMatch(/\b(in|the) (red|green|blue|yellow|orange) (text|button|box|link|part)\b/i),
  },
  {
    id: 'sensory',
    severity: 'warning',
    guideline: 'WCAG 1.3.3 Sensory characteristics',
    message: 'Instructions should not depend on position alone ("see the box on the right").',
    test: firstMatch(/\b(on|to) the (left|right)( side)?\b|\b(see|shown) (above|below)\b/i),
  },
  {
    id: 'space-before-punctuation',
    severity: 'warning',
    guideline: 'GIGW 3.0 content quality',
    message: 'There is a space before a comma or full stop.',
    test: firstMatch(/\w\s+[,.;:](\s|$)/),
  },
];

const words = (sentence: string) => sentence.trim().split(/\s+/).filter(Boolean).length;

/** Checks one text field. `required` and `maxLength` add the empty and too-long checks. */
export function checkText(field: string, text: string | undefined, options: { required?: boolean; maxLength?: number; paragraph?: boolean } = {}): ContentIssue[] {
  const value = (text ?? '').trim();
  const issues: ContentIssue[] = [];
  if (!value) {
    if (options.required) issues.push({ rule: 'empty', severity: 'error', field, message: `${field} is empty.`, guideline: 'GIGW 3.0 content quality' });
    return issues;
  }
  for (const rule of RULES) {
    const excerpt = rule.test(value);
    if (excerpt) issues.push({ rule: rule.id, severity: rule.severity, field, message: rule.message, excerpt, guideline: rule.guideline });
  }
  if (options.maxLength && value.length > options.maxLength) {
    issues.push({ rule: 'too-long', severity: 'warning', field, message: `${field} has ${value.length} characters; keep it under ${options.maxLength}.`, guideline: 'UX4G readability' });
  }
  if (options.paragraph !== false) {
    const longSentence = value.split(/(?<=[.!?])\s+/).find((s) => words(s) > 45);
    if (longSentence) issues.push({ rule: 'long-sentence', severity: 'warning', field, message: 'A sentence has more than 45 words. Split it so it is easier to read.', excerpt: excerptAround(longSentence, 0), guideline: 'UX4G plain language' });
    if (value.length > 1500 && !value.includes('\n')) issues.push({ rule: 'long-paragraph', severity: 'warning', field, message: 'A paragraph is longer than 1,500 characters. Break it into shorter paragraphs.', guideline: 'UX4G readability' });
  }
  return issues;
}

/** Checks an image's text alternative (WCAG 1.1.1). */
export function checkAltText(field: string, alt: string | undefined, fileName: string): ContentIssue[] {
  const value = (alt ?? '').trim();
  if (!value) return [{ rule: 'alt-missing', severity: 'error', field, message: 'Describe the image for people who cannot see it.', guideline: 'WCAG 1.1.1 Non-text content' }];
  if (/\.(jpe?g|png|gif|webp)$/i.test(value) || value.toLowerCase() === fileName.toLowerCase()) {
    return [{ rule: 'alt-file-name', severity: 'error', field, message: 'The description is a file name. Say what the image shows.', guideline: 'WCAG 1.1.1 Non-text content' }];
  }
  if (/^(image|photo|picture|img)( of)?\b/i.test(value)) {
    return [{ rule: 'alt-redundant', severity: 'warning', field, message: 'Do not start with "image of"; screen readers already say it is an image.', guideline: 'WCAG 1.1.1 Non-text content' }];
  }
  return [];
}

export const hasErrors = (issues: ContentIssue[]) => issues.some((i) => i.severity === 'error');
