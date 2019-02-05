import { RenderedGeometryGroups, GeometryIndexHandler } from './../sharedFileParserTypes';
import PropertyLoader from './../PropertyLoader';
import { renderedGeometryToAddFunction } from '../parserParameters';

export default function unpackGeometry(
  renderedGeometryGroups: RenderedGeometryGroups, geometryIndexHandlers: GeometryIndexHandler[],
  trueValueArrays: any, groupName: string) {
  const data = new PropertyLoader(trueValueArrays);

  geometryIndexHandlers.forEach(geometryIndexHandler => {
    if (geometryIndexHandler.name === groupName) {
      for (let j = 0; j < geometryIndexHandler.geometryCount; j++) {
        data.loadData(geometryIndexHandler);
        // @ts-ignore
        renderedGeometryToAddFunction[geometryIndexHandler.name].call(this, renderedGeometryGroups, data);
        return;
      }
    }
  });

  // some geometryNames won't be found in geometryIndexHandlers -- that's ok
}
