// Copyright 2019 Cognite AS

import PropertyLoader from '../PropertyLoader';
import * as THREE from 'three';
import {
  PrimitiveGroup,
  ConeGroup,
  EccentricConeGroup,
  CircleGroup,
  GeneralRingGroup,
  TrapeziumGroup,
  QuadGroup
} from '../../../geometry/GeometryGroups';
import { FilterOptions } from '../../parseUtils';
import { xAxis, zAxis } from '../../../constants';

const globalCenterA = new THREE.Vector3();
const globalCenterB = new THREE.Vector3();
const globalCenterC = new THREE.Vector3();
const globalCenterD = new THREE.Vector3();
const globalAxisRotation = new THREE.Quaternion();
const globalXAxis = new THREE.Vector3();
const globalVertex = new THREE.Vector3();
const globalVertex1 = new THREE.Vector3();
const globalVertex2 = new THREE.Vector3();
const globalVertex3 = new THREE.Vector3();
const globalRotation = new THREE.Quaternion();
const globalCapZAxis = new THREE.Vector3();
const globalCapXAxis = new THREE.Vector3();
const globalQuadNorm = new THREE.Vector3();

export function addOpenCone(
  groups: { [name: string]: PrimitiveGroup },
  data: PropertyLoader,
  filterOptions?: FilterOptions
) {
  globalCenterA
    .copy(data.normal)
    .multiplyScalar(data.height / 2)
    .add(data.center);
  globalCenterB
    .copy(data.normal)
    .multiplyScalar(-data.height / 2)
    .add(data.center);
  (groups.Cone as ConeGroup).add(
    data.nodeId,
    data.treeIndex,
    data.size,
    globalCenterA,
    globalCenterB,
    data.radiusA,
    data.radiusB,
    0,
    Math.PI * 2,
    filterOptions
  );
}

export function addOpenEccentricCone(
  groups: { [name: string]: PrimitiveGroup },
  data: PropertyLoader,
  filterOptions?: FilterOptions
) {
  globalCenterA
    .copy(data.normal)
    .multiplyScalar(data.height / 2)
    .add(data.center);
  globalCenterB
    .copy(data.normal)
    .multiplyScalar(-data.height / 2)
    .add(data.center);
  (groups.EccentricCone as EccentricConeGroup).add(
    data.nodeId,
    data.treeIndex,
    data.size,
    globalCenterA,
    globalCenterB,
    data.radiusA,
    data.radiusB,
    data.normal,
    filterOptions
  );
}

export function addClosedCone(
  groups: { [name: string]: PrimitiveGroup },
  data: PropertyLoader,
  filterOptions?: FilterOptions
) {
  addOpenCone(groups, data);
  (groups.Circle as CircleGroup).add(
    data.nodeId,
    data.treeIndex,
    data.size,
    globalCenterA,
    data.normal,
    data.radiusA,
    filterOptions
  );
  (groups.Circle as CircleGroup).add(
    data.nodeId,
    data.treeIndex,
    data.size,
    globalCenterB,
    data.normal,
    data.radiusB,
    filterOptions
  );
}

export function addClosedEccentricCone(
  groups: { [name: string]: PrimitiveGroup },
  data: PropertyLoader,
  filterOptions?: FilterOptions
) {
  addOpenEccentricCone(groups, data);
  (groups.Circle as CircleGroup).add(
    data.nodeId,
    data.treeIndex,
    data.size,
    globalCenterA,
    data.normal,
    data.radiusA,
    filterOptions
  );
  (groups.Circle as CircleGroup).add(
    data.nodeId,
    data.treeIndex,
    data.size,
    globalCenterB,
    data.normal,
    data.radiusB,
    filterOptions
  );
}

export function addOpenGeneralCone(
  groups: { [name: string]: PrimitiveGroup },
  data: PropertyLoader,
  filterOptions?: FilterOptions
) {
  globalCenterA
    .copy(data.normal)
    .multiplyScalar(data.height / 2)
    .add(data.center);
  globalCenterB
    .copy(data.normal)
    .multiplyScalar(-data.height / 2)
    .add(data.center);
  (groups.Cone as ConeGroup).add(
    data.nodeId,
    data.treeIndex,
    data.size,
    globalCenterA,
    globalCenterB,
    data.radiusA,
    data.radiusB,
    data.rotationAngle,
    data.arcAngle,
    filterOptions
  );
}

