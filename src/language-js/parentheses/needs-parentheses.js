import { hasComment } from "../utilities/comments.js";
import { createTypeCheckFunction } from "../utilities/create-type-check-function.js";
import { getFunctionParameters } from "../utilities/function-parameters.js";
import { getPrecedence } from "../utilities/get-precedence.js";
import { isBitwiseOperator } from "../utilities/is-bitwise-operator.js";
import { isNullishCoalescing } from "../utilities/is-nullish-coalescing.js";
import { isObjectProperty } from "../utilities/is-object-property.js";
import {
  isArrayExpression,
  isBinaryCastExpression,
  isCallExpression,
  isCallOrNewExpression,
  isConditionalType,
  isIntersectionType,
  isMemberExpression,
  isNumericLiteral,
  isObjectExpression,
  isReturnOrThrowStatement,
  isUnionType,
} from "../utilities/node-types.js";
import { shouldFlatten } from "../utilities/should-flatten.js";
import { startsWithNoLookaheadToken } from "../utilities/starts-with-no-lookahead-token.js";
import { shouldAddParenthesesToChainElement } from "./chain-expression.js";
import { shouldAddParenthesesToIdentifier } from "./identifier.js";
import { parentNeedsParentheses } from "./parent-needs-parentheses.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 */

/**
 * @param {AstPath} path
 * @returns {boolean}
 */
