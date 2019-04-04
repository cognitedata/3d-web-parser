export default interface SceneStats {
  numInstancedMeshes: number;
  numMergedMeshes: number;
  numNodes: number;
  numSectors: number;
  numPrimitives: {
    box: number;
    circle: number;
    cone: number;
    eccentriccone: number;
    ellipsoidsegment: number;
    generalcylinder: number;
    generalring: number;
    nut: number;
    quad: number;
    sphericalsegment: number;
    torussegment: number;
    trapezium: number;
  };
}
