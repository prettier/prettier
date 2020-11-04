"use strict";
const esquery = require("esquery");
const {
  getFunctionParameters,
  getLeftSidePathName,
  hasFlowShorthandAnnotationComment,
  hasNakedLeftSide,
  hasNode,
  isBitwiseOperator,
  startsWithNoLookaheadToken,
  shouldFlatten,
  getPrecedence,
  isPathMatches,
  isNodeMatchesParsedSelector,
} = require("./utils");

const selectors = [
  // SpreadElement
  "MemberExpression > SpreadElement.object",
  "MemberExpression > SpreadProperty.object",
  // UpdateExpression
  'UnaryExpression[operator="+"] > UpdateExpression.argument[prefix=true][operator="++"]',
  'UnaryExpression[operator="-"] > UpdateExpression.argument[prefix=true][operator="--"]',
  // BinaryExpression
  "UpdateExpression > BinaryExpression",
  'PipelineTopicExpression > BinaryExpression[operator="|>"]',
  // YieldExpression
  "UnaryExpression > YieldExpression",
  "AwaitExpression > YieldExpression",
  "TSNonNullExpression > YieldExpression",
  //
  "TSConditionalType > :matches(TSJSDocFunctionType, TSConditionalType).extendsType",
  "TSConditionalType > :matches(TSJSDocFunctionType, TSConditionalType, TSFunctionType, TSConstructorType).checkType",
  ":matches(TSUnionType, TSIntersectionType) > :matches(TSJSDocFunctionType, TSConditionalType, TSFunctionType, TSConstructorType, TSUnionType, TSIntersectionType)",
  "NullableTypeAnnotation > ArrayTypeAnnotation",
  ":matches(ArrayTypeAnnotation, NullableTypeAnnotation, IntersectionTypeAnnotation, UnionTypeAnnotation) > :matches(IntersectionTypeAnnotation, UnionTypeAnnotation)",
  "ArrayTypeAnnotation > NullableTypeAnnotation",
  // ConditionalExpression
  ":matches(TaggedTemplateExpression, UnaryExpression, SpreadElement, SpreadProperty, BinaryExpression, LogicalExpression, NGPipeExpression, ExportDefaultDeclaration, AwaitExpression, JSXSpreadAttribute, TSTypeAssertion, TypeCastExpression, TSAsExpression, TSNonNullExpression) > ConditionalExpression",
  ":matches(NewExpression, CallExpression, OptionalCallExpression) > ConditionalExpression.callee",
  "ConditionalExpression > ConditionalExpression.test",
  ":matches(MemberExpression, OptionalMemberExpression) > ConditionalExpression.object",
  // FunctionExpression
  // Not always necessary, but it's clearer to the reader if IIFEs are wrapped in parentheses.
  // Is necessary if it is `expression` of `ExpressionStatement`.
  ":matches(NewExpression, CallExpression, OptionalCallExpression) > FunctionExpression.callee",
  // This is basically a kind of IIFE.
  "TaggedTemplateExpression > FunctionExpression",
  // Add parens around the extends clause of a class. It is needed for almost
  // all expressions.
  ':matches(ClassDeclaration, ClassExpression) > :matches(ArrowFunctionExpression, AssignmentExpression, AwaitExpression, BinaryExpression, ConditionalExpression, LogicalExpression, NewExpression, ObjectExpression, ParenthesizedExpression, SequenceExpression, TaggedTemplateExpression, UnaryExpression, UpdateExpression, YieldExpression").superClass',
  // "UpdateExpression" / "UnaryExpression":
  'UnaryExpression[operator="+"] > :matches(UpdateExpression, UnaryExpression)[operator="+"]',
  'UnaryExpression[operator="-"] > :matches(UpdateExpression, UnaryExpression)[operator="-"]',
  "BindExpression > :matches(UpdateExpression, UnaryExpression)",
  ":matches(MemberExpression, OptionalMemberExpression) > :matches(UpdateExpression, UnaryExpression).object",
  "TaggedTemplateExpression > :matches(UpdateExpression, UnaryExpression)",
  ":matches(NewExpression, CallExpression, OptionalCallExpression) > :matches(UpdateExpression, UnaryExpression).callee",
  'BinaryExpression[operator="**"] > :matches(UpdateExpression, UnaryExpression).left',
  "TSNonNullExpression > :matches(UpdateExpression, UnaryExpression)",
  "ConditionalExpression > TSAsExpression",
  ":matches(CallExpression, NewExpression, OptionalCallExpression) > :matches(BinaryExpression, TSTypeAssertion, TSAsExpression, LogicalExpression).callee",
  ":matches(ClassExpression, ClassDeclaration) > :matches(BinaryExpression, TSTypeAssertion, TSAsExpression, LogicalExpression).superClass",
  "TSTypeAssertion > :matches(BinaryExpression, TSTypeAssertion, TSAsExpression, LogicalExpression)",
  "TaggedTemplateExpression > :matches(BinaryExpression, TSTypeAssertion, TSAsExpression, LogicalExpression)",
  "UnaryExpression > :matches(BinaryExpression, TSTypeAssertion, TSAsExpression, LogicalExpression)",
  "JSXSpreadAttribute > :matches(BinaryExpression, TSTypeAssertion, TSAsExpression, LogicalExpression)",
  "SpreadElement > :matches(BinaryExpression, TSTypeAssertion, TSAsExpression, LogicalExpression)",
  "SpreadProperty > :matches(BinaryExpression, TSTypeAssertion, TSAsExpression, LogicalExpression)",
  "BindExpression > :matches(BinaryExpression, TSTypeAssertion, TSAsExpression, LogicalExpression)",
  "AwaitExpression > :matches(BinaryExpression, TSTypeAssertion, TSAsExpression, LogicalExpression)",
  "TSAsExpression > :matches(BinaryExpression, TSTypeAssertion, TSAsExpression, LogicalExpression)",
  "TSNonNullExpression > :matches(BinaryExpression, TSTypeAssertion, TSAsExpression, LogicalExpression)",
  "UpdateExpression > :matches(BinaryExpression, TSTypeAssertion, TSAsExpression, LogicalExpression)",
  "MemberExpression > :matches(BinaryExpression, TSTypeAssertion, TSAsExpression, LogicalExpression).object",
  "OptionalMemberExpression > :matches(BinaryExpression, TSTypeAssertion, TSAsExpression, LogicalExpression).object",
  "AssignmentExpression > :matches(TSTypeAssertion, TSAsExpression).left",
];
const needsParenthesisesSelector = esquery.parse(
  `:matches(${selectors.join(", ")})`
);

