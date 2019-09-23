// Copyright 2019 Cognite AS

import { PrimitiveGroup } from '..';
import { MergedMeshGroup } from '../geometry/MergedMeshGroup';
import { InstancedMeshGroup } from '../geometry/InstancedMeshGroup';
import { SectorId } from './SectorManager';

export type SectorGeometry = {
  id: SectorId;
  primitiveGroups: PrimitiveGroup[];
  mergedMeshGroup?: MergedMeshGroup;
  instancedMeshGroup?: InstancedMeshGroup;
};
