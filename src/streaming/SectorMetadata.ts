export type SectorMetadata = {
  id: number;
  depth: number;
  bounds: THREE.Box3;
  children: SectorMetadata[];
};
