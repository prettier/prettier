import { isPragma } from "./pragma.js";

function clean(original, cloned /* , parent */) {
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
      // We may insert explicit start/end mark
      delete cloned.directivesEndMarker;
      delete cloned.documentEndMarker;
      break;
  }
}
clean.ignoredProperties = new Set(["position"]);

export default clean;