function needsParens(path, options) {
  const parent = path.getParentNode();
  if (!parent) {
    return false;
  }

  const name = path.getName();
  const node = path.getNode();

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

  if (
    // Preserve parens if we have a Flow annotation comment, unless we're using the Flow
    // parser. The Flow parser turns Flow comments into type annotation nodes in its
    // AST, which we handle separately.
    options.parser !== "flow" &&
    hasFlowShorthandAnnotationComment(path.getValue())
  ) {
    return true;
  }

  // Identifiers never need parentheses.
  if (node.type === "Identifier") {
    // ...unless those identifiers are embed placeholders. They might be substituted by complex
    // expressions, so the parens around them should not be dropped. Example (JS-in-HTML-in-JS):
    //     let tpl = html`<script> f((${expr}) / 2); </script>`;
    // If the inner JS formatter removes the parens, the expression might change its meaning:
    //     f((a + b) / 2)  vs  f(a + b / 2)
    if (
      node.extra &&
      node.extra.parenthesized &&
      /^PRETTIER_HTML_PLACEHOLDER_\d+_\d+_IN_JS$/.test(node.name)
    ) {
      return true;
    }
    return false;
  }

  switch (parent.type) {
    case "ParenthesizedExpression":
      return false;
    case "ExportDefaultDeclaration": {
      return (
        // `export default function` or `export default class` can't be followed by
        // anything after. So an expression like `export default (function(){}).toString()`
        // needs to be followed by a parentheses
        shouldWrapFunctionForExportDefault(path, options) ||
        // `export default (foo, bar)` also needs parentheses
        node.type === "SequenceExpression"
      );
    }
    case "Decorator": {
      if (name === "expression") {
        let hasCallExpression = false;
        let hasMemberExpression = false;
        let current = node;
        while (current) {
          switch (current.type) {
            case "MemberExpression":
              hasMemberExpression = true;
              current = current.object;
              break;
            case "CallExpression":
              if (
                /** @(x().y) */ hasMemberExpression ||
                /** @(x().y()) */ hasCallExpression
              ) {
                return true;
              }
              hasCallExpression = true;
              current = current.callee;
              break;
            case "Identifier":
              return false;
            default:
              return true;
          }
        }
        return true;
      }
      break;
    }
    case "ExpressionStatement": {
      if (
        startsWithNoLookaheadToken(
          node,
          /* forbidFunctionClassAndDoExpr */ true
        )
      ) {
        return true;
      }
      break;
    }
    case "ArrowFunctionExpression": {
      if (
        name === "body" &&
        node.type !== "SequenceExpression" && // these have parens added anyway
        startsWithNoLookaheadToken(
          node,
          /* forbidFunctionClassAndDoExpr */ false
        )
      ) {
        return true;
      }
      break;
    }
  }

  if (
    node.type &&
    esquery.matches(node, needsParenthesisesSelector, [path.getParentNode()])
  ) {
    return true;
  }

  switch (node.type) {
    case "BinaryExpression": {
      // We add parentheses to any `a in b` inside `ForStatement` initializer
      // https://github.com/prettier/prettier/issues/907#issuecomment-284304321
      if (node.operator === "in" && isPathInForStatementInitializer(path)) {
        return true;
      }
      if (node.operator === "|>" && node.extra && node.extra.parenthesized) {
        const grandParent = path.getParentNode(1);
        if (
          grandParent.type === "BinaryExpression" &&
          grandParent.operator === "|>"
        ) {
          return true;
        }
      }
    }
    // fallthrough
    case "TSTypeAssertion":
    case "TSAsExpression":
    case "LogicalExpression":
      switch (parent.type) {
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

          if (name === "right" && parentPrecedence === precedence) {
            return true;
          }

          if (
            parentPrecedence === precedence &&
            !shouldFlatten(parentOperator, operator)
          ) {
            return true;
          }

          if (parentPrecedence < precedence && operator === "%") {
            return parentOperator === "+" || parentOperator === "-";
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

    case "SequenceExpression":
      switch (parent.type) {
        case "ReturnStatement":
          return false;

        case "ForStatement":
          // Although parentheses wouldn't hurt around sequence
          // expressions in the head of for loops, traditional style
          // dictates that e.g. i++, j++ should not be wrapped with
          // parentheses.
          return false;

        case "ExpressionStatement":
          return name !== "expression";

        case "ArrowFunctionExpression":
          // We do need parentheses, but SequenceExpressions are handled
          // specially when printing bodies of arrow functions.
          return name !== "body";

        default:
          // Otherwise err on the side of overparenthesization, adding
          // explicit exceptions above if this proves overzealous.
          return true;
      }

    case "YieldExpression":
    // else fallthrough
    case "AwaitExpression":
      switch (parent.type) {
        case "TaggedTemplateExpression":
        case "UnaryExpression":
        case "LogicalExpression":
        case "SpreadElement":
        case "SpreadProperty":
        case "TSAsExpression":
        case "TSNonNullExpression":
        case "BindExpression":
          return true;

        case "MemberExpression":
        case "OptionalMemberExpression":
          return name === "object";

        case "NewExpression":
        case "CallExpression":
        case "OptionalCallExpression":
          return name === "callee";

        case "ConditionalExpression":
          return name === "test";

        case "BinaryExpression": {
          if (!node.argument && parent.operator === "|>") {
            return false;
          }
          return true;
        }

        default:
          return false;
      }

    case "TSJSDocFunctionType":
    case "TSConditionalType":
    case "TSFunctionType":
    case "TSConstructorType":
    case "TSUnionType":
    case "TSIntersectionType":
    case "TSInferType":
      if (node.type === "TSInferType" && parent.type === "TSRestType") {
        return false;
      }
    // fallthrough
    case "TSTypeOperator":
      return (
        parent.type === "TSArrayType" ||
        parent.type === "TSOptionalType" ||
        parent.type === "TSRestType" ||
        (name === "objectType" && parent.type === "TSIndexedAccessType") ||
        parent.type === "TSTypeOperator" ||
        (parent.type === "TSTypeAnnotation" &&
          /^TSJSDoc/.test(path.getParentNode(1).type))
      );
    case "FunctionTypeAnnotation": {
      const ancestor =
        parent.type === "NullableTypeAnnotation"
          ? path.getParentNode(1)
          : parent;

      return (
        ancestor.type === "UnionTypeAnnotation" ||
        ancestor.type === "IntersectionTypeAnnotation" ||
        ancestor.type === "ArrayTypeAnnotation" ||
        // We should check ancestor's parent to know whether the parentheses
        // are really needed, but since ??T doesn't make sense this check
        // will almost never be true.
        ancestor.type === "NullableTypeAnnotation" ||
        // See #5283
        (parent.type === "FunctionTypeParam" &&
          parent.name === null &&
          getFunctionParameters(node).some(
            (param) =>
              param.typeAnnotation &&
              param.typeAnnotation.type === "NullableTypeAnnotation"
          ))
      );
    }

    case "StringLiteral":
    case "NumericLiteral":
    case "Literal":
      if (
        typeof node.value === "string" &&
        parent.type === "ExpressionStatement" &&
        !parent.directive
      ) {
        // To avoid becoming a directive
        const grandParent = path.getParentNode(1);

        return (
          grandParent.type === "Program" ||
          grandParent.type === "BlockStatement"
        );
      }

      return (
        name === "object" &&
        parent.type === "MemberExpression" &&
        typeof node.value === "number"
      );

    case "AssignmentExpression": {
      const grandParent = path.getParentNode(1);

      if (name === "body" && parent.type === "ArrowFunctionExpression") {
        return true;
      } else if (
        name === "key" &&
        parent.type === "ClassProperty" &&
        parent.computed
      ) {
        return false;
      } else if (
        (name === "init" || name === "update") &&
        parent.type === "ForStatement"
      ) {
        return false;
      } else if (parent.type === "ExpressionStatement") {
        return node.left.type === "ObjectPattern";
      } else if (name === "key" && parent.type === "TSPropertySignature") {
        return false;
      } else if (parent.type === "AssignmentExpression") {
        return false;
      } else if (
        parent.type === "SequenceExpression" &&
        grandParent &&
        grandParent.type === "ForStatement" &&
        (grandParent.init === parent || grandParent.update === parent)
      ) {
        return false;
      } else if (
        name === "value" &&
        parent.type === "Property" &&
        grandParent &&
        grandParent.type === "ObjectPattern" &&
        grandParent.properties.includes(parent)
      ) {
        return false;
      } else if (parent.type === "NGChainedExpression") {
        return false;
      }
      return true;
    }

    case "ArrowFunctionExpression":
      switch (parent.type) {
        case "PipelineTopicExpression":
          return !!(node.extra && node.extra.parenthesized);

        case "BinaryExpression":
          return (
            parent.operator !== "|>" || (node.extra && node.extra.parenthesized)
          );
        case "NewExpression":
        case "CallExpression":
        case "OptionalCallExpression":
          return name === "callee";

        case "MemberExpression":
        case "OptionalMemberExpression":
          return name === "object";

        case "TSAsExpression":
        case "BindExpression":
        case "TaggedTemplateExpression":
        case "UnaryExpression":
        case "LogicalExpression":
        case "AwaitExpression":
        case "TSTypeAssertion":
          return true;

        case "ConditionalExpression":
          return name === "test";

        default:
          return false;
      }

    case "ClassExpression":
      switch (parent.type) {
        case "NewExpression":
          return name === "callee";
        default:
          return false;
      }

    case "OptionalMemberExpression":
    case "OptionalCallExpression": {
      const parentParent = path.getParentNode(1);
      if (
        (name === "object" && parent.type === "MemberExpression") ||
        (name === "callee" &&
          (parent.type === "CallExpression" ||
            parent.type === "NewExpression")) ||
        (parent.type === "TSNonNullExpression" &&
          parentParent.type === "MemberExpression" &&
          parentParent.object === parent)
      ) {
        return true;
      }
    }
    // fallthrough
    case "CallExpression":
    case "MemberExpression":
    case "TaggedTemplateExpression":
    case "TSNonNullExpression":
      if (
        name === "callee" &&
        (parent.type === "BindExpression" || parent.type === "NewExpression")
      ) {
        let object = node;
        while (object) {
          switch (object.type) {
            case "CallExpression":
            case "OptionalCallExpression":
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
        (name === "callee" &&
          (parent.type === "BindExpression" ||
            parent.type === "NewExpression")) ||
        (name === "object" &&
          (parent.type === "MemberExpression" ||
            parent.type === "OptionalMemberExpression"))
      );
    case "NGPipeExpression":
      if (
        parent.type === "NGRoot" ||
        parent.type === "NGMicrosyntaxExpression" ||
        (parent.type === "ObjectProperty" &&
          // Preserve parens for compatibility with AngularJS expressions
          !(node.extra && node.extra.parenthesized)) ||
        parent.type === "ArrayExpression" ||
        ((parent.type === "CallExpression" ||
          parent.type === "OptionalCallExpression") &&
          parent.arguments[name] === node) ||
        (name === "right" && parent.type === "NGPipeExpression") ||
        (name === "property" && parent.type === "MemberExpression") ||
        parent.type === "AssignmentExpression"
      ) {
        return false;
      }
      return true;
    case "JSXFragment":
    case "JSXElement":
      return (
        name === "callee" ||
        (name === "left" &&
          parent.type === "BinaryExpression" &&
          parent.operator === "<") ||
        (parent.type !== "ArrayExpression" &&
          parent.type !== "ArrowFunctionExpression" &&
          parent.type !== "AssignmentExpression" &&
          parent.type !== "AssignmentPattern" &&
          parent.type !== "BinaryExpression" &&
          parent.type !== "CallExpression" &&
          parent.type !== "NewExpression" &&
          parent.type !== "ConditionalExpression" &&
          parent.type !== "ExpressionStatement" &&
          parent.type !== "JsExpressionRoot" &&
          parent.type !== "JSXAttribute" &&
          parent.type !== "JSXElement" &&
          parent.type !== "JSXExpressionContainer" &&
          parent.type !== "JSXFragment" &&
          parent.type !== "LogicalExpression" &&
          parent.type !== "ObjectProperty" &&
          parent.type !== "OptionalCallExpression" &&
          parent.type !== "Property" &&
          parent.type !== "ReturnStatement" &&
          parent.type !== "ThrowStatement" &&
          parent.type !== "TypeCastExpression" &&
          parent.type !== "VariableDeclarator")
      );
    case "TypeAnnotation":
      return (
        name === "returnType" &&
        parent.type === "ArrowFunctionExpression" &&
        includesFunctionTypeInObjectType(node)
      );
  }

  return false;
}

function isStatement(node) {
  return (
    node.type === "BlockStatement" ||
    node.type === "BreakStatement" ||
    node.type === "ClassBody" ||
    node.type === "ClassDeclaration" ||
    node.type === "ClassMethod" ||
    node.type === "ClassProperty" ||
    node.type === "ClassPrivateProperty" ||
    node.type === "ContinueStatement" ||
    node.type === "DebuggerStatement" ||
    node.type === "DeclareClass" ||
    node.type === "DeclareExportAllDeclaration" ||
    node.type === "DeclareExportDeclaration" ||
    node.type === "DeclareFunction" ||
    node.type === "DeclareInterface" ||
    node.type === "DeclareModule" ||
    node.type === "DeclareModuleExports" ||
    node.type === "DeclareVariable" ||
    node.type === "DoWhileStatement" ||
    node.type === "EnumDeclaration" ||
    node.type === "ExportAllDeclaration" ||
    node.type === "ExportDefaultDeclaration" ||
    node.type === "ExportNamedDeclaration" ||
    node.type === "ExpressionStatement" ||
    node.type === "ForInStatement" ||
    node.type === "ForOfStatement" ||
    node.type === "ForStatement" ||
    node.type === "FunctionDeclaration" ||
    node.type === "IfStatement" ||
    node.type === "ImportDeclaration" ||
    node.type === "InterfaceDeclaration" ||
    node.type === "LabeledStatement" ||
    node.type === "MethodDefinition" ||
    node.type === "ReturnStatement" ||
    node.type === "SwitchStatement" ||
    node.type === "ThrowStatement" ||
    node.type === "TryStatement" ||
    node.type === "TSDeclareFunction" ||
    node.type === "TSEnumDeclaration" ||
    node.type === "TSImportEqualsDeclaration" ||
    node.type === "TSInterfaceDeclaration" ||
    node.type === "TSModuleDeclaration" ||
    node.type === "TSNamespaceExportDeclaration" ||
    node.type === "TypeAlias" ||
    node.type === "VariableDeclaration" ||
    node.type === "WhileStatement" ||
    node.type === "WithStatement"
  );
}

function isPathInForStatementInitializer(path) {
  let i = 0;
  let node = path.getValue();
  while (node) {
    const parent = path.getParentNode(i++);
    if (parent && parent.type === "ForStatement" && parent.init === node) {
      return true;
    }
    node = parent;
  }

  return false;
}

function includesFunctionTypeInObjectType(node) {
  return hasNode(
    node,
    (n1) =>
      (n1.type === "ObjectTypeAnnotation" &&
        hasNode(
          n1,
          (n2) => n2.type === "FunctionTypeAnnotation" || undefined
        )) ||
      undefined
  );
}

function endsWithRightBracket(node) {
  switch (node.type) {
    case "ObjectExpression":
      return true;
    default:
      return false;
  }
}

function isFollowedByRightBracket(path) {
  const node = path.getValue();
  const parent = path.getParentNode();
  const name = path.getName();
  switch (parent.type) {
    case "NGPipeExpression":
      if (
        typeof name === "number" &&
        parent.arguments[name] === node &&
        parent.arguments.length - 1 === name
      ) {
        return path.callParent(isFollowedByRightBracket);
      }
      break;
    case "ObjectProperty":
      if (name === "value") {
        const parentParent = path.getParentNode(1);
        return (
          parentParent.properties[parentParent.properties.length - 1] === parent
        );
      }
      break;
    case "BinaryExpression":
    case "LogicalExpression":
      if (name === "right") {
        return path.callParent(isFollowedByRightBracket);
      }
      break;
    case "ConditionalExpression":
      if (name === "alternate") {
        return path.callParent(isFollowedByRightBracket);
      }
      break;
    case "UnaryExpression":
      if (parent.prefix) {
        return path.callParent(isFollowedByRightBracket);
      }
      break;
  }
  return false;
}

function shouldWrapFunctionForExportDefault(path, options) {
  const node = path.getValue();
  const parent = path.getParentNode();

  if (node.type === "FunctionExpression" || node.type === "ClassExpression") {
    return (
      parent.type === "ExportDefaultDeclaration" ||
      // in some cases the function is already wrapped
      // (e.g. `export default (function() {})();`)
      // in this case we don't need to add extra parens
      !needsParens(path, options)
    );
  }

  if (
    !hasNakedLeftSide(node) ||
    (parent.type !== "ExportDefaultDeclaration" && needsParens(path, options))
  ) {
    return false;
  }

  return path.call(
    (childPath) => shouldWrapFunctionForExportDefault(childPath, options),
    ...getLeftSidePathName(path, node)
  );
}

module.exports = needsParens;
