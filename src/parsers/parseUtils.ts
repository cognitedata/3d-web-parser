import GeometryGroup from '../geometry/GeometryGroup';
import { PrimitiveGroupMap } from '../geometry/PrimitiveGroup';
import SceneStats from '../SceneStats';

export interface FilterOptions {
  boundingBoxFilter?: THREE.Box3;
  nodeIdFilter?: number[];
}

export interface ParsePrimitiveData {
  primitiveGroupMap: PrimitiveGroupMap;
  geometries: GeometryGroup[];
  sceneStats: SceneStats;
  filterOptions?: FilterOptions;
}
