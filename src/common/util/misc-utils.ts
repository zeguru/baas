
export function transformWhenStringToJson(conditions: unknown): Record<string, any> {
  if (!conditions) return {} as Record<string, any>;

  let serialized: any;

  if (typeof (conditions as any).toJSON === 'function') {
    serialized = (conditions as any).toJSON();
    serialized = typeof serialized === 'string' ? JSON.parse(serialized) : serialized;
    } 
  else {
    serialized = conditions;
    }

  if (serialized && typeof serialized === 'object' && 'priority' in serialized) {
    delete serialized.priority;
    }

  return serialized;
  }


/**
 * Returns the first value that is not null or undefined.
 * If all values are undefined/null, returns the provided fallback or 0.
 */
export function coalesce<T = number>(...values: (T | undefined | null)[]): T {
  for (const v of values) {
    if (v !== undefined && v !== null) return v;
    }
  // fallback if all values are undefined/null
  return 0 as unknown as T;
  }



export function capitalizeTableKeys<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};

  Object.entries(obj).forEach(([key, value]) => {
    const upperKey = key.toUpperCase();

    if (result[upperKey]) {
      throw new Error(`Duplicate key after uppercasing: "${key}" -> "${upperKey}"`);
      }

    result[upperKey] = value;
    });

  return result;
  }

export function looksLikeMatrix(expr: string): boolean {
  //starts with [[, ends with ]]
  return /^\s*\[\[.*\]\]\s*$/.test(expr);
  }


export function normalizeMatrixSyntax(expr: string): string {
  if (expr.startsWith("[[") && expr.endsWith("]]")) {
    return "[" + expr.slice(2, -2).replace(/\],\s*\[/g, ";") + "]";
    }
  return expr;
  }