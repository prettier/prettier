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
      // We may insert explicit marks
      if (!cloned.directivesEndMarker) {
        delete cloned.directivesEndMarker;
      }
      if (!cloned.documentEndMarker) {
        delete cloned.documentEndMarker;
      }
      break;

    case "blockLiteral":
    case "blockFolded":
      // The doc printer currently have bug when print trailing space/tab, they get wiped.
      // But at least we can still make sure the new lines doesn't change in `value` property.
      if (original.chomping === "keep") {
        cloned.value = original.value
          .split("\n")
          .map((line) => line.replace(/[ \t]+$/u, ""))
          .join("\n");
      }
      break;
  }
}
clean.ignoredProperties = new Set(["position"]);

export default clean;
