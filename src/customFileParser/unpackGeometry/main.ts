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
          // Found destination primitive group
          destinationGroup = primitiveGroup;
        } else {
          destinationGroup = createGroup(originalSector, renderedPrimitiveInfo.name);
        }
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

export function unpackFilePrimitive(
  currentSector: Sector,
  primitiveCompressedData: CompressedGeometryData,
  uncompressedValues: any,
  treeIndexNodeIdMap: any,
  colorMap: any) {

  const destinationPrimitiveGroups: any = {};
  renderedPrimitivesPerFilePrimitive[primitiveCompressedData.type].forEach(renderedPrimitiveInfo => {
    destinationPrimitiveGroups[renderedPrimitiveInfo.name] =
      findOrCreateDestinationGroup(currentSector, renderedPrimitiveInfo);
  });

  const data = new PropertyLoader(uncompressedValues);
  for (let j = 0; j < primitiveCompressedData.count; j++) {
    data.loadData(primitiveCompressedData);
    treeIndexNodeIdMap[data.treeIndex] = data.nodeId;
    colorMap[data.treeIndex] = data.nodeId;
    // @ts-ignore
    renderedPrimitiveToAddFunction[primitiveCompressedData.type].call(this, destinationPrimitiveGroups, data);
  }
}

export { unpackInstancedMesh, unpackTriangleMesh };
