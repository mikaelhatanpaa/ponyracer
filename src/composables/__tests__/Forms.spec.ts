import { describe, expect, test } from 'vitest';
import { isOldEnough } from '@/composables/Forms';

describe('Forms', () => {
  describe('isOldEnough', () => {
    test('should validate if a user is old enough', () => {
      const currentYearMinus17 = new Date().getFullYear() - 17;

      expect(isOldEnough(currentYearMinus17)).toBe(false);

      const currentYearMinus18 = new Date().getFullYear() - 18;

      expect(isOldEnough(currentYearMinus18)).toBe(true);

      const currentYearMinus19 = new Date().getFullYear() - 19;

      expect(isOldEnough(currentYearMinus19)).toBe(true);
    });
  });
});
