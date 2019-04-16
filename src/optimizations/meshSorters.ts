import { InstancedMeshCollection } from '../geometry/InstancedMeshGroup';
import { MergedMesh } from '../geometry/MergedMeshGroup';

export class InstancedMeshCollectionSizeSorter {
  collections: InstancedMeshCollection[];
  mappingIds: number[];

  constructor(collections: InstancedMeshCollection[]) {
    this.collections = [...collections];
    this.mappingIds = this.collections.map(mesh => 0);
  }

  getNext(): any {
    const sizes = this.collections.map((mesh, meshIndex) =>
      this.mappingIds[meshIndex] < mesh.mappings.count ? mesh.mappings.getSize(this.mappingIds[meshIndex]) : -1,
    );
    const maxSize = Math.max(...sizes);
    const nextMeshIndex = sizes.indexOf(maxSize);
    const nextCollection = this.collections[nextMeshIndex];
    const nextMappingId = this.mappingIds[nextMeshIndex];
    this.mappingIds[nextMeshIndex]++;

    return { collection: nextCollection, mappingIndex: nextMappingId };
  }

  isNotEmpty(): boolean {
    return this.collections.some((mesh, meshIndex) => this.mappingIds[meshIndex] < mesh.mappings.count);
  }
}

export class MergedMeshSizeSorter {
  meshes: MergedMesh[];
  mappingIds: number[];

  constructor(meshes: MergedMesh[]) {
    this.meshes = [...meshes];
    this.mappingIds = this.meshes.map(mesh => 0);
  }

  getNext(): any {
    const sizes = this.meshes.map((mesh, meshIndex) =>
      this.mappingIds[meshIndex] < mesh.mappings.count ? mesh.mappings.getSize(this.mappingIds[meshIndex]) : -1,
    );
    const maxSize = Math.max(...sizes);
    const nextMeshIndex = sizes.indexOf(maxSize);
    const nextMappingId = this.mappingIds[nextMeshIndex];
    this.mappingIds[nextMeshIndex]++;

    return { meshIndex: nextMeshIndex, mappingIndex: nextMappingId };
  }

  isNotEmpty(): boolean {
    return this.meshes.some((mesh, meshIndex) => this.mappingIds[meshIndex] < mesh.mappings.count);
  }
}
