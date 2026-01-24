// Replace imports with public doc module if possible
export { default as "doc-module-imports" } from "./transform-doc-module-imports.js";
// Node.js 16.6.0, and for performance in Node.js 18
export { default as "method-at" } from "./transform-method-at.js";
// Node.js 18.0.0
export { default as "method-find-last" } from "./transform-method-find-last.js";
// Node.js 18.0.0
export { default as "method-find-last-index" } from "./transform-method-find-last-index.js";
// Node.js 15.0.0
export { default as "method-replace-all" } from "./transform-method-replace-all.js";
// Node.js 20
export { default as "method-to-reversed" } from "./transform-method-to-reversed.js";
// Node.js 20
export { default as "method-is-well-formed" } from "./transform-method-is-well-formed.js";
// Node.js 16.9.0
export { default as "object-has-own" } from "./transform-object-has-own.js";
// For performance
export { default as "string-raw" } from "./transform-string-raw.js";
