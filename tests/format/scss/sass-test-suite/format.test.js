import sassTestSuite from "sass-test-suite";

/* spell-checker: disable */
const SKIP = new Set([
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
]);
const BUGS = new Set([
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
  "non_conformant/errors/unicode/report/before.hrx/input.scss",
  "non_conformant/parser/arglists/can-end-with-comma/error-include-3.hrx/input.scss",
  "non_conformant/parser/interpolate/27_escaped_double_quotes/03_inline_double.hrx/input.scss",
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
