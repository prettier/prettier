import { printOptionalToken } from "./miscellaneous.js";

/*
- `TSIndexedAccessType`(TypeScript)
- `IndexedAccessType`(flow)
- `OptionalIndexedAccessType`(flow)
*/
function printIndexedAccessType(path, options, print) {
  return [
    print("objectType"),
    printOptionalToken(path),
    "[",
    print("indexType"),
    "]",
  ];
}

export { printIndexedAccessType };
