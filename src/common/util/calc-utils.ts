// src/common/utils/calc-utils.ts
import { parse, MathNode, SymbolNode, all } from 'mathjs';

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
    const innerTable = table[outerKey.toUpperCase()];
    console.log(`[DEBUG] Value Range lookup: outerKey=${outerKey}, innerTable=${innerTable}`);

    if (!innerTable) return defaultValue;

    for (const [range, val] of Object.entries(innerTable)) {
        const [min, max] = range.split('-').map(Number);
        if (base >= min && base <= max) {
            return val;
            }
        }
    return defaultValue;
    }




  static extractVariablesFromExpression(expr: string): string[] {

    const node = parse(expr);
    const vars = new Set<string>();
    const builtin = all; 

    console.log(`Builting = ${builtin}`)

    node.traverse((n: MathNode) => {
        if (node.type === "FunctionNode"){
            console.log(`skipping ${n}`)
            return;
            } 
        if (n.type === 'SymbolNode') {
            const name = (n as SymbolNode).name;
            if (!(name in builtin)) {
                vars.add(name);
                }
            }
        });

    return Array.from(vars);
    }


}
