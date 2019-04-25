// Copyright 2019 Cognite AS

import * as THREE from 'three';

import GeometryGroup from '../geometry/GeometryGroup';
import { PrimitiveGroupMap } from '../geometry/PrimitiveGroup';
import { InstancedMesh } from '../geometry/InstancedMeshGroup';
import SceneStats from '../SceneStats';
import Sector from './../Sector';

export interface FilterOptions {
  boundingBoxFilter?: THREE.Box3;
  nodeIdFilter?: number[];
}

export type TreeIndexNodeIdMap = number[];

export type ColorMap = THREE.Color[];

export interface InstancedMeshMap {
  [key: number]: InstancedMesh;
}

export interface SectorMap {
  [name: string]: Sector;
}

export interface DataMaps {
  treeIndexNodeIdMap: TreeIndexNodeIdMap;
  colorMap: ColorMap;
  nodeIdTreeIndexMap: Map<number, number>;
  sectors: SectorMap;
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

export interface ParseReturn {
  rootSector: Sector;
  sceneStats: SceneStats;
  maps: DataMaps;
}
