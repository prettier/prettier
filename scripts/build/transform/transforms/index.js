import transformArrayFindLast from "./transform-array-find-last.js";
import transformObjectHasOwnCall from "./transform-object-has-own.js";
import transformRelativeIndexing from "./transform-relative-indexing.js";
import transformStringReplaceAll from "./transform-string-replace-all.js";

export default [
  transformObjectHasOwnCall,
  transformRelativeIndexing,
  transformStringReplaceAll,
  transformArrayFindLast,
];
