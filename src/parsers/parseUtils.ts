import * as THREE from 'three';

import GeometryGroup from '../geometry/GeometryGroup';
import { PrimitiveGroupMap } from '../geometry/PrimitiveGroup';
import { InstancedMesh } from '../geometry/InstancedMeshGroup';
import SceneStats from '../SceneStats';

export interface FilterOptions {
  boundingBoxFilter?: THREE.Box3;
  nodeIdFilter?: number[];
}

export interface TreeIndexNodeIdMap {
  [s: number]: number;
}

export interface ColorMap {
  [s: number]: THREE.Color;
}

export interface InstancedMeshMap {
  [key: number]: InstancedMesh;
}

export interface ParseData {
  primitiveGroupMap: PrimitiveGroupMap;
  geometries: GeometryGroup[];
  instancedMeshMap: InstancedMeshMap;
  sceneStats: SceneStats;
  treeIndexNodeIdMap: TreeIndexNodeIdMap;
  colorMap: ColorMap;
  filterOptions?: FilterOptions;
}
