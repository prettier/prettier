import { group, indent, line } from "../../document/index.js";
import { printDeclareToken } from "./miscellaneous.js";

/*
- `DeclareOpaqueType`(flow)
- `OpaqueType`(flow)
*/
function printOpaqueType(path, options, print) {
  const { node } = path;
  const parts = [
    printDeclareToken(path),
    "opaque type ",
    print("id"),
    print("typeParameters"),
  ];

  if (node.supertype) {
    parts.push(": ", print("supertype"));
  }

  if (node.lowerBound || node.upperBound) {
    const lowerAndUpperBoundParts = [];
    if (node.lowerBound) {
      lowerAndUpperBoundParts.push(
        indent([line, "super ", print("lowerBound")]),
      );
    }
    if (node.upperBound) {
      lowerAndUpperBoundParts.push(
        indent([line, "extends ", print("upperBound")]),
      );
    }
    parts.push(group(lowerAndUpperBoundParts));
  }

  if (node.impltype) {
    parts.push(" = ", print("impltype"));
  }

  parts.push(options.semi ? ";" : "");

  return parts;
}

export { printOpaqueType };
