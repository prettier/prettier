import transformMethodAt from "./transform-method-at.js";
import transformMethodFindLast from "./transform-method-find-last.js";
import transformMethodFindLastIndex from "./transform-method-find-last-index.js";
import transformMethodReplaceAll from "./transform-method-replace-all.js";
import transformMethodToReversed from "./transform-method-to-reversed.js";
import transformObjectHasOwnCall from "./transform-object-has-own.js";
import transformStringRaw from "./transform-string-raw.js";

export default [
  // Node.js 18.0.0
  transformMethodFindLast,
  transformMethodFindLastIndex,
  // Node.js 16.9.0
  transformObjectHasOwnCall,
  // Node.js 16.6.0, and for performance
  transformMethodAt,
  // Node.js 15.0.0
  transformMethodReplaceAll,
  // Node.js 20
  transformMethodToReversed,
  // For performance
  transformStringRaw,
];
