import { group, indent, line } from "../../document/index.js";
import { hasLeadingOwnLineComment, isObjectType } from "../utilities/index.js";

// `TSIntersectionType` and `IntersectionTypeAnnotation`
function printIntersectionType(path, options, print) {
  let wasIndented = false;
  return group(
    path.map(({ isFirst, previous, node, index }) => {
      const doc = print();
      if (isFirst) {
        return doc;
      }

      const currentIsObjectType = isObjectType(node);
      const previousIsObjectType = isObjectType(previous);

      // If both are objects, don't indent
      if (previousIsObjectType && currentIsObjectType) {
        return [" & ", wasIndented ? indent(doc) : doc];
      }

      if (
        // If no object is involved, go to the next line if it breaks
        (!previousIsObjectType && !currentIsObjectType) ||
        hasLeadingOwnLineComment(options.originalText, node)
      ) {
        if (options.experimentalOperatorPosition === "start") {
          return indent([line, "& ", doc]);
        }
        return indent([" &", line, doc]);
      }

      // If you go from object to non-object or vis-versa, then inline it
      if (index > 1) {
        wasIndented = true;
      }

      return [" & ", index > 1 ? indent(doc) : doc];
    }, "types"),
  );
}

export { printIntersectionType };