function needsParentheses(path, options) {
  if (path.isRoot) {
    return false;
  }

  const { node, key, parent } = path;

  // to avoid unexpected `}}` in HTML interpolations
  if (
    options.__isInHtmlInterpolation &&
    !options.bracketSpacing &&
    endsWithRightBracket(node) &&
    isFollowedByRightBracket(path)
  ) {
    return true;
  }

  // Only statements don't need parentheses.
  if (isStatement(node)) {
    return false;
  }

  if (node.type === "Identifier") {
    return shouldAddParenthesesToIdentifier(path);
  }

  if (
    node.type === "ObjectExpression" ||
    node.type === "FunctionExpression" ||
    node.type === "ClassExpression" ||
    node.type === "DoExpression"
  ) {
    const expression = path.findAncestor(
      (node) => node.type === "ExpressionStatement",
    )?.expression;
    if (
      expression &&
      startsWithNoLookaheadToken(
        expression,
        (leftmostNode) => leftmostNode === node,
      )
    ) {
      return true;
    }
  }

  if (node.type === "ObjectExpression") {
    const arrowFunctionBody = path.findAncestor(
      (node) => node.type === "ArrowFunctionExpression",
    )?.body;
    if (
      arrowFunctionBody &&
      arrowFunctionBody.type !== "SequenceExpression" && // these have parens added anyway
      arrowFunctionBody.type !== "AssignmentExpression" &&
      startsWithNoLookaheadToken(
        arrowFunctionBody,
        (leftmostNode) => leftmostNode === node,
      )
    ) {
      return true;
    }
  }

  const parentCheckResult = parentNeedsParentheses(
    path,
    options,
    needsParentheses,
  );
  if (typeof parentCheckResult === "boolean") {
    return parentCheckResult;
  }

  switch (node.type) {
    case "UpdateExpression":
      if (parent.type === "UnaryExpression") {
        return (
          node.prefix &&
          ((node.operator === "++" && parent.operator === "+") ||
            (node.operator === "--" && parent.operator === "-"))
        );
      }
    // else fallthrough
    case "UnaryExpression":
      switch (parent.type) {
        case "UnaryExpression":
          return (
            node.operator === parent.operator &&
            (node.operator === "+" || node.operator === "-")
          );

        case "BindExpression":
          return true;

        case "MemberExpression":
        case "OptionalMemberExpression":
          return key === "object";

        case "TaggedTemplateExpression":
          return true;

        case "NewExpression":
        case "CallExpression":
        case "OptionalCallExpression":
          return key === "callee";

        case "BinaryExpression":
          // A user typing `!foo instanceof Bar` probably intended
          // `!(foo instanceof Bar)`, so format to `(!foo) instance Bar` to what is
          // really happening
          if (
            key === "left" &&
            node.type === "UnaryExpression" &&
            (parent.operator === "in" || parent.operator === "instanceof")
          ) {
            return true;
          }

          return key === "left" && parent.operator === "**";

        case "TSNonNullExpression":
          return true;

        default:
          return false;
      }

    case "BinaryExpression":
      if (parent.type === "UpdateExpression") {
        return true;
      }

      // We add parentheses to any `a in b` inside `ForStatement` initializer
      // https://github.com/prettier/prettier/issues/907#issuecomment-284304321
      if (node.operator === "in" && isPathInForStatementInitializer(path)) {
        return true;
      }
      if (node.operator === "|>" && node.extra?.parenthesized) {
        const grandParent = path.grandparent;
        if (
          grandParent.type === "BinaryExpression" &&
          grandParent.operator === "|>"
        ) {
          return true;
        }
      }

    // fallthrough
    case "TSTypeAssertion":
    case "TSAsExpression":
    case "TSSatisfiesExpression":
    case "AsExpression":
    case "AsConstExpression":
    case "SatisfiesExpression":
    case "LogicalExpression":
      switch (parent.type) {
        case "TSAsExpression":
        case "TSSatisfiesExpression":
        case "AsExpression":
        case "AsConstExpression":
        case "SatisfiesExpression":
          // examples:
          //   foo as unknown as Bar
          //   foo satisfies unknown satisfies Bar
          //   foo satisfies unknown as Bar
          //   foo as unknown satisfies Bar
          return !isBinaryCastExpression(node);

        case "ConditionalExpression":
          return isBinaryCastExpression(node) || isNullishCoalescing(node);

        case "CallExpression":
        case "NewExpression":
        case "OptionalCallExpression":
          return key === "callee";

        case "ClassExpression":
        case "ClassDeclaration":
          return key === "superClass";

        case "TSTypeAssertion":
        case "TaggedTemplateExpression":
        case "JSXSpreadAttribute":
        case "SpreadElement":
        case "BindExpression":
        case "AwaitExpression":
        case "TSNonNullExpression":
        case "UpdateExpression":
          return true;
        case "UnaryExpression":
          // `UnaryExpression` adds parentheses and indention when argument has comment
          if (!hasComment(node)) {
            return true;
          }
          break;

        case "MemberExpression":
        case "OptionalMemberExpression":
          return key === "object";

        case "AssignmentExpression":
        case "AssignmentPattern":
          return (
            key === "left" &&
            (node.type === "TSTypeAssertion" || isBinaryCastExpression(node))
          );

        case "LogicalExpression":
          if (node.type === "LogicalExpression") {
            return parent.operator !== node.operator;
          }
        // else fallthrough

        case "BinaryExpression": {
          const { operator, type } = node;
          if (!operator && type !== "TSTypeAssertion") {
            return true;
          }

          const precedence = getPrecedence(operator);
          const parentOperator = parent.operator;
          const parentPrecedence = getPrecedence(parentOperator);

          if (parentPrecedence > precedence) {
            return true;
          }

          if (key === "right" && parentPrecedence === precedence) {
            return true;
          }

          if (
            parentPrecedence === precedence &&
            !shouldFlatten(parentOperator, operator)
          ) {
            return true;
          }

          if (
            parentPrecedence < precedence &&
            operator === "%" &&
            (parentOperator === "+" || parentOperator === "-")
          ) {
            return true;
          }

          // Add parenthesis when working with bitwise operators
          // It's not strictly needed but helps with code understanding
          if (isBitwiseOperator(parentOperator)) {
            return true;
          }

          return false;
        }

        default:
          return false;
      }
      break;

    case "SequenceExpression":
      // Although parentheses wouldn't hurt around sequence
      // expressions in the head of for loops, traditional style
      // dictates that e.g. i++, j++ should not be wrapped with
      // parentheses.
      if (parent.type === "ForStatement") {
        return false;
      }

      // Otherwise err on the side of overparenthesization, adding
      // explicit exceptions above if this proves overzealous.
      return true;

    case "YieldExpression":
      if (
        parent.type === "AwaitExpression" ||
        parent.type === "TSTypeAssertion"
      ) {
        return true;
      }
    // else fallthrough
    case "AwaitExpression":
      switch (parent.type) {
        case "TaggedTemplateExpression":
        case "UnaryExpression":
        case "LogicalExpression":
        case "SpreadElement":
        case "TSAsExpression":
        case "TSSatisfiesExpression":
        case "TSNonNullExpression":
        case "AsExpression":
        case "AsConstExpression":
        case "SatisfiesExpression":
        case "BindExpression":
          return true;

        case "MemberExpression":
        case "OptionalMemberExpression":
          return key === "object";

        case "NewExpression":
        case "CallExpression":
        case "OptionalCallExpression":
          return key === "callee";

        case "ConditionalExpression":
          return key === "test";

        case "BinaryExpression":
          if (!node.argument && parent.operator === "|>") {
            return false;
          }

          return true;

        default:
          return false;
      }

    case "TSFunctionType":
      if (
        path.match(
          (node) => node.type === "TSFunctionType",
          (node, key) =>
            key === "typeAnnotation" && node.type === "TSTypeAnnotation",
          (node, key) =>
            key === "returnType" && node.type === "ArrowFunctionExpression",
        )
      ) {
        return true;
      }
    // fallthrough
    case "TSConditionalType":
    case "TSConstructorType":
    case "ConditionalTypeAnnotation":
      if (
        key === "extendsType" &&
        isConditionalType(node) &&
        parent.type === node.type
      ) {
        return true;
      }

      if (key === "checkType" && isConditionalType(parent)) {
        return true;
      }

      if (key === "extendsType" && parent.type === "TSConditionalType") {
        let { typeAnnotation } = node.returnType || node.typeAnnotation;

        if (
          typeAnnotation.type === "TSTypePredicate" &&
          typeAnnotation.typeAnnotation
        ) {
          typeAnnotation = typeAnnotation.typeAnnotation.typeAnnotation;
        }

        if (
          typeAnnotation.type === "TSInferType" &&
          typeAnnotation.typeParameter.constraint
        ) {
          return true;
        }
      }

    // fallthrough
    case "TSUnionType":
    case "TSIntersectionType":
      if (isUnionType(parent) || isIntersectionType(parent)) {
        return true;
      }
    // fallthrough
    case "TSInferType":
      if (node.type === "TSInferType") {
        if (parent.type === "TSRestType") {
          return false;
        }

        if (
          key === "types" &&
          (parent.type === "TSUnionType" ||
            parent.type === "TSIntersectionType") &&
          node.typeParameter.type === "TSTypeParameter" &&
          node.typeParameter.constraint
        ) {
          return true;
        }
      }
    // fallthrough
    case "TSTypeOperator":
      return (
        parent.type === "TSArrayType" ||
        parent.type === "TSOptionalType" ||
        parent.type === "TSRestType" ||
        (key === "objectType" && parent.type === "TSIndexedAccessType") ||
        parent.type === "TSTypeOperator" ||
        (parent.type === "TSTypeAnnotation" &&
          path.grandparent.type.startsWith("TSJSDoc"))
      );
    case "TSTypeQuery":
      return (
        (key === "objectType" && parent.type === "TSIndexedAccessType") ||
        (key === "elementType" && parent.type === "TSArrayType")
      );
    // Same as `TSTypeOperator`, but for Flow syntax
    case "TypeOperator":
      return (
        parent.type === "ArrayTypeAnnotation" ||
        parent.type === "NullableTypeAnnotation" ||
        (key === "objectType" &&
          (parent.type === "IndexedAccessType" ||
            parent.type === "OptionalIndexedAccessType")) ||
        parent.type === "TypeOperator"
      );
    // Same as `TSTypeQuery`, but for Flow syntax
    case "TypeofTypeAnnotation":
      return (
        (key === "objectType" &&
          (parent.type === "IndexedAccessType" ||
            parent.type === "OptionalIndexedAccessType")) ||
        (key === "elementType" && parent.type === "ArrayTypeAnnotation")
      );
    case "ArrayTypeAnnotation":
      return parent.type === "NullableTypeAnnotation";

    case "IntersectionTypeAnnotation":
    case "UnionTypeAnnotation":
      return (
        parent.type === "TypeOperator" ||
        parent.type === "KeyofTypeAnnotation" ||
        parent.type === "ArrayTypeAnnotation" ||
        parent.type === "NullableTypeAnnotation" ||
        parent.type === "IntersectionTypeAnnotation" ||
        parent.type === "UnionTypeAnnotation" ||
        (key === "objectType" &&
          (parent.type === "IndexedAccessType" ||
            parent.type === "OptionalIndexedAccessType"))
      );
    case "InferTypeAnnotation":
    case "NullableTypeAnnotation":
      if (
        parent.type === "ArrayTypeAnnotation" ||
        (key === "objectType" &&
          (parent.type === "IndexedAccessType" ||
            parent.type === "OptionalIndexedAccessType"))
      ) {
        return true;
      }

      // If the return type is a nullable arrow function, then we need a paren
      // otherwise the inner => can be assumed to be for the outer one.
      if (
        node.type === "NullableTypeAnnotation" &&
        path.match(
          undefined,
          (node, key) =>
            key === "typeAnnotation" && node.type === "TypeAnnotation",
          (node, key) =>
            key === "returnType" && node.type === "ArrowFunctionExpression",
        )
      ) {
        return true;
      }

      break;

    case "ComponentTypeAnnotation":
    case "FunctionTypeAnnotation": {
      if (
        node.type === "ComponentTypeAnnotation" &&
        (node.rendersType === null || node.rendersType === undefined)
      ) {
        return false;
      }

      if (
        path.match(
          undefined,
          (node, key) =>
            key === "typeAnnotation" && node.type === "TypeAnnotation",
          (node, key) =>
            key === "returnType" && node.type === "ArrowFunctionExpression",
        )
      ) {
        return true;
      }

      /*
      Matches the following case in Flow:

      ```
      const a = (x: any): x is (number => string) => true;
      ```

      This case is not necessary in TS since `number => string` is not a valid
      arrow type there.
      */
      if (
        path.match(
          undefined,
          (node, key) =>
            key === "typeAnnotation" && node.type === "TypePredicate",
          (node, key) =>
            key === "typeAnnotation" && node.type === "TypeAnnotation",
          (node, key) =>
            key === "returnType" && node.type === "ArrowFunctionExpression",
        )
      ) {
        return true;
      }

      const ancestor =
        parent.type === "NullableTypeAnnotation" ? path.grandparent : parent;

      return (
        ancestor.type === "UnionTypeAnnotation" ||
        ancestor.type === "IntersectionTypeAnnotation" ||
        ancestor.type === "ArrayTypeAnnotation" ||
        (key === "objectType" &&
          (ancestor.type === "IndexedAccessType" ||
            ancestor.type === "OptionalIndexedAccessType")) ||
        (key === "checkType" && parent.type === "ConditionalTypeAnnotation") ||
        (key === "extendsType" &&
          parent.type === "ConditionalTypeAnnotation" &&
          node.returnType?.type === "InferTypeAnnotation" &&
          node.returnType?.typeParameter.bound) ||
        // We should check ancestor's parent to know whether the parentheses
        // are really needed, but since ??T doesn't make sense this check
        // will almost never be true.
        ancestor.type === "NullableTypeAnnotation" ||
        // See #5283
        (parent.type === "FunctionTypeParam" &&
          parent.name === null &&
          getFunctionParameters(node).some(
            (param) => param.typeAnnotation?.type === "NullableTypeAnnotation",
          ))
      );
    }

    // fallthrough
    case "OptionalIndexedAccessType":
      return key === "objectType" && parent.type === "IndexedAccessType";

    case "StringLiteral":
    case "NumericLiteral":
    case "Literal":
      if (
        typeof node.value === "string" &&
        parent.type === "ExpressionStatement" &&
        typeof parent.directive !== "string"
      ) {
        // To avoid becoming a directive
        const grandParent = path.grandparent;

        return (
          grandParent.type === "Program" ||
          grandParent.type === "BlockStatement"
        );
      }

      return (
        key === "object" && isMemberExpression(parent) && isNumericLiteral(node)
      );

    case "AssignmentExpression":
      if (
        (key === "init" || key === "update") &&
        parent.type === "ForStatement"
      ) {
        return false;
      }

      if (
        key === "expression" &&
        node.left.type !== "ObjectPattern" &&
        parent.type === "ExpressionStatement"
      ) {
        return false;
      }

      if (key === "key" && parent.type === "TSPropertySignature") {
        return false;
      }

      if (parent.type === "AssignmentExpression") {
        return false;
      }

      if (
        key === "expressions" &&
        parent.type === "SequenceExpression" &&
        path.match(
          undefined,
          undefined,
          (node, name) =>
            (name === "init" || name === "update") &&
            node.type === "ForStatement",
        )
      ) {
        return false;
      }

      if (
        key === "value" &&
        parent.type === "Property" &&
        path.match(
          undefined,
          undefined,
          (node, name) =>
            name === "properties" && node.type === "ObjectPattern",
        )
      ) {
        return false;
      }

      if (parent.type === "NGChainedExpression") {
        return false;
      }

      if (key === "node" && parent.type === "JsExpressionRoot") {
        return false;
      }

      return true;

    case "ConditionalExpression":
      switch (parent.type) {
        case "TaggedTemplateExpression":
        case "UnaryExpression":
        case "SpreadElement":
        case "BinaryExpression":
        case "LogicalExpression":
        case "NGPipeExpression":
        case "ExportDefaultDeclaration":
        case "AwaitExpression":
        case "JSXSpreadAttribute":
        case "TSTypeAssertion":
        case "TypeCastExpression":
        case "TSAsExpression":
        case "TSSatisfiesExpression":
        case "AsExpression":
        case "AsConstExpression":
        case "SatisfiesExpression":
        case "TSNonNullExpression":
          return true;

        case "NewExpression":
        case "CallExpression":
        case "OptionalCallExpression":
          return key === "callee";

        case "ConditionalExpression":
          // TODO remove this case entirely once we've removed this flag.
          if (!options.experimentalTernaries) {
            return key === "test";
          }
          return false;

        case "MemberExpression":
        case "OptionalMemberExpression":
          return key === "object";

        default:
          return false;
      }

    case "FunctionExpression":
      switch (parent.type) {
        case "NewExpression":
        case "CallExpression":
        case "OptionalCallExpression":
          // Not always necessary, but it's clearer to the reader if IIFEs are wrapped in parentheses.
          // Is necessary if it is `expression` of `ExpressionStatement`.
          return key === "callee";
        case "TaggedTemplateExpression":
          return true; // This is basically a kind of IIFE.
        case "ExportDefaultDeclaration":
          return key === "declaration";
        default:
          return false;
      }

    case "ArrowFunctionExpression":
      switch (parent.type) {
        case "BinaryExpression":
          return parent.operator !== "|>" || node.extra?.parenthesized;
        case "NewExpression":
        case "CallExpression":
        case "OptionalCallExpression":
          return key === "callee";

        case "MemberExpression":
        case "OptionalMemberExpression":
          return key === "object";

        case "TSAsExpression":
        case "TSSatisfiesExpression":
        case "AsExpression":
        case "AsConstExpression":
        case "SatisfiesExpression":
        case "TSNonNullExpression":
        case "BindExpression":
        case "TaggedTemplateExpression":
        case "UnaryExpression":
        case "LogicalExpression":
        case "AwaitExpression":
        case "TSTypeAssertion":
        case "MatchExpressionCase":
          return true;

        case "TSInstantiationExpression":
          return key === "expression";

        case "ConditionalExpression":
          return key === "test";

        default:
          return false;
      }

    case "ClassExpression":
      switch (parent.type) {
        case "NewExpression":
          return key === "callee";
        case "ExportDefaultDeclaration":
          return key === "declaration";
        default:
          return false;
      }
    case "OptionalMemberExpression":
    case "OptionalCallExpression":
    case "ChainExpression":
    case "TSNonNullExpression":
      if (shouldAddParenthesesToChainElement(path)) {
        return true;
      }

    // fallthrough
    case "CallExpression":
    case "MemberExpression":
    case "TaggedTemplateExpression":
      if (
        key === "callee" &&
        (parent.type === "BindExpression" || parent.type === "NewExpression")
      ) {
        let object = node;
        while (object) {
          switch (object.type) {
            case "CallExpression":
              return true;
            case "MemberExpression":
            case "OptionalMemberExpression":
            case "BindExpression":
              object = object.object;
              break;
            // tagged templates are basically member expressions from a grammar perspective
            // see https://tc39.github.io/ecma262/#prod-MemberExpression
            case "TaggedTemplateExpression":
              object = object.tag;
              break;
            case "TSNonNullExpression":
              object = object.expression;
              break;
            default:
              return false;
          }
        }
      }

      return false;

    case "BindExpression":
      return (
        (key === "callee" &&
          (parent.type === "BindExpression" ||
            parent.type === "NewExpression")) ||
        (key === "object" && isMemberExpression(parent))
      );
    case "NGPipeExpression":
      if (
        parent.type === "NGRoot" ||
        parent.type === "NGMicrosyntaxExpression" ||
        (parent.type === "ObjectProperty" &&
          // Preserve parens for compatibility with AngularJS expressions
          !node.extra?.parenthesized) ||
        isArrayExpression(parent) ||
        (key === "arguments" && isCallExpression(parent)) ||
        (key === "right" && parent.type === "NGPipeExpression") ||
        (key === "property" && parent.type === "MemberExpression") ||
        parent.type === "AssignmentExpression"
      ) {
        return false;
      }
      return true;
    case "JSXFragment":
    case "JSXElement":
      return (
        key === "callee" ||
        (key === "left" &&
          parent.type === "BinaryExpression" &&
          parent.operator === "<") ||
        (!isArrayExpression(parent) &&
          parent.type !== "ArrowFunctionExpression" &&
          parent.type !== "AssignmentExpression" &&
          parent.type !== "AssignmentPattern" &&
          parent.type !== "BinaryExpression" &&
          parent.type !== "ConditionalExpression" &&
          parent.type !== "ExpressionStatement" &&
          parent.type !== "JsExpressionRoot" &&
          parent.type !== "JSXAttribute" &&
          parent.type !== "JSXElement" &&
          parent.type !== "JSXExpressionContainer" &&
          parent.type !== "JSXFragment" &&
          parent.type !== "LogicalExpression" &&
          !isCallOrNewExpression(parent) &&
          !isObjectProperty(parent) &&
          !isReturnOrThrowStatement(parent) &&
          parent.type !== "TypeCastExpression" &&
          parent.type !== "VariableDeclarator" &&
          parent.type !== "YieldExpression" &&
          parent.type !== "MatchExpressionCase")
      );

    case "TSInstantiationExpression":
      return key === "object" && isMemberExpression(parent);

    case "MatchOrPattern":
      return parent.type === "MatchAsPattern";
  }

  return false;
}

