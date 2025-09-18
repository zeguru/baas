// src/common/utils/calc-utils.ts
import { evaluate } from 'mathjs';

export class CalcUtils {
  
  static handleRangeLookup(base: number, table: Record<string, number>, defaultValue: number): number {
    for (const [range, val] of Object.entries(table)) {
        const [min, max] = range.split('-').map(Number);
        if (base >= min && base <= max) {
            return val;
            }
        }
    return defaultValue;
    }
}
