import { GeometryIndexHandler } from './sharedFileParserTypes';
import { renderedPrimitives, renderedPrimitivesPerFilePrimitive, filePrimitives, primitiveNames }
  from './parserParameters';

export default function countRenderedPrimitives(geometryIndexHandlers: GeometryIndexHandler[]) {
  const counts: {[name: string]: number} = {};
  renderedPrimitives.forEach(renderedPrimitive => {
    counts[renderedPrimitive] = 0;
  });

  geometryIndexHandlers.forEach(geometryIndexHandler => {
    if (filePrimitives.indexOf(geometryIndexHandler.name as primitiveNames) !== -1) {
      renderedPrimitivesPerFilePrimitive[geometryIndexHandler.name].forEach(renderedPrimitive => {
        counts[renderedPrimitive] += geometryIndexHandler.count;
      });
    }
  });

  return counts;
}
