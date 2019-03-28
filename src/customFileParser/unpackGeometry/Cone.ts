import PropertyLoader from '../PropertyLoader';
import * as THREE from 'three';
import { PrimitiveGroup, ConeGroup, EccentricConeGroup, CircleGroup, GeneralRingGroup, TrapeziumGroup }
  from '../../geometry/GeometryGroups';
import { FilterOptions } from '../../parsers/parseUtils';
import { xAxis, zAxis } from './../../constants';

const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();

const axisRotation = new THREE.Quaternion();
const localXAxis = new THREE.Vector3();
const globalVertex = new THREE.Vector3();
const rotation = new THREE.Quaternion();

const globalCapZAxis = new THREE.Vector3();
const globalCapXAxis = new THREE.Vector3();

export function addOpenCone(
  groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader, filterOptions?: FilterOptions) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  (groups.Cone as ConeGroup).add(data.nodeId, data.treeIndex, centerA, centerB,
  data.radiusA, data.radiusB, 0, Math.PI * 2, filterOptions);
}

export function addOpenEccentricCone(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader,
                                     filterOptions?: FilterOptions) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  (groups.EccentricCone as EccentricConeGroup).add(data.nodeId, data.treeIndex, centerA, centerB,
    data.radiusA, data.radiusB, data.normal, filterOptions);
}

export function addClosedCone(
  groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader, filterOptions?: FilterOptions) {
  addOpenCone(groups, data);
  (groups.Circle as CircleGroup).add(data.nodeId, data.treeIndex, centerA, data.normal, data.radiusA, filterOptions);
  (groups.Circle as CircleGroup).add(data.nodeId, data.treeIndex, centerB, data.normal, data.radiusB, filterOptions);
}

export function addClosedEccentricCone(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader,
                                       filterOptions?: FilterOptions) {
  addOpenEccentricCone(groups, data);
  (groups.Circle as CircleGroup).add(data.nodeId, data.treeIndex, centerA, data.normal, data.radiusA, filterOptions);
  (groups.Circle as CircleGroup).add(data.nodeId, data.treeIndex, centerB, data.normal, data.radiusB, filterOptions);
}

export function addOpenGeneralCone(
  groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader, filterOptions?: FilterOptions) {
  centerA.copy(data.normal).multiplyScalar(data.height / 2).add(data.center);
  centerB.copy(data.normal).multiplyScalar(-data.height / 2).add(data.center);
  (groups.Cone as ConeGroup).add(data.nodeId, data.treeIndex, centerA, centerB, data.radiusA, data.radiusB,
    data.rotationAngle, data.arcAngle, filterOptions);
}

export function addClosedGeneralCone(
  groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader, filterOptions?: FilterOptions) {
  addOpenGeneralCone(groups, data, filterOptions);

  localXAxis.copy(xAxis).applyQuaternion(axisRotation.setFromUnitVectors(zAxis, data.normal));
  (groups.GeneralRing as GeneralRingGroup).add(data.nodeId, data.treeIndex, centerA, data.normal,
    localXAxis, data.radiusA, data.radiusA, data.thickness,
    data.rotationAngle, data.arcAngle, filterOptions);
  (groups.GeneralRing as GeneralRingGroup).add(data.nodeId, data.treeIndex, centerB, data.normal,
    localXAxis, data.radiusB, data.radiusB, data.thickness,
  data.rotationAngle, data.arcAngle, filterOptions);
}

export function addSolidOpenGeneralCone(groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader,
                                        filterOptions?: FilterOptions) {
  addClosedGeneralCone(groups, data, filterOptions);
  (groups.Cone as ConeGroup).add(data.nodeId, data.treeIndex, centerA, centerB, data.radiusA - data.thickness,
    data.radiusB - data.thickness, data.rotationAngle, data.arcAngle, filterOptions);
}

export function addSolidClosedGeneralCone(
  groups: {[name: string]: PrimitiveGroup}, data: PropertyLoader, filterOptions?: FilterOptions) {
  addSolidOpenGeneralCone(groups, data, filterOptions);

  globalCapZAxis.copy(centerA).sub(centerB);
  rotation.setFromUnitVectors(zAxis, globalCapZAxis.normalize());
  globalCapXAxis.copy(xAxis).applyQuaternion(rotation);

  [false, true].forEach(isSecondQuad => {
  const finalAngle = data.rotationAngle + Number(isSecondQuad) * data.arcAngle;
  globalVertex
    .set(Math.cos(finalAngle), Math.sin(finalAngle), 0)
    .applyQuaternion(rotation)
    .normalize();
  const vertices: THREE.Vector3[] = [];
  const offsets = [0, -data.thickness];
  [true, false].forEach(isA => {
    if (isSecondQuad) { isA = !isA; }
    const radius = isA ? data.radiusA : data.radiusB;
    const center = isA ? centerA : centerB;
    offsets.forEach(offset => {
      vertices.push(
        globalVertex
          .clone()
          .multiplyScalar(radius + offset)
          .add(center),
      );
    });
  });
  (groups.Trapezium as TrapeziumGroup).add(
    data.nodeId,
    data.treeIndex,
    vertices[0],
    vertices[1],
    vertices[2],
    vertices[3],
    filterOptions);
  });
}
