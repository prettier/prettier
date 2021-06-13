"use strict";

// This rule only work for nested `AstPath#call()` for now

function astPathCallSelector(path) {
  const prefix = path ? `${path}.` : "";
  return [
    `[${prefix}type="CallExpression"]`,
    `[${prefix}callee.type="MemberExpression"]`,
    `[${prefix}callee.property.type="Identifier"]`,
    `[${prefix}callee.property.name="call"]`,
    `[${prefix}arguments.length>1]`,
    `[${prefix}arguments.0.type!="SpreadElement"]`,
  ].join("");
}

// Matches:
// ```
//   path.call((childPath) => childPath.call(print, "b"), "a")
// ```
const selector = [
  astPathCallSelector(),
  '[arguments.0.type="ArrowFunctionExpression"]',
  "[arguments.0.params.length=1]",
  '[arguments.0.params.0.type="Identifier"]',
  astPathCallSelector("arguments.0.body"),
  '[arguments.0.body.callee.object.type="Identifier"]',
].join("");

const MESSAGE_ID = "flat-ast-path-call";

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      url: "https://github.com/prettier/prettier/blob/main/scripts/tools/eslint-plugin-prettier-internal-rules/flat-ast-path-call.js",
    },
    messages: {
      [MESSAGE_ID]: "Do not use nested `AstPath#{{method}}(…)`.",
    },
    fixable: "code",
  },
  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      [selector](outerCall) {
        // path.call((childPath) => childPath.call(print, "b"), "a")
        //           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        const outerCallback = outerCall.arguments[0];

        // path.call((childPath) => childPath.call(print, "b"), "a")
        //            ^^^^^^^^^
        const outerCallbackParameterName = outerCallback.params[0].name;

        // path.call((childPath) => childPath.call(print, "b"), "a")
        //                          ^^^^^^^^^^^^^^^^^^^^^^^^^^
        const innerCall = outerCallback.body;

        // path.call((childPath) => childPath.call(print, "b"), "a")
        //                          ^^^^^^^^^
        const innerCallCalleeObjectName = innerCall.callee.object.name;

        if (outerCallbackParameterName !== innerCallCalleeObjectName) {
          return;
        }

        context.report({
          node: innerCall,
          messageId: MESSAGE_ID,
          data: { method: "call" },
          *fix(fixer) {
            // path.call((childPath) => childPath.call(print, "b"), "a")
            //                                         ^^^^^
            const innerCallback = innerCall.arguments[0];

            yield fixer.replaceTextRange(
              [
                // path.call((childPath) => childPath.call(print, "b"), "a")
                //           ^
                outerCallback.range[0],
                // path.call((childPath) => childPath.call(print, "b"), "a")
                //                                        ^
                innerCallback.range[0],
              ],
              ""
            );

            // path.call((childPath) => childPath.call(print, "b"), "a")
            //                                              ^
            const innerNamesStart = innerCallback.range[1];

            // path.call((childPath) => childPath.call(print, "b"), "a")
            //                                                   ^
            const innerNamesEnd = innerCall.range[1] - 1;

            let innerNamesText = sourceCode.text.slice(
              innerNamesStart,
              innerNamesEnd
            );

            yield fixer.replaceTextRange(
              [innerNamesStart, innerNamesEnd + 1],
              ""
            );

            const [penultimateToken, lastToken] = sourceCode.getLastTokens(
              outerCall,
              2
            );

            // `outer` call has `trailing comma`
            if (
              penultimateToken &&
              penultimateToken.type === "Punctuator" &&
              penultimateToken.value === ","
            ) {
              innerNamesText = innerNamesText.slice(1);
            }

            yield fixer.insertTextBefore(lastToken, innerNamesText);
          },
        });
      },
    };
  },
};
