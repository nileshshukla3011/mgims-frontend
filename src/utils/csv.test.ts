import { describe, expect, it } from 'vitest';
import { toCsv } from '@/utils/csv';

describe('CSV export', () => {
  it('quotes cells and neutralises formulas (CSV injection)', () => {
    const csv = toCsv([['Name', 'Note'], ['A, B', 'He said "yes"'], ['=SUM(A1)', null]]);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv.slice(1).split('\r\n')).toEqual(['Name,Note', '"A, B","He said ""yes"""', "'=SUM(A1),"]);
  });
});
