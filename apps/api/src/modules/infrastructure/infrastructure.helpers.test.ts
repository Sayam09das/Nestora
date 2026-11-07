import { describe, expect, it } from 'vitest';
import { defaultBedNumbers } from './infrastructure.helpers.js';

describe('defaultBedNumbers', () => {
  it('creates sequential bed labels up to room capacity', () => {
    expect(defaultBedNumbers(1)).toEqual(['1']);
    expect(defaultBedNumbers(3)).toEqual(['1', '2', '3']);
  });
});
