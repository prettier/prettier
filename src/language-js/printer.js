export const features = {
  // TODO: Make this default behavior
  experimental_avoidAstMutation: true,
};
export { default as massageAstNode } from "./clean.js";
export { default as canAttachComment } from "./comments/can-attach-comment.js";
export { default as handleComments } from "./comments/handle-comments.js";
export { default as isGap } from "./comments/is-gap.js";
export { default as willPrintOwnComments } from "./comments/will-print-own-comments.js";
export { default as embed } from "./embed/index.js";
export { insertPragma } from "./pragma.js";
export { printComment } from "./print/comment.js";
export {
  default as print,
  default as printPrettierIgnored,
} from "./print/index.js";
export { default as getVisitorKeys } from "./traverse/get-visitor-keys.js";
export { default as isBlockComment } from "./utilities/is-block-comment.js";
export { default as hasPrettierIgnore } from "./utilities/is-ignored.js";
