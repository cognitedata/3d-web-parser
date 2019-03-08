import * as THREE from 'three';

import GeometryGroup from '../geometry/GeometryGroup';
import { PrimitiveGroupMap } from '../geometry/PrimitiveGroup';
import { InstancedMesh } from '../geometry/InstancedMeshGroup';
import SceneStats from '../SceneStats';

export interface FilterOptions {
  boundingBoxFilter?: THREE.Box3;
  nodeIdFilter?: number[];
}

export type TreeIndexNodeIdMap = number[];

export type ColorMap = THREE.Color[];

export interface InstancedMeshMap {
  [key: number]: InstancedMesh;
}

export interface NodeIdTreeIndexMap {
  [nodeId: number]: number;
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
