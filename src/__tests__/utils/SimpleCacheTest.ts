// Copyright 2019 Cognite AS

import { SimpleCache } from '../../utils/SimpleCache';

describe('SimpleCache', () => {
  let cache: SimpleCache<number, object>;

  beforeEach(() => {
    cache = new SimpleCache<number, object>();
  });

  test('getOrAdd() adds new item on first add', async () => {
    // Arrange
    const factory = jest.fn();

    // Act
    await cache.getOrAdd(1, factory);

    // Assert
    expect(factory).toBeCalledTimes(1);
  });

  test('getOrAdd() does not add item on second call', async () => {
    // Arrange
    const factory = jest.fn(() => new Object());

    // Act
    await cache.getOrAdd(1, factory);
    await cache.getOrAdd(1, factory);

    // Assert
    expect(factory).toBeCalledTimes(1);
  });

  test('getOrAdd() with two different IDs fetches twice', async () => {
    // Arrange
    const factory = jest.fn(() => new Object());

    // Act
    await cache.getOrAdd(1, factory);
    await cache.getOrAdd(2, factory);

    // Assert
    await expect(factory).toBeCalledTimes(2);
  });
});
