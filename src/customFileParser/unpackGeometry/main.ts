import { RenderedPrimitiveGroups, GeometryIndexHandler } from './../sharedFileParserTypes';
import PropertyLoader from './../PropertyLoader';
import { renderedPrimitiveToAddFunction } from '../parserParameters';
import unpackInstancedMesh from './InstancedMesh';
import unpackTriangleMesh from './TriangleMesh';

export function unpackPrimitive(
  renderedPrimitiveGroups: RenderedPrimitiveGroups, primitiveIndexHandler: GeometryIndexHandler,
  uncompressedValues: any) {

  const data = new PropertyLoader(uncompressedValues);
  for (let j = 0; j < primitiveIndexHandler.count; j++) {
    data.loadData(primitiveIndexHandler);
    // @ts-ignore
    renderedPrimitiveToAddFunction[primitiveIndexHandler.name].call(this, renderedPrimitiveGroups, data);
  }
}

export { unpackInstancedMesh, unpackTriangleMesh };
