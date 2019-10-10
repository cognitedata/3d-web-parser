// Copyright 2019 Cognite AS

import { setUnion, setIntersection, setDifference } from '../../utils/setUtils';
import 'jest-extended';

describe('setUtils', () => {
  test('setUnion with partial overlap', () => {
    const left = newSet(1, 2, 3);
    const right = newSet(3, 4, 5);
    const union = setUnion(left, right);
    verifySet(union, [1, 2, 3, 4, 5]);
  });

  test('setUnion distinct sets', () => {
    const left = newSet(1, 2);
    const right = newSet(3, 4);
    const union = setUnion(left, right);
    verifySet(union, [1, 2, 3, 4]);
  });

  test('setUnion full overlap', () => {
    const union = setUnion(newSet(1, 2, 3), newSet(2, 3));
    verifySet(union, [1, 2, 3]);
  });

  test('setIntersection distinct sets returns empty', () => {
    const intersection = setIntersection(newSet(1, 2), newSet(3, 4));
    verifySet(intersection, []);
  });

  test('setIntersection partial overlap returns overlap', () => {
    const intersection = setIntersection(newSet(1, 2, 3), newSet(2, 3, 4));
    verifySet(intersection, [2, 3]);
  });

  test('setIntersection full overlap', () => {
    const intersection = setIntersection(newSet(1, 2, 3), newSet(1, 2, 3));
    verifySet(intersection, [1, 2, 3]);
  });

  test('setDifference partial overlap sets returns new in left', () => {
    const difference = setDifference(newSet(1, 2, 3), newSet(3, 4, 5));
    verifySet(difference, [1, 2]);
  });

  test('setDifference distinct returns left', () => {
    const difference = setDifference(newSet(1, 2, 3), newSet(4, 5));
    verifySet(difference, [1, 2, 3]);
  });
});

function newSet<T>(...elements: T[]) {
  return new Set<T>(elements);
}

function verifySet<T>(set: Set<T>, expected: T[]) {
  expect(new Array<T>(...set)).toIncludeSameMembers(expected);
}
