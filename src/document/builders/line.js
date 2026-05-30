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
const line = Object.freeze({ type: DOC_TYPE_LINE });
/** @type {SoftLine} */
const softline = Object.freeze({ type: DOC_TYPE_LINE, soft: true });
/** @type {HardlineWithoutBreakParent} */
const hardlineWithoutBreakParent = Object.freeze({ type: DOC_TYPE_LINE, hard: true });
/** @type {HardLine} */
const hardline = Object.freeze([hardlineWithoutBreakParent, breakParent]);
/** @type {LiterallineWithoutBreakParent} */
const literallineWithoutBreakParent = Object.freeze({
  type: DOC_TYPE_LINE,
  hard: true,
  literal: true,
});
/** @type {Literalline} */
const literalline = Object.freeze([literallineWithoutBreakParent, breakParent]);

export {
  hardline,
  hardlineWithoutBreakParent,
  line,
  literalline,
  literallineWithoutBreakParent,
  softline,
};
