import transformObjectHasOwnCall from "./transform-object-has-own.js";
import transformRelativeIndexing from "./transform-relative-indexing.js";
import transformStringReplaceAll from "./transform-string-replace-all.js";
import transformArrayFindLast from "./transform-array-find-last.js";

export default [
  transformObjectHasOwnCall,
  transformRelativeIndexing,
  transformStringReplaceAll,
  transformArrayFindLast,
];
