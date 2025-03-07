export const experimentalFeatures = {
  // TODO: Make this default behavior
  avoidAstMutation: true,
};
export { default as massageAstNode } from "./clean.js";
export * from "./comments/printer-methods.js";
export { default as embed } from "./embed/index.js";
export { insertPragma } from "./pragma.js";
export { default as print } from "./print/index.js";
export { default as getVisitorKeys } from "./traverse/get-visitor-keys.js";
