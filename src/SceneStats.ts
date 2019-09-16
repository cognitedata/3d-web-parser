// Copyright 2019 Cognite AS

import { RenderedGeometryNameType } from './geometry/Types';

export default interface SceneStats {
  numNodes: number;
  numSectors: number;
  geometryCount: { [s in RenderedGeometryNameType]: number };
}

function createSceneStats(): SceneStats {
  return {
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
      Trapezium: 0
    }
  };
}
// TODO 20190916 larsmoa: Generating stats on load does not make sense with streaming.
// Replace with collectStats(Sector) or something.

export { SceneStats, createSceneStats };
