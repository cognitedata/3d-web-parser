// Copyright 2019 Cognite AS

import { SectorMetadata } from './SectorMetadata';

export interface SectorMetadataProvider {
  /**
   * Reads metadata for tree and returns the root.
   */
  readSectorTree(): Promise<SectorMetadata>;
}

export class SectorMetadataProviderImpl implements SectorMetadataProvider {
  constructor() {}

  async readSectorTree(): Promise<SectorMetadata> {
    throw new Error('Method not implemented.');
  }
}
