// Copyright 2019 Cognite AS

import { PrimitiveGroup } from '..';
import { MergedMeshGroup } from '../geometry/MergedMeshGroup';
import { InstancedMeshGroup } from '../geometry/InstancedMeshGroup';

export type SectorGeometry = {
  id: number;
  primitiveGroups: PrimitiveGroup[];
  mergedMeshGroup?: MergedMeshGroup;
  instancedMeshGroup?: InstancedMeshGroup;
};
