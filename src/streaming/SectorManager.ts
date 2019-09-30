// Copyright 2019 Cognite AS

import { SectorMetadata } from './SectorMetadata';
import { SectorGeometry } from './SectorGeometry';
import { SectorMetadataProvider } from './SectorMetadataProvider';
import { SectorGeometryProvider, createSectorGeometryProvider } from './SectorGeometryProvider';
import { SectorGeometryLoader } from './SectorGeometryLoader';
import { createSectorGeometryParser } from './SectorGeometryParser';

export type SectorsReadyCallback = (source: SectorManager) => void;
export type SectorId = number;
export type SectorIdSet = Set<SectorId>;

export function createSectorIdSet(ids: Iterable<SectorId>): SectorIdSet {
  return new Set<SectorId>(ids);
}

export function createSectorManager(
  sectorFileVersion: number,
  metadataProvider: SectorMetadataProvider,
  geometryLoader: SectorGeometryLoader
): SectorManager {
  const parser = createSectorGeometryParser(sectorFileVersion);
  const geometryProvider = createSectorGeometryProvider(geometryLoader, parser);
  return new DefaultSectorManager(metadataProvider, geometryProvider);
}

export interface SectorManager {
  initialize(): Promise<SectorMetadata>;
  activateSectors(newActiveIds: SectorIdSet): Promise<SectorGeometry>[];
}

export class DefaultSectorManager implements SectorManager {
  private readonly metadataProvider: SectorMetadataProvider;
  private readonly geometryProvider: SectorGeometryProvider;

  private rootSector?: SectorMetadata;
  private sectorById: Map<SectorId, SectorMetadata>;

  constructor(metadataProvider: SectorMetadataProvider, geometryProvider: SectorGeometryProvider) {
    this.metadataProvider = metadataProvider;
    this.geometryProvider = geometryProvider;
    this.sectorById = new Map<SectorId, SectorMetadata>();
  }

  async initialize(): Promise<SectorMetadata> {
    const rootSector = await this.metadataProvider.readSectorTree();
    this.rootSector = rootSector;
    traverseSectorDepthFirst(this.rootSector, sector => {
      this.sectorById.set(sector.id, sector);
    });
    return rootSector;
  }

  activateSectors(newActiveIds: SectorIdSet): Promise<SectorGeometry>[] {
    const promises: Promise<SectorGeometry>[] = [];
    this.geometryProvider.prefetch(newActiveIds);

    for (const id of newActiveIds) {
      const operation = this.geometryProvider.retrieve(id);
      promises.push(operation);
    }
    return promises;
  }
}

function traverseSectorDepthFirst(rootSector: SectorMetadata, visitor: (sector: SectorMetadata) => void) {
  if (rootSector.children) {
    for (const child of rootSector.children) {
      traverseSectorDepthFirst(child, visitor);
    }
  }
  visitor(rootSector);
}
