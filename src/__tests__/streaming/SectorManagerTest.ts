// Copyright 2019 Cognite AS

import { SectorManagerImpl, SectorIdSet, createSectorIdSet, SectorId } from '../../streaming/SectorManager';
import { SectorGeometryProvider } from '../../streaming/SectorGeometryProvider';
import { SectorMetadataProvider } from '../../streaming/SectorMetadataProvider';
import { SectorGeometry } from '../../streaming/SectorGeometry';
import { SectorMetadata } from '../../streaming/SectorMetadata';
import * as THREE from 'three';
import { PrimitiveGroup, MergedMeshGroup, InstancedMeshGroup } from '../..';

describe('SectorManagerImpl', () => {
  class StubSectorMetadata implements SectorMetadata {
    id: number;
    depth: number;
    bounds: THREE.Box3;
    children: SectorMetadata[];

    constructor(id: number, depth: number, bounds?: THREE.Box3, children?: SectorMetadata[]) {
      this.id = id;
      this.depth = depth;
      this.bounds = bounds || new THREE.Box3();
      this.children = children || [];
    }
  }

  class MockSectorGeometryProvider implements SectorGeometryProvider {
    retrieve: (sectorId: number) => Promise<SectorGeometry>;

    constructor() {
      this.retrieve = (sectorId: SectorId) => {
        const geometry: SectorGeometry = {
          id: sectorId,
          primitiveGroups: []
        };
        return Promise.resolve(geometry);
      };
    }
  }

  class MockSectorMetadataProvider implements SectorMetadataProvider {
    readSectorTree: () => Promise<SectorMetadata>;

    constructor() {
      this.readSectorTree = () => Promise.resolve(new StubSectorMetadata(0, 1));
    }
  }

  const mockMetadataProvider = new MockSectorMetadataProvider();
  const mockGeometryProvider = new MockSectorGeometryProvider();

  // const mockMetadataProvider: Mockify<SectorMetadataProvider> = {
  //   readSectorTree: jest.fn(async () => {
  //     return jest.fn<SectorMetadata>();
  //   })
  // };
  // const mockGeometryProvider: Mockify<SectorGeometryProvider> = {
  //   retrieve: jest.fn(async () => {
  //     return jest.fn<SectorGeometry>();
  //   })
  // };
  const manager = new SectorManagerImpl(mockMetadataProvider, mockGeometryProvider);

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
      depth: 2,
      bounds: unitBox,
      children: [
        {
          id: 1,
          depth: 1,
          bounds: unitBox,
          children: []
        },
        {
          id: 2,
          depth: 1,
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

    test('setActiveSectors() with empty array, retrieves nothing', async () => {
      // Arrange
      const retrieveSpy = jest.spyOn(mockGeometryProvider, 'retrieve');
      const emptyIdSet = createSectorIdSet();
      await manager.initialize();

      // Act
      await manager.setActiveSectors(emptyIdSet);

      // Assert
      expect(retrieveSpy).not.toBeCalled();
    });

    test('setActiveSectors() with two IDs, retrieves geometry for each', async () => {
      // Arrange
      const retrieveSpy = jest.spyOn(mockGeometryProvider, 'retrieve');
      const ids = createSectorIdSet(0, 2);
      await manager.initialize();

      // Act
      await manager.setActiveSectors(ids);

      // Assert
      expect(retrieveSpy).toBeCalledWith(0);
      expect(retrieveSpy).toBeCalledWith(2);
    });

    test('setActiveSectors() with one ID triggers sectorLoaded', async () => {
      // Arrange
      const ids = createSectorIdSet(0);
      const sectorLoadedHandler = jest.fn();
      manager.sectorLoaded.subscribe(sectorLoadedHandler);
      await manager.initialize();

      // Act
      await manager.setActiveSectors(ids);

      // Assert
      expect(sectorLoadedHandler).toBeCalledTimes(1);
    });

    test('setActiveSensors() triggers sectorLoaded for successful sectors when some fails', async () => {
      // Arrange
      mockGeometryProvider.retrieve = jest.fn<Promise<SectorGeometry>>(async (id: number) => {
        if (id === 0xfa11) {
          throw new Error();
        }
        return Promise.resolve(jest.fn<SectorGeometry>());
      });
      const ids = createSectorIdSet(1, 0xfa11);
      const sectorLoadedHandler = jest.fn();
      manager.sectorLoaded.subscribe(sectorLoadedHandler);
      await manager.initialize();

      // Act & Assert
      await expect(manager.setActiveSectors(ids)).rejects.toThrow();

      // Assert
      expect(sectorLoadedHandler).toBeCalledTimes(1);
    });
  });
});
