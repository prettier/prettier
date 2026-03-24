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

    case "blockLiteral":
    case "blockFolded":
      // The doc printer currently have bug when print trailing space/tab, they get wiped.
      // But at least we can still make sure the new lines doesn't change in `value` property.
      if (original.chomping === "keep") {
        cloned.value = original.value
          .split("\n")
          .map((line) => line.replace(/[ \t]+$/, ""))
          .join("\n");
      }
      break;
    // Multi-line flow collections are rewritten in block form, so flow and
    // block variants must compare equal for AST-equivalence checks.
    case "flowMapping":
      cloned.type = "mapping";
      delete cloned.trailingComment;
      delete cloned.endComments;
      break;
    case "flowSequence":
      cloned.type = "sequence";
      delete cloned.trailingComment;
      break;
    case "flowMappingItem":
      cloned.type = "mappingItem";
      break;
    case "flowSequenceItem":
      cloned.type = "sequenceItem";
      cloned.leadingComments = [];
      cloned.trailingComment = null;
      cloned.endComments = [];
      break;
  }
}
massageAstNode.ignoredProperties = new Set(["position"]);

export { massageAstNode };