const isStatement = createTypeCheckFunction([
  "BlockStatement",
  "BreakStatement",
  "ComponentDeclaration",
  "ClassBody",
  "ClassDeclaration",
  "ClassMethod",
  "ClassProperty",
  "PropertyDefinition",
  "ClassPrivateProperty",
  "ContinueStatement",
  "DebuggerStatement",
  "DeclareComponent",
  "DeclareClass",
  "DeclareExportAllDeclaration",
  "DeclareExportDeclaration",
  "DeclareFunction",
  "DeclareHook",
  "DeclareInterface",
  "DeclareModule",
  "DeclareModuleExports",
  "DeclareNamespace",
  "DeclareVariable",
  "DeclareEnum",
  "DoWhileStatement",
  "EnumDeclaration",
  "ExportAllDeclaration",
  "ExportDefaultDeclaration",
  "ExportNamedDeclaration",
  "ExpressionStatement",
  "ForInStatement",
  "ForOfStatement",
  "ForStatement",
  "FunctionDeclaration",
  "HookDeclaration",
  "IfStatement",
  "ImportDeclaration",
  "InterfaceDeclaration",
  "LabeledStatement",
  "MethodDefinition",
  "ReturnStatement",
  "SwitchStatement",
  "ThrowStatement",
  "TryStatement",
  "TSDeclareFunction",
  "TSEnumDeclaration",
  "TSImportEqualsDeclaration",
  "TSInterfaceDeclaration",
  "TSModuleDeclaration",
  "TSNamespaceExportDeclaration",
  "TypeAlias",
  "VariableDeclaration",
  "WhileStatement",
  "WithStatement",
]);

