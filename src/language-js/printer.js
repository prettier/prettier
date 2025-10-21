export const experimentalFeatures = {
  // TODO: Make this default behavior
  avoidAstMutation: true,
};
export { default as massageAstNode } from "./clean.js";
export {
  canAttachComment,
  handleComments,
  isBlockComment,
  isGap,
  printComment,
  willPrintOwnComments,
} from "./comments/printer-methods.js";
export { default as embed } from "./embed/index.js";
export { insertPragma } from "./pragma.js";
export {
  default as print,
  default as printPrettierIgnored,
} from "./print/index.js";
export { default as getVisitorKeys } from "./traverse/get-visitor-keys.js";
export { default as hasPrettierIgnore } from "./utils/is-ignored.js";
