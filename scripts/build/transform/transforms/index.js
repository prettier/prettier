import transformArrayFindLast from "./transform-array-find-last.js";
import transformArrayFindLastIndex from "./transform-array-find-last-index.js";
import transformObjectHasOwnCall from "./transform-object-has-own.js";
import transformRelativeIndexing from "./transform-relative-indexing.js";
import transformStringReplaceAll from "./transform-string-replace-all.js";

// These transforms are like Babel and core-js
// Allow us to use JavaScript features in our source code that are not yet
// implemented in the Node.js version we support

export default [
  // Node.js 18.0.0
  transformArrayFindLast,
  transformArrayFindLastIndex,
  // Node.js 16.9.0
  transformObjectHasOwnCall,
  // Node.js 16.6.0
  transformRelativeIndexing,
  // Node.js 15.0.0
  transformStringReplaceAll,
];
