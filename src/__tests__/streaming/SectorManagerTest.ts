// Copyright 2019 Cognite AS

import { DefaultSectorManager, createSectorIdSet, SectorId, SectorIdSet } from '../../streaming/SectorManager';
import { SectorGeometryProvider } from '../../streaming/SectorGeometryProvider';
import { SectorMetadataProvider } from '../../streaming/SectorMetadataProvider';
import { SectorGeometry } from '../../streaming/SectorGeometry';
import { SectorMetadata } from '../../streaming/SectorMetadata';
import * as THREE from 'three';
import { DataMaps } from '../../parsers/parseUtils';
import 'jest-extended';
import { expectSetEqual } from '../../TestUtils';

describe('DefaultSectorManager', () => {
  class StubSectorMetadata implements SectorMetadata {
    id: number;
    path: string;
    bounds: THREE.Box3;
    children: SectorMetadata[];

    constructor(id: number, path: string, bounds?: THREE.Box3, children?: SectorMetadata[]) {
      this.id = id;
      this.path = path;
      this.bounds = bounds || new THREE.Box3();
      this.children = children || [];
    }
  }

  class MockSectorGeometryProvider implements SectorGeometryProvider {
    retrieve: (sectorId: number) => Promise<SectorGeometry>;
    prefetch: (sectorIds: SectorIdSet) => void;

    constructor() {
      this.retrieve = (sectorId: SectorId) => {
        const stubDataMaps: DataMaps = {
          treeIndexNodeIdMap: [],
          colorMap: [],
          nodeIdTreeIndexMap: new Map<number, number>(),
          sectors: {}
        };
        const geometry: SectorGeometry = {
          id: sectorId,
          primitiveGroups: [],
          dataMaps: stubDataMaps
        };
        return Promise.resolve(geometry);
      };
      this.prefetch = (sectorIds: SectorIdSet) => {};
    }
  }

  class MockSectorMetadataProvider implements SectorMetadataProvider {
    readSectorTree: () => Promise<SectorMetadata>;

    constructor() {
      this.readSectorTree = () => Promise.resolve(new StubSectorMetadata(0, '0/'));
    }
  }

  const mockMetadataProvider = new MockSectorMetadataProvider();
  const mockGeometryProvider = new MockSectorGeometryProvider();

  const manager: DefaultSectorManager = new DefaultSectorManager(mockMetadataProvider, mockGeometryProvider);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('initialize() retrieves metadata for sector tree', async () => {
    const readSectorTreeSpy = jest.spyOn(mockMetadataProvider, 'readSectorTree');

    await manager.initialize();
    expect(readSectorTreeSpy).toBeCalledTimes(1);
  });

  test('initialize() fails when readSectorTree() fails', async () => {
    mockMetadataProvider.readSectorTree = jest.fn(() => {
      throw new Error();
    });

    await expect(manager.initialize()).rejects.toThrow();
  });

  describe('with sectors', () => {
    const unitBox = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1));
    const rootSector: SectorMetadata = {
      id: 0,
      path: '0/',
      bounds: unitBox,
      children: [
        {
          id: 1,
          path: '0/0/',
          bounds: unitBox,
          children: []
        },
        {
          id: 2,
          path: '0/1/',
          bounds: unitBox,
          children: []
        }
      ]
    };

    beforeEach(() => {
      mockMetadataProvider.readSectorTree = jest.fn(() => rootSector);
    });

    test('initialize() returns root sector', async () => {
      const sector = await manager.initialize();
      expect(sector).toEqual(rootSector);
    });

    test('activateSectors() with empty array, retrieves nothing', async () => {
      // Arrange
      const retrieveSpy = jest.spyOn(mockGeometryProvider, 'retrieve');
      const emptyIdSet = createSectorIdSet([]);
      await manager.initialize();

      // Act
      await manager.activateSectors(emptyIdSet);

      // Assert
      expect(retrieveSpy).not.toBeCalled();
    });

    test('activateSectors() with two IDs, retrieves geometry for each', async () => {
      // Arrange
      const retrieveSpy = jest.spyOn(mockGeometryProvider, 'retrieve');
      const ids = createSectorIdSet([0, 2]);
      await manager.initialize();

      // Act
      await manager.activateSectors(ids);

      // Assert
      expect(retrieveSpy).toBeCalledWith(0);
      expect(retrieveSpy).toBeCalledWith(2);
    });

    test('activateSectors() with one ID returns one promise', async () => {
      // Arrange
      const ids = createSectorIdSet([0]);
      await manager.initialize();

      // Act
      const { newSectors, discardedSectorIds } = manager.activateSectors(ids);

      // Assert
      expect(newSectors.length).toBe(1);
      expect(discardedSectorIds).toBeEmpty();
    });

    test('activateSectors() does not abort when one operation fails', async () => {
      // Arrange
      mockGeometryProvider.retrieve = jest.fn<Promise<SectorGeometry>>(async (id: number) => {
        if (id === 0xfa11) {
          throw new Error();
        }
        return jest.fn<SectorGeometry>();
      });
      const ids = createSectorIdSet([1, 0xfa11]);
      await manager.initialize();
      let success = 0;
      let failed = 0;

      // Act
      const { newSectors, discardedSectorIds } = manager.activateSectors(ids);
      for (const p of newSectors) {
        try {
          await p;
          success++;
        } catch (error) {
          failed++;
        }
      }

      // Assert
      expect(success).toBe(1);
      expect(failed).toBe(1);
      expect(discardedSectorIds).toBeEmpty();
    });

    test('activateSectors() does not abort when one operation fails', async () => {
      // Arrange
      mockGeometryProvider.retrieve = jest.fn<Promise<SectorGeometry>>(async (id: number) => {
        if (id === 0xfa11) {
          throw new Error();
        }
        return jest.fn<SectorGeometry>();
      });
      const ids = createSectorIdSet([1, 0xfa11]);
      await manager.initialize();
      let success = 0;
      let failed = 0;

      // Act
      const { newSectors, discardedSectorIds } = manager.activateSectors(ids);
      for (const p of newSectors) {
        try {
          await p;
          success++;
        } catch (error) {
          failed++;
        }
      }

      // Assert
      expect(success).toBe(1);
      expect(failed).toBe(1);
      expect(discardedSectorIds).toBeEmpty();
    });

    test('activateSectors() with already active set, schedules nothing', async () => {
      // Arrange
      const retrieveSpy = jest.spyOn(mockGeometryProvider, 'retrieve');
      const ids = createSectorIdSet([1, 2, 3]);
      await manager.initialize();
      await manager.activateSectors(ids);
      retrieveSpy.mockClear();

      // Act
      const { newSectors, discardedSectorIds } = manager.activateSectors(ids);

      // Assert
      expect(newSectors).toBeEmpty();
      expect(retrieveSpy).not.toBeCalled();
      expect(discardedSectorIds).toBeEmpty();
    });

    test('activateSectors() with some new ids, schedules only new and discards old', async () => {
      // Arrange
      const retrieveSpy = jest.spyOn(mockGeometryProvider, 'retrieve');
      const ids = createSectorIdSet([1, 2, 3]);
      await manager.initialize();
      await manager.activateSectors(ids);
      retrieveSpy.mockClear();

      // Act
      const newIds = createSectorIdSet([2, 3, 4]);
      const { newSectors, discardedSectorIds } = manager.activateSectors(newIds);

      // Assert
      expect(newSectors.length).toBe(1);
      expect(retrieveSpy).toBeCalledTimes(1);
      expectSetEqual(discardedSectorIds, [1]);
    });

    test('activateSectors() with partially overlapping ids, discards unwanted sectors', async () => {
      // Arrange
      const ids = createSectorIdSet([1, 2, 3]);
      await manager.initialize();
      await manager.activateSectors(ids);

      // Act
      const newIds = createSectorIdSet([2, 3, 4, 5]);
      const { newSectors, discardedSectorIds } = manager.activateSectors(newIds);

      // Assert
      expect(newSectors.length).toBe(2);
      expectSetEqual(discardedSectorIds, [1]);
    });

    describe('traversal', () => {
      beforeEach(async () => {
        const root: SectorMetadata = {
          id: 0,
          path: '0/',
          bounds: unitBox,
          children: [
            {
              id: 1,
              path: '0/0/',
              bounds: unitBox,
              children: [
                {
                  id: 3,
                  path: '0/0/0/',
                  bounds: unitBox,
                  children: []
                },
                {
                  id: 4,
                  path: '0/0/1/',
                  bounds: unitBox,
                  children: [
                    {
                      id: 5,
                      path: '0/0/1/0/',
                      bounds: unitBox,
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              id: 2,
              path: '0/1/',
              bounds: unitBox,
              children: []
            }
          ]
        };
        mockMetadataProvider.readSectorTree = jest.fn(() => root);
        await manager.initialize();
      });

      test(`traverseDepthFirst traverses in correct order`, async () => {
        // Arrange
        const visitedOrder: SectorId[] = [];
        const visitor = (sector: SectorMetadata) => {
          visitedOrder.push(sector.id);
          return true;
        };

        // Act
        manager.traverseSectorsDepthFirst(visitor);

        // Assert
        expect(visitedOrder.join(',')).toBe([0, 1, 3, 4, 5, 2].join(','));
      });

      test(`traverseDepthFirst with cutoff, traverses in correct order`, async () => {
        // Arrange
        const visitedOrder: SectorId[] = [];
        const visitor = (sector: SectorMetadata) => {
          visitedOrder.push(sector.id);
          return sector.id !== 1;
        };

        // Act
        manager.traverseSectorsDepthFirst(visitor);

        // Assert
        expect(visitedOrder.join(',')).toBe([0, 1, 2].join(','));
      });

      test(`traverseDepthFirst with cutoff, does not stop processing sister`, async () => {
        // Arrange
        const visitedOrder: SectorId[] = [];
        const visitor = (sector: SectorMetadata) => {
          visitedOrder.push(sector.id);
          return sector.id !== 3;
        };

        // Act
        manager.traverseSectorsDepthFirst(visitor);

        // Assert
        expect(visitedOrder.join(',')).toBe([0, 1, 3, 4, 5, 2].join(','));
      });

      test(`traverseBreadthFirst traverses in correct order`, async () => {
        // Arrange
        const visitedOrder: SectorId[] = [];
        const visitor = (sector: SectorMetadata) => {
          visitedOrder.push(sector.id);
          return true;
        };

        // Act
        manager.traverseSectorsBreadthFirst(visitor);

        // Assert
        expect(visitedOrder.join(',')).toBe([0, 1, 2, 3, 4, 5].join(','));
      });

      test(`traverseBreadthFirst with cutoff, stops processing subtree`, async () => {
        // Arrange
        const visitedOrder: SectorId[] = [];
        const visitor = (sector: SectorMetadata) => {
          visitedOrder.push(sector.id);
          return sector.id !== 1;
        };

        // Act
        manager.traverseSectorsBreadthFirst(visitor);

        // Assert
        expect(visitedOrder.join(',')).toBe([0, 1, 2].join(','));
      });
    });
  });
});
