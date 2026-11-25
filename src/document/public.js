import {
  addAlignmentToDoc,
  align,
  breakParent as internalBreakParent,
  conditionalGroup,
  cursor as internalCursor,
  dedent,
  dedentToRoot,
  fill,
  group,
  hardlineWithoutBreakParent as internalHardlineWithoutBreakParent,
  ifBreak,
  indent,
  indentIfBreak,
  join,
  label,
  line as internalLine,
  lineSuffix,
  lineSuffixBoundary as internalLineSuffixBoundary,
  literallineWithoutBreakParent as internalLiterallineWithoutBreakParent,
  markAsRoot,
  softline as internalSoftline,
  trim as internalTrim,
} from "./builders/index.js";
import { printDocToString } from "./printer/printer.js";
import {
  canBreak,
  findInDoc,
  mapDoc,
  removeLines,
  replaceEndOfLine,
  stripTrailingHardline,
  traverseDoc,
  willBreak,
} from "./utilities/index.js";

const breakParent = Object.freeze({ ...internalBreakParent });
const cursor = Object.freeze({ ...internalCursor });
const line = Object.freeze({ ...internalLine });
const softline = Object.freeze({ ...internalSoftline });
const hardlineWithoutBreakParent = Object.freeze({
  ...internalHardlineWithoutBreakParent,
});
const hardline = Object.freeze([hardlineWithoutBreakParent, breakParent]);
const lineSuffixBoundary = Object.freeze({ ...internalLineSuffixBoundary });
const literallineWithoutBreakParent = Object.freeze({
  ...internalLiterallineWithoutBreakParent,
});
const literalline = Object.freeze([literallineWithoutBreakParent, breakParent]);
const trim = Object.freeze({ ...internalTrim });

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
  stripTrailingHardline,
  replaceEndOfLine,
  canBreak,
};
