// Copyright 2019 Cognite AS

import * as THREE from 'three';

const xAxis = new THREE.Vector3(1, 0, 0);
const yAxis = new THREE.Vector3(0, 1, 0);
const zAxis = new THREE.Vector3(0, 0, 1);

const twoPI = Math.PI * 2.0;
const degToRadFactor = Math.PI / 180;

const identityMatrix4 = new THREE.Matrix4();
const identityPosition = new THREE.Vector3(0, 0, 0);
const identityQuaternion = new THREE.Quaternion(1, 0, 0, 0);
const identityScale = new THREE.Vector3(1, 1, 1);

export {
  xAxis,
  yAxis,
  zAxis,
  twoPI,
  identityMatrix4,
  degToRadFactor,
  identityPosition,
  identityQuaternion,
  identityScale,
};
