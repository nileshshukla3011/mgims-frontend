import { describe, expect, it } from 'vitest';
import { checkAltText, checkText, hasErrors } from '@/admin/contentChecks';

const rules = (text: string) => checkText('Text', text).map((i) => i.rule);

describe('content checks before publication (WEB-CMP-6)', () => {
  it('blocks placeholders and pasted markup', () => {
    expect(rules('Lorem ipsum dolor sit amet.')).toContain('placeholder');
    expect(rules('Fees &amp; charges <b>apply</b>.')).toContain('markup');
    expect(hasErrors(checkText('Text', 'TODO: add the dates.'))).toBe(true);
  });
  it('warns about vague links, bare addresses and documents without format', () => {
    expect(rules('For details click here.')).toContain('vague-link-text');
    expect(rules('See https://www.mgims.ac.in/index.php/about-us for more.')).toContain('bare-url');
    expect(rules('Download the form.pdf to apply.')).toContain('file-format');
    expect(rules('Download the form.pdf (PDF, 120 KB) to apply.')).not.toContain('file-format');
  });
  it('reports an empty required field', () => expect(checkText('Title', ' ', { required: true })[0].rule).toBe('empty'));
  it('accepts clean text', () => expect(checkText('Text', 'The OPD opens at 8 am on weekdays.')).toEqual([]));
});

describe('image descriptions (WCAG 1.1.1)', () => {
  it('requires a description that is not the file name', () => {
    expect(checkAltText('Image', '', 'camp.png')[0].rule).toBe('alt-missing');
    expect(checkAltText('Image', 'camp.png', 'camp.png')[0].rule).toBe('alt-file-name');
    expect(checkAltText('Image', 'Image of a camp', 'camp.png')[0].rule).toBe('alt-redundant');
    expect(checkAltText('Image', 'Doctors at a village health camp', 'camp.png')).toEqual([]);
  });
});
