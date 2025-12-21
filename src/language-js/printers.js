const features = {
  // TODO: Make this default behavior
  experimental_avoidAstMutation: true,
};
import massageAstNode from "./clean.js";
import canAttachComment from "./comments/can-attach-comment.js";
import handleComments from "./comments/handle-comments.js";
import isGap from "./comments/is-gap.js";
import willPrintOwnComments from "./comments/will-print-own-comments.js";
import embed from "./embed/index.js";
import { insertPragma } from "./pragma.js";
import { printComment } from "./print/comment.js";
import { printEstree } from "./print/index.js";
import getVisitorKeys from "./traverse/get-visitor-keys.js";
import isBlockComment from "./utilities/is-block-comment.js";
import hasPrettierIgnore from "./utilities/is-ignored.js";

const estree = {
  features,
  massageAstNode,
  canAttachComment,
  handleComments,
  isGap,
  willPrintOwnComments,
  embed,
  insertPragma,
  printComment,
  printPrettierIgnored: printEstree,
  print: printEstree,
  getVisitorKeys,
  isBlockComment,
  hasPrettierIgnore,
};

export { estree };
