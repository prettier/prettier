import sassTestSuite from "sass-test-suite";

/* spell-checker: disable */
const SKIP = new Set([
  // Expect errors
  "css/comment.hrx/error/loud/unterminated/scss/input.scss",
  "css/custom_properties/error.hrx/brackets/curly/input.scss",
  "css/custom_properties/error.hrx/brackets/paren/input.scss",
  "css/custom_properties/error.hrx/brackets/curly_in_square/input.scss",
  "css/custom_properties/error.hrx/brackets/paren_in_curly/input.scss",
  "css/function.hrx/error/interpolated/result/characters/input.scss",
  "css/function.hrx/error/result/interpolated/characters/input.scss",
  "css/function.hrx/error/result/style_rule/characters/input.scss",
  "css/important.hrx/error/syntax/eof_after_bang/input.scss",
  "non_conformant/errors/interpolation/error-1.hrx/input.scss",
  "non_conformant/errors/unicode/report/after.hrx/input.scss",
  "css/unknown_directive/error.hrx/interpolation/space_after_at/input.scss",
  "parser/interpolation.hrx/error/partial_bracket/scss/input.scss",
  "css/propset.hrx/error/value_after_propset/input.scss",
  "css/supports/error.hrx/syntax/declaration/parens/input.scss",
  "css/unknown_directive/error.hrx/space_after_at/input.scss",
  "directives/forward/error/syntax.hrx/as/no_star/input.scss",
  "non_conformant/errors/unicode/report/before.hrx/input.scss",
  "non_conformant/parser/arglists/can-end-with-comma/error-include-3.hrx/input.scss",
]);
const BUGS = new Set([
  // Can't parse
  "css/custom_properties/indentation.hrx/input.scss",
  "css/custom_properties/nesting_characters.hrx/input.scss",
  "css/custom_properties/simple.hrx/input.scss",
  "css/function.hrx/lowercase/result/characters/input.scss",
  "css/function.hrx/uppercase/result/characters/input.scss",
  "css/function.hrx/result/uppercase/characters/input.scss",
  "css/functions/special/prefixed/lowercase.hrx/url/punctuation/input.scss",
  "css/functions/special/prefixed/lowercase.hrx/progid/number/input.scss",
  "css/functions/special/prefixed/lowercase.hrx/progid/punctuation/input.scss",
  "css/functions/special/prefixed/lowercase.hrx/progid/script_like/input.scss",
  "css/functions/special/prefixed/lowercase.hrx/progid/interpolation/input.scss",
  "css/functions/special/prefixed/uppercase.hrx/url/punctuation/input.scss",
  "css/functions/special/prefixed/uppercase.hrx/progid/number/input.scss",
  "css/functions/special/prefixed/uppercase.hrx/progid/punctuation/input.scss",
  "css/functions/special/prefixed/uppercase.hrx/progid/script_like/input.scss",
  "css/functions/special/prefixed/uppercase.hrx/progid/interpolation/input.scss",
  "css/functions/special/unprefixed.hrx/uppercase/url/exclam/middle/input.scss",
  "libsass-closed-issues/issue_2371.hrx/input.scss",
  "libsass-todo-issues/issue_1694/quoted-right-paren.hrx/input.scss",
  "libsass-todo-issues/issue_1798/3.hrx/input.scss",
  "libsass-todo-issues/issue_221262.hrx/input.scss",
  "non_conformant/parser/arglists/can-end-with-comma/error-call-3.hrx/input.scss",
  "non_conformant/parser/interpolate/26_escaped_literal_quotes/01_inline.hrx/input.scss",
  "non_conformant/parser/interpolate/26_escaped_literal_quotes/03_inline_double.hrx/input.scss",
  "non_conformant/parser/interpolate/28_escaped_single_quotes/03_inline_double.hrx/input.scss",
  "values/strings.hrx/new-line/scss/ff/input.scss",
  "css/supports/comment.hrx/before_query/silent/input.scss",
  "css/url.hrx/escape/close_paren/input.scss",
  "libsass-closed-issues/issue_1484.hrx/input.scss",
  "libsass-closed-issues/issue_221255.hrx/input.scss",
  "libsass-closed-issues/issue_2307.hrx/input.scss",
  "libsass-todo-issues/issue_221292.hrx/input.scss",
  "non_conformant/parser/interpolate/27_escaped_double_quotes/03_inline_double.hrx/input.scss",

  // Unstable or different AST
  "callable/arguments.hrx/mixin/error/comma_only/input.scss",
  "callable/arguments.hrx/function/error/comma_only/input.scss",
  "callable/parameters.hrx/mixin/error/comma_only/input.scss",
  "callable/parameters.hrx/function/error/comma_only/input.scss",
  "callable/whitespace.hrx/newlines/function_invocation/before_list/scss/input.scss",
  "css/custom_properties/trailing_comment.hrx/scss/silent/input.scss",
  "css/function.hrx/uppercase/result/sass_script/input.scss",
  "css/function.hrx/uppercase/result/interpolation/input.scss",
  "css/media/comment.hrx/before_query/silent/input.scss",
  "css/media/comment.hrx/after_query/silent/input.scss",
  "css/moz_document/functions/interpolated.hrx/input.scss",
  "css/moz_document/functions/static.hrx/input.scss",
  "css/moz_document/multi_function.hrx/input.scss",
  "css/selector/attribute.hrx/scss/whitespace/after_operator/input.scss",
  "css/supports/comment.hrx/declaration/normal_prop/before_colon/silent/input.scss",
  "css/supports/comment.hrx/declaration/custom_prop/before_colon/silent/input.scss",
  "css/supports/comment.hrx/after_query/silent/input.scss",
  "css/unknown_directive/comment.hrx/no_children/no_value/silent/input.scss",
  "directives/extend/comment.hrx/after_arg/silent/input.scss",
  "directives/extend/comment.hrx/after_optional/silent/input.scss",
  "directives/forward/comment.hrx/before_colon/silent/input.scss",
  "directives/forward/error/syntax.hrx/with/extra_comma/input.scss",
  "directives/function/comment.hrx/function/after_args/silent/input.scss",
  "directives/function/comment.hrx/return/after_value/silent/input.scss",
  "directives/if/comment.hrx/else/before_block/loud/input.scss",
  "directives/if/comment.hrx/else/before_block/silent/input.scss",
  "directives/import/comment.hrx/before_comma/silent/input.scss",
  "directives/mixin/comment.hrx/mixin/after_args/silent/input.scss",
  "directives/mixin/comment.hrx/content/after_content/silent/input.scss",
  "directives/mixin/comment.hrx/content/after_args/silent/input.scss",
  "directives/mixin/comment.hrx/include/before_block/silent/input.scss",
  "directives/mixin/comment.hrx/include/after_using_arglist/silent/input.scss",
  "directives/use/comment.hrx/before_colon/silent/input.scss",
  "directives/use/error/syntax/with.hrx/extra_comma/input.scss",
  "expressions/if/syntax.hrx/whitespace/before_semi/input.scss",
  "expressions/if/syntax.hrx/whitespace/before_trailing_semi/input.scss",
  "libsass-closed-issues/issue_1081.hrx/input.scss",
  "libsass-closed-issues/issue_1081.hrx/_import.scss",
  "libsass-closed-issues/issue_1394.hrx/input.scss",
  "libsass-closed-issues/issue_1596.hrx/input.scss",
  "libsass-closed-issues/issue_1648.hrx/input.scss",
  "libsass-closed-issues/issue_2140.hrx/input.scss",
  "libsass-closed-issues/issue_502.hrx/input.scss",
  "libsass-closed-issues/issue_535.hrx/input.scss",
  "libsass-closed-issues/issue_759.hrx/input.scss",
  "libsass-todo-issues/issue_221264.hrx/input.scss",
  "libsass/propsets.hrx/input.scss",
  "non_conformant/basic/36_extra_commas_in_selectors.hrx/input.scss",
  "non_conformant/extend-tests/089_test_negation_unification.hrx/input.scss",
  "non_conformant/extend-tests/236_extend_with_universal_selector_empty_namespace.hrx/input.scss",
  "non_conformant/misc/trailing_comma_in_selector.hrx/input.scss",
  "non_conformant/parser/arglists/can-end-with-comma/error-call-2.hrx/input.scss",
  "non_conformant/parser/arglists/can-end-with-comma/error-function-2.hrx/input.scss",
  "non_conformant/parser/arglists/can-end-with-comma/error-function-3.hrx/input.scss",
  "non_conformant/parser/arglists/can-end-with-comma/error-include-2.hrx/input.scss",
  "non_conformant/parser/arglists/can-end-with-comma/error-mixin-2.hrx/input.scss",
  "non_conformant/parser/arglists/can-end-with-comma/error-mixin-3.hrx/input.scss",
  "non_conformant/parser/interpolate/04_space_list_quoted/01_inline.hrx/input.scss",
  "non_conformant/parser/interpolate/05_comma_list_quoted/01_inline.hrx/input.scss",
  "non_conformant/parser/malformed_expressions/at-debug/incomplete-expression.hrx/input.scss",
  "non_conformant/parser/malformed_expressions/at-error/incomplete-expression.hrx/input.scss",
  "non_conformant/parser/malformed_expressions/at-warn/incomplete-expression.hrx/input.scss",
  "non_conformant/parser/operations/binary-and-unary.hrx/input.scss",
  "non_conformant/scss-tests/044_test_trailing_comma_in_selector.hrx/input.scss",
  "operators/slash.hrx/without_intermediate/whitespace/input.scss",
  "values/identifiers/escape/normalize.hrx/input.scss",
  "variables/whitespace.hrx/between_double_default/scss/input.scss",
]);
/* spell-checker: enable */

const testCases = sassTestSuite.flatMap(({ name: suiteName, files }) =>
  files
    .map(({ name: fileName, data }) => {
      if (!fileName.endsWith(".scss")) {
        return;
      }

      const name = `${suiteName}/${fileName}`;

      if (SKIP.has(name) || BUGS.has(name)) {
        return;
      }

      return { name, filename: name, code: data };
    })
    .filter(Boolean),
);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: testCases,
  },
  ["scss"],
);
