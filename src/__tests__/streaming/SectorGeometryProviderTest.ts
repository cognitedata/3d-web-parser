// Copyright 2019 Cognite AS

import { DefaultSectorGeometryProvider } from '../../streaming/SectorGeometryProvider';
import { SectorScheduler } from '../../streaming/SectorScheduler';
import { SectorGeometry } from '../../streaming/SectorGeometry';
import { Cache } from '../../utils/SimpleCache';
import { SectorId } from '../../streaming/SectorManager';

describe('DefaultSectorGeometryProvider', () => {
  const scheduler: SectorScheduler = {
    schedule: jest.fn<SectorGeometry>(),
    unschedule: jest.fn()
  };
  const cache: Cache<SectorId, SectorGeometry> = {
    getOrAdd: jest.fn()
  };

  const provider = new DefaultSectorGeometryProvider(scheduler, cache);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('retrieve() schedules load on first call for a sector', async () => {
    cache.getOrAdd = (id, createCb) => createCb(id); // Cache miss
    await provider.retrieve(1);
    expect(scheduler.schedule).toBeCalledTimes(1);
  });

  test('retrieve() fetches from cache after sector has been loaded', async () => {
    // Arrange
    const stubGeometry: SectorGeometry = { id: 1, primitiveGroups: [] };
    cache.getOrAdd = () => Promise.resolve(stubGeometry);

    // Act
    const result = await provider.retrieve(1);

    // Assert
    expect(scheduler.schedule).not.toHaveBeenCalled();
    expect(result).toBe(stubGeometry);
  });
});
