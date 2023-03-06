import {
  join,
  line,
  softline,
  hardline,
  literalline,
  group,
  conditionalGroup,
  fill,
  lineSuffix,
  lineSuffixBoundary,
  cursor,
  breakParent,
  ifBreak,
  trim,
  indent,
  indentIfBreak,
  align,
  addAlignmentToDoc,
  markAsRoot,
  dedentToRoot,
  dedent,
  hardlineWithoutBreakParent,
  literallineWithoutBreakParent,
  label,
} from "./builders.js";
import { printDocToString } from "./printer.js";
import {
  willBreak,
  traverseDoc,
  findInDoc,
  mapDoc,
  removeLines,
  replaceEndOfLine,
  canBreak,
} from "./utils.js";

export const builders = {
  join,
  line,
  softline,
  hardline,
  literalline,
  group,
  conditionalGroup,
  fill,
  lineSuffix,
  lineSuffixBoundary,
  cursor,
  breakParent,
  ifBreak,
  trim,
  indent,
  indentIfBreak,
  align,
  addAlignmentToDoc,
  markAsRoot,
  dedentToRoot,
  dedent,
  hardlineWithoutBreakParent,
  literallineWithoutBreakParent,
  label,
  // TODO: Remove this in v4
  concat: (parts) => parts,
};
export const printer = { printDocToString };
export const utils = {
  willBreak,
  traverseDoc,
  findInDoc,
  mapDoc,
  removeLines,
  replaceEndOfLine,
  canBreak,
};
