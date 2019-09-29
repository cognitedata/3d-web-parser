// Copyright 2019 Cognite AS

import { SectorMetadata } from './SectorMetadata';
import { Sector } from '..';

export interface SectorMetadataProvider {
  /**
   * Reads metadata for tree and returns the root.
   */
  readSectorTree(): Promise<SectorMetadata>;
}

export class PreloadedSectorMetadataProvider implements SectorMetadataProvider {
  private readonly rootSector: SectorMetadata;

  constructor(rootSector: SectorMetadata) {
    this.rootSector = rootSector;
  }

  readSectorTree(): Promise<SectorMetadata> {
    return Promise.resolve(this.rootSector);
  }
}

export function createSectorMetadataProviderFromTree(rootSector: SectorMetadata): SectorMetadataProvider {
  return new PreloadedSectorMetadataProvider(rootSector);
}