/**
 * @param {AstPath} path
 * @returns {boolean}
 */
function isPathInForStatementInitializer(path) {
  let i = 0;
  let { node } = path;
  while (node) {
    const parent = path.getParentNode(i++);
    if (parent?.type === "ForStatement" && parent.init === node) {
      return true;
    }
    node = parent;
  }

  return false;
}

function endsWithRightBracket(node) {
  return isObjectExpression(node);
}

/**
 * @param {AstPath} path
 * @returns {boolean}
 */
function isFollowedByRightBracket(path) {
  const { parent, key } = path;
  switch (parent.type) {
    case "NGPipeExpression":
      if (key === "arguments" && path.isLast) {
        return path.callParent(isFollowedByRightBracket);
      }
      break;
    case "ObjectProperty":
      if (key === "value") {
        return path.callParent(() => path.key === "properties" && path.isLast);
      }
      break;
    case "BinaryExpression":
    case "LogicalExpression":
      if (key === "right") {
        return path.callParent(isFollowedByRightBracket);
      }
      break;
    case "ConditionalExpression":
      if (key === "alternate") {
        return path.callParent(isFollowedByRightBracket);
      }
      break;
    case "UnaryExpression":
      if (parent.prefix && path.callParent(isFollowedByRightBracket)) {
        return true;
      }
      break;
  }
  return false;
}

export default needsParentheses;
