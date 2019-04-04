import { GeometryType } from './geometry/Types';

export default interface SceneStats {
  memoryUsage: number;
  numNodes: number;
  numSectors: number;
  geometryCount: {
    [s in GeometryType]: number;
  };
}

function createSceneStats(): SceneStats {
  return {
    memoryUsage: 0,
    numNodes: 0,
    numSectors: 0,
    geometryCount: {
      InstancedMesh: 0,
      MergedMesh: 0,
      Box: 0,
      Circle: 0,
      Cone: 0,
      EccentricCone: 0,
      EllipsoidSegment: 0,
      GeneralCylinder: 0,
      GeneralRing: 0,
      Nut: 0,
      Quad: 0,
      SphericalSegment: 0,
      TorusSegment: 0,
      Trapezium: 0,
    },
  };
}

export {
  SceneStats,
  createSceneStats,
};
