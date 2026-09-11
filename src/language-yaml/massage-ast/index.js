import { isPragma } from "../pragma.js";

function massageAstNode(original, cloned /* , parent */) {
  switch (original.type) {
    case "comment":
      // insert pragma
      if (isPragma(original.value)) {
        return null;
      }
      break;
    case "quoteDouble":
    case "quoteSingle":
      cloned.type = "quote";
      break;
    case "document":
      // We may insert explicit marks
      if (!cloned.directivesEndMarker) {
        delete cloned.directivesEndMarker;
      }
      if (!cloned.documentEndMarker) {
        delete cloned.documentEndMarker;
      }
      break;
  }
}
massageAstNode.ignoredProperties = new Set(["position"]);

export { massageAstNode };
