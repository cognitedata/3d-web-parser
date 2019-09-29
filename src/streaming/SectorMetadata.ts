// Copyright 2019 Cognite AS

import { SectorId } from './SectorManager';

export type SectorMetadata = {
  id: SectorId;
  bounds: THREE.Box3;
  children: SectorMetadata[];
};
