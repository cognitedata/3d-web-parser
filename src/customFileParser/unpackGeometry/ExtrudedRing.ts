import PropertyLoader from '../PropertyLoader';
import * as THREE from 'three';
import { xAxis, zAxis } from '../../constants';
import { FilterOptions } from '../../parsers/parseUtils';

const globalCenterA = new THREE.Vector3();
const globalCenterB = new THREE.Vector3();

const globalVertex = new THREE.Vector3();
const globalVertex1 = new THREE.Vector3();
const globalVertex2 = new THREE.Vector3();
const globalVertex3 = new THREE.Vector3();
const globalQuadNorm = new THREE.Vector3();
const globalAxisRotation = new THREE.Quaternion();
const globalXAxis = new THREE.Vector3();
import { PrimitiveGroup, GeneralRingGroup, ConeGroup, QuadGroup } from '../../geometry/GeometryGroups';

function addOpenExtrudedRingSegment(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader,
                                    filterOptions?: FilterOptions) {
  globalCenterA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  globalCenterB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  globalXAxis.copy(xAxis).applyQuaternion(globalAxisRotation.setFromUnitVectors(zAxis, data.normal));

  (groups.GeneralRing as GeneralRingGroup).add(data.nodeId, data.treeIndex, data.diagonalSize, globalCenterA, data.normal,
    globalXAxis, data.radiusB, data.radiusB, data.radiusB - data.radiusA,
    data.rotationAngle, data.arcAngle, filterOptions);
  (groups.GeneralRing as GeneralRingGroup).add(data.nodeId, data.treeIndex, data.diagonalSize, globalCenterB, data.normal,
    globalXAxis, data.radiusB, data.radiusB, data.radiusB - data.radiusA,
    data.rotationAngle, data.arcAngle, filterOptions);
  (groups.Cone as ConeGroup).add(data.nodeId, data.treeIndex, data.diagonalSize, globalCenterA, globalCenterB, data.radiusA,
    data.radiusA, data.rotationAngle, data.arcAngle, filterOptions);
  (groups.Cone as ConeGroup).add(data.nodeId, data.treeIndex, data.diagonalSize, globalCenterA, globalCenterB, data.radiusB,
    data.radiusB, data.rotationAngle, data.arcAngle, filterOptions);
}

function addClosedExtrudedRingSegment(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader,
                                      filterOptions?: FilterOptions) {
  addOpenExtrudedRingSegment(groups, data);

  // quad 1
  globalQuadNorm.copy(globalCenterA).sub(globalCenterB).normalize();
  globalAxisRotation.setFromUnitVectors(zAxis, globalQuadNorm);
  const quadOneAngle = data.rotationAngle;
  globalVertex.set(Math.cos(quadOneAngle), Math.sin(quadOneAngle), 0).applyQuaternion(globalAxisRotation).normalize();
  globalVertex1.copy(globalVertex).multiplyScalar(data.radiusB).add(globalCenterA);
  globalVertex2.copy(globalVertex).multiplyScalar(data.radiusA).add(globalCenterB);
  globalVertex3.copy(globalVertex).multiplyScalar(data.radiusB).add(globalCenterB);

  (groups.Quad as QuadGroup).add(
    data.nodeId, data.treeIndex, data.diagonalSize, globalVertex2, globalVertex1, globalVertex3, filterOptions);

  // quad 2
  globalQuadNorm.copy(globalCenterA).sub(globalCenterB).normalize();
  globalAxisRotation.setFromUnitVectors(zAxis, globalQuadNorm);
  const quadTwoAngle = data.rotationAngle + data.arcAngle;
  globalVertex.set(Math.cos(quadTwoAngle), Math.sin(quadTwoAngle), 0).applyQuaternion(globalAxisRotation).normalize();
  globalVertex1.copy(globalVertex).multiplyScalar(data.radiusB).add(globalCenterA);
  globalVertex2.copy(globalVertex).multiplyScalar(data.radiusA).add(globalCenterB);
  globalVertex3.copy(globalVertex).multiplyScalar(data.radiusB).add(globalCenterB);

  // Note that globalVertexes 2 and 1 are flipped
  (groups.Quad as QuadGroup).add(
    data.nodeId, data.treeIndex, data.diagonalSize, globalVertex1, globalVertex2, globalVertex3, filterOptions);
}

function addExtrudedRing(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader,
                         filterOptions?: FilterOptions) {
  data.rotationAngle = 0;
  data.arcAngle = Math.PI * 2;
  // Don't need the quads, so call addOpenExtrudedRingSegment
  addOpenExtrudedRingSegment(groups, data, filterOptions);
}

export { addExtrudedRing, addClosedExtrudedRingSegment, addOpenExtrudedRingSegment };
