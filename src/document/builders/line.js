import { breakParent } from "./break-parent.js";
import { DOC_TYPE_LINE } from "./types.js";

/**
@import {BreakParent} from "./break-parent.js";
@typedef {{readonly type: DOC_TYPE_LINE}} Line
@typedef {Line & {readonly soft: true}} SoftLine
@typedef {Line & {readonly hard: true}} HardlineWithoutBreakParent
@typedef {Line & {readonly hard: true, readonly literal: true}} LiterallineWithoutBreakParent
@typedef {readonly [HardlineWithoutBreakParent, BreakParent]} HardLine
@typedef {readonly [LiterallineWithoutBreakParent, BreakParent]} Literalline
@typedef {
  | Line
  | SoftLine
  | HardlineWithoutBreakParent
  | LiterallineWithoutBreakParent
} Lines
*/

/** @type {Line} */
const line = { type: DOC_TYPE_LINE };
/** @type {SoftLine} */
const softline = { type: DOC_TYPE_LINE, soft: true };
/** @type {HardlineWithoutBreakParent} */
const hardlineWithoutBreakParent = { type: DOC_TYPE_LINE, hard: true };
/** @type {HardLine} */
const hardline = [hardlineWithoutBreakParent, breakParent];
/** @type {LiterallineWithoutBreakParent} */
const literallineWithoutBreakParent = {
  type: DOC_TYPE_LINE,
  hard: true,
  literal: true,
};
/** @type {Literalline} */
const literalline = [literallineWithoutBreakParent, breakParent];

export {
  hardline,
  hardlineWithoutBreakParent,
  line,
  literalline,
  literallineWithoutBreakParent,
  softline,
};
