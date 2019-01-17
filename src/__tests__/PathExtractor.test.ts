import { getParentPath } from '../PathExtractor';

// Copyright 2019 Cognite AS

describe('PathExtractor', () => {
  test('extract parent path', () => {
    expect(getParentPath('0/1/2/')).toBe('0/1/');
    expect(getParentPath('0/1/')).toBe('0/');
  });

  test('extract root path', () => {
    expect(getParentPath('0/')).toBe(undefined);
  });
});
