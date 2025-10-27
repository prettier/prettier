import { fileURLToPath } from "node:url";
import { outdent } from "outdent";
import { OPTIONAL_OBJECT } from "../../shims/shared.js";
import { createIdentifier, isIdentifier } from "./utilities.js";

/* Doesn't work for optional call, computed property, and spread arguments */

/**
 * @param {import("@babel/types").Node} node
 * @returns {boolean}
 */
function isMethodCall(node, { methodName, argumentsLength }) {
  return (
    (node.type === "CallExpression" ||
      node.type === "OptionalCallExpression") &&
    !node.optional &&
    node.arguments.length === argumentsLength &&
    node.arguments.every(({ type }) => type !== "SpreadElement") &&
    (node.callee.type === "MemberExpression" ||
      node.callee.type === "OptionalMemberExpression") &&
    !node.callee.computed &&
    node.callee.object.type !== "ThisExpression" &&
    isIdentifier(node.callee.property, methodName)
  );
}

/**
 * `foo.at(index)` -> `__at(false, foo, index)`
 * `foo?.at(index)` -> `__at(true, foo, index)`
 *
 * @param {import("@babel/types").CallExpression | import("@babel/types").OptionalCallExpression} node
 * @returns {import("@babel/types").CallExpression}
 */
function transformMethodCallToFunctionCall(node, functionName) {
  // `__at(isOptionalObject, object, ...arguments)`

  let flags = 0;
  const comments = [];
  if (node.callee.type === "OptionalMemberExpression") {
    flags |= OPTIONAL_OBJECT;
    comments.push("OPTIONAL_OBJECT: true");
  } else {
    comments.push("OPTIONAL_OBJECT: false");
  }

  return {
    ...node,
    callee: createIdentifier(functionName),
    arguments: [
      {
        type: "NumericLiteral",
        value: flags,
        leadingComments: [
          {
            type: "CommentBlock",
            value: ` ${new Intl.ListFormat("en-US", { type: "conjunction" }).format(comments)} `,
          },
        ],
      },
      node.callee.object,
      ...node.arguments,
    ],
  };
}

function createMethodCallTransform({ methodName, argumentsLength }) {
  const functionName = `__${methodName}`;
  const fileName = `method-${methodName.replaceAll(
    /[A-Z]/gu,
    (character) => `-${character.toLowerCase()}`,
  )}.js`;
  const functionImplementationUrl = new URL(
    `../../shims/${fileName}`,
    import.meta.url,
  );
  const functionImplementationPath = fileURLToPath(functionImplementationUrl);

  return {
    shouldSkip: (text, file) =>
      !text.includes(`.${methodName}(`) || file === functionImplementationPath,
    test: (node) => isMethodCall(node, { methodName, argumentsLength }),
    transform: (node) => transformMethodCallToFunctionCall(node, functionName),
    inject: outdent`
      import ${functionName} from ${JSON.stringify(functionImplementationPath)};
    `,
  };
}

export default createMethodCallTransform;
