export function normalizeWhen(conditions: unknown): Record<string, any> {
  if (conditions && typeof (conditions as any).toJSON === 'function') {
    const serialized = (conditions as any).toJSON();
    return typeof serialized === 'string' ? JSON.parse(serialized) : serialized;
    }
  return conditions as Record<string, any>;
  }