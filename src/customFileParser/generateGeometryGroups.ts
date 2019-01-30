import * as THREE from 'three';

import BoxGroup from '../geometry/BoxGroup';
import CircleGroup from '../geometry/CircleGroup';
import ConeGroup from '../geometry/ConeGroup';

let nodeId: number;
let treeIndex: number;
let color: THREE.Color;
let x: number;
let y: number;
let z: number;
let normal: THREE.Vector3;
let deltaX: number;
let deltaY: number;
let deltaZ: number;
let height: number;
let radiusA: number;
let radiusB: number;
let angle: number;
const center = new THREE.Vector3();
const delta = new THREE.Vector3();

const centerA = new THREE.Vector3();
const centerB = new THREE.Vector3();

const propertyNames = ['color', 'centerX', 'centerY', 'centerZ', 'normal', 'delta', 'height', 'radius',
'angle', 'translationX', 'translationY', 'translationZ', 'scaleX', 'scaleY', 'scaleZ'];

function loadData(trueValuesArray: any, geometryInfo: any) {
  nodeId =    geometryInfo.nodeIds.nextNodeId();
  treeIndex = geometryInfo.indexes.nextValue();
  const colorIndex = geometryInfo.indexes.nextValue();
  color =     trueValuesArray.color[colorIndex];
  const xIndex = geometryInfo.indexes.nextValue();
  const yIndex = geometryInfo.indexes.nextValue();
  const zIndex = geometryInfo.indexes.nextValue();
  x =         trueValuesArray.centerX[xIndex];
  y =         trueValuesArray.centerY[yIndex];
  z =         trueValuesArray.centerZ[zIndex];
  center.set(x, y, z);

  const geometryProperties: string[] = geometryInfo.properties;
  if (geometryProperties.indexOf('normal') !== -1) {
    normal = trueValuesArray.normal[geometryInfo.indexes.nextValue()];
  }
  if (geometryProperties.indexOf('deltaX') !== -1) {
    deltaX = trueValuesArray.delta[geometryInfo.indexes.nextValue()];
    deltaY = trueValuesArray.delta[geometryInfo.indexes.nextValue()];
    deltaZ = trueValuesArray.delta[geometryInfo.indexes.nextValue()];
    delta.set(deltaX, deltaY, deltaZ);
  }
  if (geometryProperties.indexOf('height') !== -1) {
    height = trueValuesArray.height[geometryInfo.indexes.nextValue()];
  }
  if (geometryProperties.indexOf('radiusA') !== -1) {
    radiusA = trueValuesArray.radius[geometryInfo.indexes.nextValue()];
  }
  if (geometryProperties.indexOf('radiusB') !== -1) {
    radiusB = trueValuesArray.radius[geometryInfo.indexes.nextValue()];
  }
  if (geometryProperties.indexOf('angle') !== -1) {
    angle = trueValuesArray.angle[geometryInfo.indexes.nextValue()];
  }
  // TODO(verkhovskaya): Add Matrix and Translation once relevant
}

export default function generateGeometryGroups(segmentInformation: any) {
  let circleCount = 0;
  let boxCount = 0;
  let coneCount = 0;

  for (let i = 0; i < segmentInformation.geometryIndexes.length; i++) {
    const geometryInfo = segmentInformation.geometryIndexes[i];
    switch (segmentInformation.geometryIndexes[i].name) {
      case 'Box':
        boxCount += geometryInfo.geometryCount;
        break;
      case 'Circle':
        circleCount += geometryInfo.geometryCount;
        break;
      case 'ClosedCone':
        circleCount += 2 * geometryInfo.geometryCount;
        coneCount += geometryInfo.geometryCount;
        break;
      case 'ClosedCylinder':
        circleCount += 2 * geometryInfo.geometryCount;
        coneCount += geometryInfo.geometryCount;
        break;
      default:
        break;
    }
  }

  const circleGroup = new CircleGroup(circleCount);
  const boxGroup = new BoxGroup(boxCount);
  const coneGroup = new ConeGroup(coneCount);

  for (let i = 0; i < segmentInformation.geometryIndexes.length; i++) {
    const geometryInfo = segmentInformation.geometryIndexes[i];

    switch (geometryInfo.name) {
      case 'Box':
        for (let j = 0; j < geometryInfo.geometryCount; j++) {
          loadData(segmentInformation.propertyTrueValues, geometryInfo);
          boxGroup.add(nodeId, treeIndex, color, center, normal, angle, delta);
        }
        break;
      case 'Circle':
        for (let j = 0; j < geometryInfo.geometryCount; j++) {
          loadData(segmentInformation.propertyTrueValues, geometryInfo);
          circleGroup.add(nodeId, treeIndex, color, center, normal, radiusA);
        }
        break;
      case 'ClosedCone':
        for (let j = 0; j < geometryInfo.geometryCount; j++) {
          loadData(segmentInformation.propertyTrueValues, geometryInfo);
          centerA.copy(normal).multiplyScalar(height / 2).add(center); // center + normal*height/2
          centerB.copy(normal).multiplyScalar(-height / 2).add(center); // center - normal*height/2
          coneGroup.add(nodeId, treeIndex, color, centerA, centerB, radiusA, radiusB, angle);
          circleGroup.add(nodeId, treeIndex, color, centerA, normal, radiusA);
          circleGroup.add(nodeId, treeIndex, color, centerB, normal, radiusA);
        }
        break;
      case 'ClosedCylinder':
        for (let j = 0; j < geometryInfo.geometryCount; j++) {
          loadData(segmentInformation.propertyTrueValues, geometryInfo);
          centerA.copy(normal).multiplyScalar(height / 2).add(center); // center + normal*height/2
          centerB.copy(normal).multiplyScalar(-height / 2).add(center); // center - normal*height/2
          coneGroup.add(nodeId, treeIndex, color, centerA, centerB, radiusA, radiusA, angle);
          circleGroup.add(nodeId, treeIndex, color, centerA, normal, radiusA);
          circleGroup.add(nodeId, treeIndex, color, centerB, normal, radiusA);
        }
        break;
      default:
        break;
    }
  }
  return { 'circleGroup': circleGroup, 'boxGroup': boxGroup, 'coneGroup': coneGroup };
}

export { generateGeometryGroups };
