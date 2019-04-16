import { InstancedMeshCollection } from '../geometry/InstancedMeshGroup';
import { MergedMesh } from '../geometry/MergedMeshGroup';

export class InstancedMeshCollectionSizeSorter {
  collections: InstancedMeshCollection[];
  mappingIds: number[];

  constructor(collections: InstancedMeshCollection[]) {
    this.collections = [...collections];
    this.mappingIds = this.collections.map(collection => 0);
  }

  getNext(): any {
    const sizes = this.collections.map((collection, collectionIndex) =>
      this.mappingIds[collectionIndex] < collection.mappings.count ?
        collection.mappings.getSize(this.mappingIds[collectionIndex]) : -1,
    );
    const maxSize = Math.max(...sizes);
    const nextCollectionIndex = sizes.indexOf(maxSize);
    const nextCollection = this.collections[nextCollectionIndex];
    const nextMappingId = this.mappingIds[nextCollectionIndex];
    this.mappingIds[nextCollectionIndex]++;

    return { collection: nextCollection, mappingIndex: nextMappingId };
  }

  isNotEmpty(): boolean {
    return this.collections.some((collection, collectionIndex) =>
      this.mappingIds[collectionIndex] < collection.mappings.count);
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
