// Copyright 2019 Cognite AS

export default abstract class GeometryGroup {
  constructor() {}
  abstract computeModelMatrix(outputMatrix: THREE.Matrix4, index: number): THREE.Matrix4;
  abstract computeBoundingBox(matrix: THREE.Matrix4, box: THREE.Box3, index: number): THREE.Box3;
}
