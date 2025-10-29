export function normalizeWhen(conditions: unknown): Record<string, any> {
  if (conditions && typeof (conditions as any).toJSON === 'function') {
    const serialized = (conditions as any).toJSON();
    return typeof serialized === 'string' ? JSON.parse(serialized) : serialized;
    }
  return conditions as Record<string, any>;
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



