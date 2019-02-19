import { CompressedGeometryData } from './../sharedFileParserTypes';
import PropertyLoader from './../PropertyLoader';
import { renderedPrimitiveToAddFunction, renderedPrimitivesPerFilePrimitive, renderedPrimitiveToGroup }
  from '../parserParameters';
import unpackInstancedMesh from './InstancedMesh';
import unpackTriangleMesh from './TriangleMesh';
import { Sector } from '../..';

function createGroup(sector: Sector, primitiveName: string) {
  const createdGroup = new renderedPrimitiveToGroup[primitiveName](5000);
  sector.primitiveGroups.push(createdGroup);
  return createdGroup;
}

function findOrCreateDestinationGroup(
  originalSector: Sector,
  renderedPrimitiveInfo: {name: string, count: number}) {

  let searchSector: Sector | undefined = originalSector;
  let destinationGroup: any = undefined;

  while ((searchSector !== undefined) && (destinationGroup === undefined)) {

    searchSector.primitiveGroups.forEach(primitiveGroup => {
      if (primitiveGroup.type === renderedPrimitiveInfo.name) {
        if (primitiveGroup.capacity >= primitiveGroup.data.count + renderedPrimitiveInfo.count) {
          destinationGroup = primitiveGroup;
        }
        return;
      }
    });

    searchSector = searchSector.parent;
  }

  if (destinationGroup) {
    return destinationGroup;
  } else {
    return createGroup(originalSector, renderedPrimitiveInfo.name);
  }
}

function updateDestinationGroups(
  destinationPrimitiveGroups: any,
  currentSector: Sector,
  primitiveCompressedData: any,
) {
  renderedPrimitivesPerFilePrimitive[primitiveCompressedData.type].forEach(renderedPrimitiveInfo => {
    const destinationGroup = destinationPrimitiveGroups[renderedPrimitiveInfo.name];
    if ( destinationGroup === undefined ||
      destinationGroup.capacity <= destinationGroup.data.count + renderedPrimitiveInfo.count) {
        destinationPrimitiveGroups[renderedPrimitiveInfo.name] =
          findOrCreateDestinationGroup(currentSector, renderedPrimitiveInfo);
      }
  });
}

export function unpackFilePrimitive(
  currentSector: Sector,
  primitiveCompressedData: CompressedGeometryData,
  uncompressedValues: any,
  treeIndexNodeIdMap: any,
  colorMap: any) {

  const destinationPrimitiveGroups: any = {};
  updateDestinationGroups(destinationPrimitiveGroups, currentSector, primitiveCompressedData);

  const data = new PropertyLoader(uncompressedValues);
  for (let j = 0; j < primitiveCompressedData.count; j++) {
    data.loadData(primitiveCompressedData);
    treeIndexNodeIdMap[data.treeIndex] = data.nodeId;
    colorMap[data.treeIndex] = data.color;
    // @ts-ignore
    renderedPrimitiveToAddFunction[primitiveCompressedData.type].call(this, destinationPrimitiveGroups, data);
  }
}

export { unpackInstancedMesh, unpackTriangleMesh };
