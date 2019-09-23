// Copyright 2019 Cognite AS

// Functions from https://exploringjs.com/impatient-js/ch_sets.html#missing-set-operations

/**
 * Returns set combined of items in both sets.
 */
export function union<T>(left: Set<T>, right: Set<T>): Set<T> {
  return new Set<T>([...left, ...right]);
}

/**
 * Returns elements in left that is also in right.
 */
export function intersection<T>(left: Set<T>, right: Set<T>): Set<T> {
  return new Set<T>([...left].filter(x => right.has(x)));
}

/**
 * Returns elements in left that are not in right.
 */
export function difference<T>(left: Set<T>, right: Set<T>): Set<T> {
  return new Set<T>([...left].filter(x => !right.has(x)));
}
