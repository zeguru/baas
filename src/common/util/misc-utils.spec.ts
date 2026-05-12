// misc-utils.spec.ts

import {
    transformWhenStringToJson,
    coalesce,
    capitalizeTableKeys,
    looksLikeMatrix,
    normalizeMatrixSyntax,
  } from './misc-utils';
  
  describe('misc-utils', () => {
  
    describe('transformWhenStringToJson', () => {
  
      it('should return empty object for null/undefined', () => {
        expect(transformWhenStringToJson(null)).toEqual({});
        expect(transformWhenStringToJson(undefined)).toEqual({});
      });
  
      it('should return plain object unchanged', () => {
        const conditions = {
          all: [
            {
              fact: 'age',
              operator: 'greaterThan',
              value: 18,
            },
          ],
        };
  
        expect(transformWhenStringToJson(conditions)).toEqual(conditions);
      });
  
      it('should call toJSON when available', () => {
        const conditions = {
          toJSON: jest.fn(() => ({
            all: [
              {
                fact: 'salary',
                operator: 'greaterThan',
                value: 1000,
              },
            ],
          })),
        };
  
        const result = transformWhenStringToJson(conditions);
  
        expect(conditions.toJSON).toHaveBeenCalled();
  
        expect(result).toEqual({
          all: [
            {
              fact: 'salary',
              operator: 'greaterThan',
              value: 1000,
            },
          ],
        });
      });
  
      it('should parse JSON string returned by toJSON', () => {
        const conditions = {
          toJSON: jest.fn(() =>
            JSON.stringify({
              all: [
                {
                  fact: 'country',
                  operator: 'equal',
                  value: 'KE',
                },
              ],
            }),
          ),
        };
  
        const result = transformWhenStringToJson(conditions);
  
        expect(result).toEqual({
          all: [
            {
              fact: 'country',
              operator: 'equal',
              value: 'KE',
            },
          ],
        });
      });
  
      it('should remove priority field', () => {
        const conditions = {
          priority: 100,
          all: [
            {
              fact: 'score',
              operator: 'greaterThan',
              value: 50,
            },
          ],
        };
  
        const result = transformWhenStringToJson(conditions);
  
        expect(result).toEqual({
          all: [
            {
              fact: 'score',
              operator: 'greaterThan',
              value: 50,
            },
          ],
        });
  
        expect(result.priority).toBeUndefined();
      });
    });
  
    describe('coalesce', () => {
  
      it('should return first non-null/non-undefined value', () => {
        expect(coalesce<number>(undefined, null, 5, 10)).toBe(5);
      });
  
      it('should return first valid string', () => {
        expect(coalesce<string>(undefined, null, 'hello', 'world')).toBe('hello');
      });
  
      it('should return 0 when all values are null/undefined', () => {
        expect(coalesce(undefined, null)).toBe(0);
      });
  
      it('should return false as valid value', () => {
        expect(coalesce<boolean>(undefined, false, true)).toBe(false);
      });
  
      it('should return empty string as valid value', () => {
        expect(coalesce<string>(undefined, '', 'fallback')).toBe('');
      });
    });
  
    describe('capitalizeTableKeys', () => {
  
      it('should uppercase all keys', () => {
        const result = capitalizeTableKeys({
          vip: 10,
          premium: 20,
        });
  
        expect(result).toEqual({
          VIP: 10,
          PREMIUM: 20,
        });
      });
  
      it('should preserve values', () => {
        const result = capitalizeTableKeys({
          yes: true,
          no: false,
        });
  
        expect(result.YES).toBe(true);
        expect(result.NO).toBe(false);
      });
  
      it('should throw on duplicate uppercase keys', () => {
        expect(() =>
          capitalizeTableKeys({
            vip: 10,
            VIP: 20,
          }),
        ).toThrow(
          'Duplicate key after uppercasing: "VIP" -> "VIP"',
        );
      });
  
      it('should return empty object for empty input', () => {
        expect(capitalizeTableKeys({})).toEqual({});
      });
    });
  
    describe('looksLikeMatrix', () => {
  
      it('should detect matrix syntax', () => {
        expect(
          looksLikeMatrix('[[1,2],[3,4]]'),
        ).toBe(true);
      });
  
      it('should detect matrix syntax with spaces', () => {
        expect(
          looksLikeMatrix('  [[1,2],[3,4]]  '),
        ).toBe(true);
      });
  
      it('should return false for non-matrix expressions', () => {
        expect(
          looksLikeMatrix('[1,2,3]'),
        ).toBe(false);
  
        expect(
          looksLikeMatrix('1 + 2'),
        ).toBe(false);
  
        expect(
          looksLikeMatrix('matrix([[1,2],[3,4]])'),
        ).toBe(false);
      });
    });
  
    describe('normalizeMatrixSyntax', () => {
  
      it('should normalize matrix syntax', () => {
        const expr = '[[1,2],[3,4]]';
  
        const result = normalizeMatrixSyntax(expr);
  
        expect(result).toBe('[1,2;3,4]');
      });
  
      it('should normalize matrix syntax with spaces', () => {
        const expr = '[[1, 2], [3, 4]]';
  
        const result = normalizeMatrixSyntax(expr);
  
        expect(result).toBe('[1, 2;3, 4]');
      });
  
      it('should return original expression if not matrix syntax', () => {
        const expr = '1 + 2';
  
        expect(
          normalizeMatrixSyntax(expr),
        ).toBe(expr);
      });
  
      it('should handle single row matrix', () => {
        const expr = '[[1,2,3]]';
  
        const result = normalizeMatrixSyntax(expr);
  
        expect(result).toBe('[1,2,3]');
      });
    });
  });