export function addClosedGeneralCone(
  groups: { [name: string]: PrimitiveGroup },
  data: PropertyLoader,
  filterOptions?: FilterOptions
) {
  addOpenGeneralCone(groups, data, filterOptions);

  globalXAxis.copy(xAxis).applyQuaternion(globalAxisRotation.setFromUnitVectors(zAxis, data.normal));
  (groups.GeneralRing as GeneralRingGroup).add(
    data.nodeId,
    data.treeIndex,
    data.size,
    globalCenterA,
    data.normal,
    globalXAxis,
    data.radiusA,
    data.radiusA,
    data.thickness,
    data.rotationAngle,
    data.arcAngle,
    filterOptions
  );
  (groups.GeneralRing as GeneralRingGroup).add(
    data.nodeId,
    data.treeIndex,
    data.size,
    globalCenterB,
    data.normal,
    globalXAxis,
    data.radiusB,
    data.radiusB,
    data.thickness,
    data.rotationAngle,
    data.arcAngle,
    filterOptions
  );
}

export function addSolidOpenGeneralCone(
  groups: { [name: string]: PrimitiveGroup },
  data: PropertyLoader,
  filterOptions?: FilterOptions
) {
  addClosedGeneralCone(groups, data, filterOptions);
  (groups.Cone as ConeGroup).add(
    data.nodeId,
    data.treeIndex,
    data.size,
    globalCenterA,
    globalCenterB,
    data.radiusA - data.thickness,
    data.radiusB - data.thickness,
    data.rotationAngle,
    data.arcAngle,
    filterOptions
  );
}

export function addSolidClosedGeneralCone(
  groups: { [name: string]: PrimitiveGroup },
  data: PropertyLoader,
  filterOptions?: FilterOptions
) {
  addSolidOpenGeneralCone(groups, data, filterOptions);

  globalCapZAxis.copy(globalCenterA).sub(globalCenterB);
  globalRotation.setFromUnitVectors(zAxis, globalCapZAxis.normalize());
  globalCapXAxis.copy(xAxis).applyQuaternion(globalRotation);

  [false, true].forEach(isSecondQuad => {
    const finalAngle = data.rotationAngle + Number(isSecondQuad) * data.arcAngle;
    globalVertex
      .set(Math.cos(finalAngle), Math.sin(finalAngle), 0)
      .applyQuaternion(globalRotation)
      .normalize();
    const vertices: THREE.Vector3[] = [];
    const offsets = [0, -data.thickness];
    [true, false].forEach(isA => {
      if (isSecondQuad) {
        isA = !isA;
      }
      const radius = isA ? data.radiusA : data.radiusB;
      const center = isA ? globalCenterA : globalCenterB;
      offsets.forEach(offset => {
        vertices.push(
          globalVertex
            .clone()
            .multiplyScalar(radius + offset)
            .add(center)
        );
      });
    });
    (groups.Trapezium as TrapeziumGroup).add(
      data.nodeId,
      data.treeIndex,
      data.size,
      vertices[0],
      vertices[1],
      vertices[2],
      vertices[3],
      filterOptions
    );
  });
}

export function addQuad(
  groups: { [name: string]: PrimitiveGroup },
  data: PropertyLoader,
  filterOptions?: FilterOptions
) {
  globalCenterA
    .copy(data.center);

  globalAxisRotation.setFromUnitVectors(zAxis, data.normal);

  const d = data.deltaScalar / 2;
  globalVertex
    .set(d, d, 0)
    .applyQuaternion(globalAxisRotation)
    .add(globalCenterA);
  globalVertex1
    .set(d, -d, 0)
    .applyQuaternion(globalAxisRotation)
    .add(globalCenterA);
  globalVertex2
    .set(-d, d, 0)
    .applyQuaternion(globalAxisRotation)
    .add(globalCenterA);
  globalVertex3
    .set(d, d, 0)
    .applyQuaternion(globalAxisRotation)
    .add(globalCenterA);

  console.log("Vertices", globalVertex, globalVertex1, globalVertex2, globalVertex3);

  (groups.Quad as QuadGroup).add(
    data.nodeId,
    data.treeIndex,
    data.size,
    globalVertex1,
    globalVertex2,
    globalVertex3,
    filterOptions
  );
}
