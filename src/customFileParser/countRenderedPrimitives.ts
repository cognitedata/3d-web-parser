import { GeometryIndexHandler } from './sharedFileParserTypes';
<<<<<<< HEAD
import { renderedPrimitives, renderedPrimitivesPerFilePrimitive, filePrimitives, primitiveNames }
  from './parserParameters';
=======
import { renderedPrimitives, renderedPrimitivesPerFilePrimitive, filePrimitives } from './parserParameters';
>>>>>>> 4b4fd2f7f7f1fa4671d4ff9bd700192a6884c107

export default function countRenderedPrimitives(geometryIndexHandlers: GeometryIndexHandler[]) {
  const counts: {[name: string]: number} = {};
  renderedPrimitives.forEach(renderedPrimitive => {
    counts[renderedPrimitive] = 0;
  });

  geometryIndexHandlers.forEach(geometryIndexHandler => {
<<<<<<< HEAD
    if (filePrimitives.indexOf(geometryIndexHandler.name as primitiveNames) !== -1) {
=======
    if (filePrimitives.indexOf(geometryIndexHandler.name) !== -1) {
>>>>>>> 4b4fd2f7f7f1fa4671d4ff9bd700192a6884c107
      renderedPrimitivesPerFilePrimitive[geometryIndexHandler.name].forEach(renderedPrimitive => {
        counts[renderedPrimitive] += geometryIndexHandler.count;
      });
    }
  });

  return counts;
}
