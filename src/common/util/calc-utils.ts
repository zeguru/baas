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

  static handleValueRangeLookup(outerKey: string, base: number, table: Record<string, number>,  defaultValue: number): number {
    const innerTable = table[outerKey];
    console.log(`[DEBUG] Value Range lookup: outerKey=${outerKey}`);

    if (!innerTable) return defaultValue;
    for (const [range, val] of Object.entries(innerTable)) {
        const [min, max] = range.split('-').map(Number);
        if (base >= min && base <= max) {
            return val;
            }
        }
    return defaultValue;
    }

}
