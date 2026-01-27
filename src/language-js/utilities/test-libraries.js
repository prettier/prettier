import {
  getCallArguments,
  getFunctionParameters,
  isNumericLiteral,
  isStringLiteral,
} from "./index.js";
import isNodeMatches from "./is-node-matches.js";
import { isCallExpression, isFunctionOrArrowExpression } from "./node-types.js";

/**
@import {
  Node,
  NodeMap,
  Comment,
  NumericLiteral,
  StringLiteral,
  RegExpLiteral,
  BigIntLiteral,
} from "../types/estree.js";
@import AstPath from "../../common/ast-path.js";
*/

const testCallCalleePatterns = [
  "it",
  "it.only",
  "it.skip",
  "describe",
  "describe.only",
  "describe.skip",
  "test",
  "test.only",
  "test.skip",
  "test.fixme",
  "test.step",
  "test.describe",
  "test.describe.only",
  "test.describe.skip",
  "test.describe.fixme",
  "test.describe.parallel",
  "test.describe.parallel.only",
  "test.describe.serial",
  "test.describe.serial.only",
  "skip",
  "xit",
  "xdescribe",
  "xtest",
  "fit",
  "fdescribe",
  "ftest",
];

function isTestCallCallee(node) {
  return isNodeMatches(node, testCallCalleePatterns);
}

/**
 * @param {*} node
 * @returns {boolean}
 */
function isUnitTestSetupIdentifier(node) {
  return (
    node.type === "Identifier" &&
    (node.name === "beforeEach" ||
      node.name === "beforeAll" ||
      node.name === "afterEach" ||
      node.name === "afterAll")
  );
}

/**
 * Note: `inject` is used in AngularJS 1.x, `async` and `fakeAsync` in
 * Angular 2+, although `async` is deprecated and replaced by `waitForAsync`
 * since Angular 12.
 *
 * example: https://docs.angularjs.org/guide/unit-testing#using-beforeall-
 *
 * @param {NodeMap["CallExpression"]} node
 * @returns {boolean}
 */
function isAngularTestWrapper(node) {
  return (
    isCallExpression(node) &&
    node.callee.type === "Identifier" &&
    ["async", "inject", "fakeAsync", "waitForAsync"].includes(node.callee.name)
  );
}

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isFunctionOrArrowExpressionWithBody(node) {
  return (
    node.type === "FunctionExpression" ||
    (node.type === "ArrowFunctionExpression" &&
      node.body.type === "BlockStatement")
  );
}

// eg; `describe("some string", (done) => {})`
function isTestCall(node, parent) {
  if (node?.type !== "CallExpression" || node.optional) {
    return false;
  }

  const args = getCallArguments(node);

  if (args.length === 1) {
    if (isAngularTestWrapper(node) && isTestCall(parent)) {
      return isFunctionOrArrowExpression(args[0]);
    }

    if (isUnitTestSetupIdentifier(node.callee)) {
      return isAngularTestWrapper(args[0]);
    }
  } else if (
    (args.length === 2 || args.length === 3) &&
    (args[0].type === "TemplateLiteral" || isStringLiteral(args[0])) &&
    isTestCallCallee(node.callee)
  ) {
    // it("name", () => { ... }, 2500)
    if (args[2] && !isNumericLiteral(args[2])) {
      return false;
    }
    return (
      (args.length === 2
        ? isFunctionOrArrowExpression(args[1])
        : isFunctionOrArrowExpressionWithBody(args[1]) &&
          getFunctionParameters(args[1]).length <= 1) ||
      isAngularTestWrapper(args[1])
    );
  }
  return false;
}

export { isTestCall };
