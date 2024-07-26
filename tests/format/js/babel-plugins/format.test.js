// Only testing babel parsing
// Do not add extra parsers here

runFormatTest(import.meta, ["babel", "babel-ts", "babel-flow"], {
  errors: {
    acorn: [
      "decimal.js",
      "decorators.js",
      "destructuring-private.js",
      "do-expressions.js",
      "export-default-from.js",
      "flow.js",
      "function-bind.js",
      "function-sent.js",
      "import-assertions-dynamic.js",
      "import-assertions-static.js",
      "import-attributes-dynamic.js",
      "import-attributes-static.js",
      "partial-application.js",
      "pipeline-operator-fsharp.js",
      "pipeline-operator-minimal.js",
      "pipeline-operator-hack.js",
      "record-tuple-record.js",
      "record-tuple-tuple.js",
      "throw-expressions.js",
      "typescript.js",
      "v8intrinsic.js",
      "module-blocks.js",
      "async-do-expressions.js",
      "decorator-auto-accessors.js",
      "import-reflection.js",
      "explicit-resource-management.js",
      "regexp-modifiers.js",
      "source-phase-imports.js",
      "deferred-import-evaluation.js",
      "optional-chaining-assignment.js",
    ],
    espree: [
      "decimal.js",
      "decorators.js",
      "destructuring-private.js",
      "do-expressions.js",
      "export-default-from.js",
      "flow.js",
      "function-bind.js",
      "function-sent.js",
      "import-assertions-dynamic.js",
      "import-assertions-static.js",
      "import-attributes-dynamic.js",
      "import-attributes-static.js",
      "partial-application.js",
      "pipeline-operator-fsharp.js",
      "pipeline-operator-minimal.js",
      "pipeline-operator-hack.js",
      "record-tuple-record.js",
      "record-tuple-tuple.js",
      "throw-expressions.js",
      "typescript.js",
      "v8intrinsic.js",
      "module-blocks.js",
      "async-do-expressions.js",
      "decorator-auto-accessors.js",
      "import-reflection.js",
      "explicit-resource-management.js",
      "regexp-modifiers.js",
      "source-phase-imports.js",
      "deferred-import-evaluation.js",
      "optional-chaining-assignment.js",
    ],
    meriyah: [
      "decimal.js",
      "do-expressions.js",
      "destructuring-private.js",
      "export-default-from.js",
      "flow.js",
      "function-bind.js",
      "function-sent.js",
      "module-attributes-dynamic.js",
      "module-attributes-static.js",
      "partial-application.js",
      "pipeline-operator-fsharp.js",
      "pipeline-operator-minimal.js",
      "pipeline-operator-hack.js",
      "record-tuple-record.js",
      "record-tuple-tuple.js",
      "throw-expressions.js",
      "typescript.js",
      "v8intrinsic.js",
      "import-assertions-static.js",
      "module-string-names.js",
      "module-blocks.js",
      "async-do-expressions.js",
      "regex-v-flag.js",
      "import-reflection.js",
      "explicit-resource-management.js",
      "regexp-modifiers.js",
      "source-phase-imports.js",
      "deferred-import-evaluation.js",
      "optional-chaining-assignment.js",
    ],
    babel: ["flow.js", "typescript.js"],
    __babel_estree: ["flow.js", "typescript.js"],
  },
});
