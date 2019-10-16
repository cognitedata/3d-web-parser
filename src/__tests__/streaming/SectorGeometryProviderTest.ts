// Copyright 2019 Cognite AS

import { DefaultSectorGeometryProvider } from '../../streaming/SectorGeometryProvider';
import { SectorGeometry } from '../../streaming/SectorGeometry';
import { Cache } from '../../utils/SimpleCache';
import { SectorId } from '../../streaming/SectorManager';
import { SectorGeometryParser } from '../../streaming/SectorGeometryParser';
import { DataMaps } from '../../parsers/parseUtils';

describe('DefaultSectorGeometryProvider', () => {
  const parser: SectorGeometryParser = {
    parseGeometry: jest.fn()
  };
  const cache: Cache<SectorId, SectorGeometry> = {
    getOrAdd: jest.fn()
  };

  const provider = new DefaultSectorGeometryProvider(parser, cache);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('retrieve() schedules load on first call for a sector', async () => {
    cache.getOrAdd = (id, createCb) => createCb(id); // Cache miss
    await provider.retrieve(1);
    expect(parser.parseGeometry).toBeCalledTimes(1);
  });

  test('retrieve() fetches from cache after sector has been loaded', async () => {
    // Arrange
    const stubDataMaps: DataMaps = {
      treeIndexNodeIdMap: [],
      colorMap: [],
      nodeIdTreeIndexMap: new Map<number, number>(),
      sectors: {}
    };
    const stubGeometry: SectorGeometry = { id: 1, primitiveGroups: [], dataMaps: stubDataMaps };
    cache.getOrAdd = () => Promise.resolve(stubGeometry);

    // Act
    const result = await provider.retrieve(1);

    // Assert
    expect(result).toBe(stubGeometry);
  });

  test('prefetch() fetches all ids', async () => {
    // Arrange
    const getOrAddSpy = jest.spyOn(cache, 'getOrAdd');

    // Act
    provider.prefetch(new Set<SectorId>([1, 2, 3]));

    // Assert
    expect(getOrAddSpy).toBeCalledTimes(3);
  });
});
