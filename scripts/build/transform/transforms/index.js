import transformDocModuleImports from "./transform-doc-module-imports.js";
import transformMethodAt from "./transform-method-at.js";
import transformMethodFindLast from "./transform-method-find-last.js";
import transformMethodFindLastIndex from "./transform-method-find-last-index.js";
import transformMethodReplaceAll from "./transform-method-replace-all.js";
import transformMethodToReversed from "./transform-method-to-reversed.js";
import transformStringRaw from "./transform-string-raw.js";

// These transforms are like Babel and core-js
// Allow us to use JavaScript features in our source code that are not yet
// implemented in the Node.js version we support

export default [
  // Node.js 18.0.0
  transformMethodFindLast,
  transformMethodFindLastIndex,
  // Node.js 16.6.0, and for performance
  transformMethodAt,
  // Node.js 15.0.0
  transformMethodReplaceAll,
  // Node.js 20
  transformMethodToReversed,
  // For performance
  transformStringRaw,
  // Replace imports with public doc module if possible
  transformDocModuleImports,
];
