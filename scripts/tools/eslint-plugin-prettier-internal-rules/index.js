"use strict";

module.exports = {
  rules: {
    "await-cli-tests": require("./await-cli-tests.js"),
    "better-parent-property-check-in-needs-parens": require("./better-parent-property-check-in-needs-parens.js"),
    "directly-loc-start-end": require("./directly-loc-start-end.js"),
    "flat-ast-path-call": require("./flat-ast-path-call.js"),
    "jsx-identifier-case": require("./jsx-identifier-case.js"),
    "massage-ast-parameter-names": require("./massage-ast-parameter-names.js"),
    "no-conflicting-comment-check-flags": require("./no-conflicting-comment-check-flags.js"),
    "no-doc-public-import": require("./no-doc-public-import.js"),
    "no-empty-flat-contents-for-if-break": require("./no-empty-flat-contents-for-if-break.js"),
    "no-identifier-n": require("./no-identifier-n.js"),
    "no-legacy-format-test": require("./no-legacy-format-test.js"),
    "no-node-comments": require("./no-node-comments.js"),
    "no-unnecessary-ast-path-call": require("./no-unnecessary-ast-path-call.js"),
    "prefer-ast-path-each": require("./prefer-ast-path-each.js"),
    "prefer-create-type-check-function": require("./prefer-create-type-check-function.js"),
    "prefer-indent-if-break": require("./prefer-indent-if-break.js"),
    "prefer-is-non-empty-array": require("./prefer-is-non-empty-array.js"),
    "prefer-fs-promises-submodule": require("./prefer-fs-promises-submodule.js"),
    "prefer-ast-path-getters": require("./prefer-ast-path-getters.js"),
  },
};
