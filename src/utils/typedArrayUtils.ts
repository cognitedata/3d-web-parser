/**
 * Ensures that the capacity of an array it at least the provided amount. If the capacity is lower,
 * a new array is allocated and returned.
 * @param array
 * @param newCapacity
 */
export function ensureCapacityAtLeast32(array: Float32Array, newCapacity: number): Float32Array {
  if (newCapacity <= array.length) {
    return array;
  }
  const newArray = new Float32Array(newCapacity);
  newArray.set(array, 0);
  return newArray;
}

/**
 * Ensures that the capacity of an array it at least the provided amount. If the capacity is lower,
 * a new array is allocated and returned.
 * @param array
 * @param newCapacity
 */
export function ensureCapacityAtLeast64(array: Float64Array, newCapacity: number): Float64Array {
  if (newCapacity <= array.length) {
    return array;
  }
  const newArray = new Float64Array(newCapacity);
  newArray.set(array, 0);
  return newArray;
}

/**
 * Suggests a new capacity for a buffer that is about to grow.
 * @param currentCapacity           Current capacity.
 * @param minCapacity               The minimum capacity after buffer has been grown (optional).
 * @param growMultiplier            How much to increase the capacity with relative to current capacity (optional).
 */
export function suggestNewCapacity(currentCapacity: number, minCapacity = 1, growMultiplier = 2): number {
  const newCapacity = Math.trunc(Math.max(minCapacity, growMultiplier * currentCapacity));
  return newCapacity;
}
