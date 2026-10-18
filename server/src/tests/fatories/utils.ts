export type Row = Record<string, unknown>;

// One counter shared by all factories, so generated values never collide
let counter = 0;
export const next = () => ++counter;

/**
 * Returns the FK value from overrides if the test provided one
 * (including an explicit null), otherwise creates a parent row.
 */
export async function resolveId(
  overrides: Row,
  key: string,
  create: () => Promise<number>
): Promise<number | null> {
  if (Object.prototype.hasOwnProperty.call(overrides, key)) {
    return overrides[key] as number | null;
  }
  return create();
}
