"use strict";

const assert = require("assert");

const util = require("../common/util");
const comments = require("./comments");
const { hasFlowShorthandAnnotationComment } = require("./utils");

function hasClosureCompilerTypeCastComment(text, path, locStart, locEnd) {
  // https://github.com/google/closure-compiler/wiki/Annotating-Types#type-casts
  // Syntax example: var x = /** @type {string} */ (fruit);

  const n = path.getValue();

  return (
    util.getNextNonSpaceNonCommentCharacter(text, n, locEnd) === ")" &&
    (hasTypeCastComment(n) || hasAncestorTypeCastComment(0))
  );

  // for sub-item: /** @type {array} */ (numberOrString).map(x => x);
  function hasAncestorTypeCastComment(index) {
    const ancestor = path.getParentNode(index);
    return ancestor &&
      util.getNextNonSpaceNonCommentCharacter(text, ancestor, locEnd) !== ")" &&
      /^[\s(]*$/.test(text.slice(locStart(ancestor), locStart(n)))
      ? hasTypeCastComment(ancestor) || hasAncestorTypeCastComment(index + 1)
      : false;
  }

  function hasTypeCastComment(node) {
    return (
      node.comments &&
      node.comments.some(
        comment =>
          comment.leading &&
          comments.isBlockComment(comment) &&
          isTypeCastComment(comment.value) &&
          util.getNextNonSpaceNonCommentCharacter(text, comment, locEnd) === "("
      )
    );
  }

  function isTypeCastComment(comment) {
    const trimmed = comment.trim();
    if (!/^\*\s*@type\s*\{[^]+\}$/.test(trimmed)) {
      return false;
    }
    let isCompletelyClosed = false;
    let unpairedBracketCount = 0;
    for (const char of trimmed) {
      if (char === "{") {
        if (isCompletelyClosed) {
          return false;
        }
        unpairedBracketCount++;
      } else if (char === "}") {
        if (unpairedBracketCount === 0) {
          return false;
        }
        unpairedBracketCount--;
        if (unpairedBracketCount === 0) {
          isCompletelyClosed = true;
        }
      }
    }
    return unpairedBracketCount === 0;
  }
}

function needsParens(path, options) {
  const parent = path.getParentNode();
  if (!parent) {
    return false;
  }

  const name = path.getName();
  const node = path.getNode();

  // If the value of this path is some child of a Node and not a Node
  // itself, then it doesn't need parentheses. Only Node objects (in
  // fact, only Expression nodes) need parentheses.
  if (path.getValue() !== node) {
    return false;
  }

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

  // Closure compiler requires that type casted expressions to be surrounded by
  // parentheses.
  if (
    hasClosureCompilerTypeCastComment(
      options.originalText,
      path,
      options.locStart,
      options.locEnd
    )
  ) {
    return true;
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
    return false;
  }

  if (parent.type === "ParenthesizedExpression") {
    return false;
  }

  // Add parens around the extends clause of a class. It is needed for almost
  // all expressions.
  if (
    (parent.type === "ClassDeclaration" || parent.type === "ClassExpression") &&
    parent.superClass === node &&
    (node.type === "ArrowFunctionExpression" ||
      node.type === "AssignmentExpression" ||
      node.type === "AwaitExpression" ||
      node.type === "BinaryExpression" ||
      node.type === "ConditionalExpression" ||
      node.type === "LogicalExpression" ||
      node.type === "NewExpression" ||
      node.type === "ObjectExpression" ||
      node.type === "ParenthesizedExpression" ||
      node.type === "SequenceExpression" ||
      node.type === "TaggedTemplateExpression" ||
      node.type === "UnaryExpression" ||
      node.type === "UpdateExpression" ||
      node.type === "YieldExpression")
  ) {
    return true;
  }

  if (parent.type === "Decorator" && parent.expression === node) {
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

  if (
    (parent.type === "ArrowFunctionExpression" &&
    parent.body === node &&
    node.type !== "SequenceExpression" && // these have parens added anyway
      util.startsWithNoLookaheadToken(
        node,
        /* forbidFunctionClassAndDoExpr */ false
      )) ||
    (parent.type === "ExpressionStatement" &&
      util.startsWithNoLookaheadToken(
        node,
        /* forbidFunctionClassAndDoExpr */ true
      ))
  ) {
    return true;
  }

  switch (node.type) {
    case "CallExpression": {
      let firstParentNotMemberExpression = parent;
      let i = 0;
      while (
        firstParentNotMemberExpression &&
        firstParentNotMemberExpression.type === "MemberExpression"
      ) {
        firstParentNotMemberExpression = path.getParentNode(++i);
      }

      if (
        firstParentNotMemberExpression.type === "NewExpression" &&
        firstParentNotMemberExpression.callee === path.getParentNode(i - 1)
      ) {
        return true;
      }

      if (parent.type === "BindExpression" && parent.callee === node) {
        return true;
      }
      return false;
    }

    case "SpreadElement":
    case "SpreadProperty":
      return (
        parent.type === "MemberExpression" &&
        name === "object" &&
        parent.object === node
      );

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
          return name === "object" && parent.object === node;

        case "TaggedTemplateExpression":
          return true;

        case "NewExpression":
        case "CallExpression":
          return name === "callee" && parent.callee === node;

        case "BinaryExpression":
          return parent.operator === "**" && name === "left";

        case "TSNonNullExpression":
          return true;

        default:
          return false;
      }

    case "BinaryExpression": {
      if (parent.type === "UpdateExpression") {
        return true;
      }

      const isLeftOfAForStatement = node => {
        let i = 0;
        while (node) {
          const parent = path.getParentNode(i++);
          if (!parent) {
            return false;
          }
          if (parent.type === "ForStatement" && parent.init === node) {
            return true;
          }
          node = parent;
        }
        return false;
      };
      if (node.operator === "in" && isLeftOfAForStatement(node)) {
        return true;
      }
    }
    // fallthrough
    case "TSTypeAssertion":
    case "TSAsExpression":
    case "LogicalExpression":
      switch (parent.type) {
        case "ConditionalExpression":
          return node.type === "TSAsExpression";

        case "CallExpression":
        case "NewExpression":
          return name === "callee" && parent.callee === node;

        case "ClassExpression":
        case "ClassDeclaration":
          return name === "superClass" && parent.superClass === node;
        case "TSTypeAssertion":
        case "TaggedTemplateExpression":
        case "UnaryExpression":
        case "SpreadElement":
        case "SpreadProperty":
        case "BindExpression":
        case "AwaitExpression":
        case "TSAsExpression":
        case "TSNonNullExpression":
        case "UpdateExpression":
          return true;

        case "MemberExpression":
        case "OptionalMemberExpression":
          return name === "object" && parent.object === node;

        case "AssignmentExpression":
          return (
            parent.left === node &&
            (node.type === "TSTypeAssertion" || node.type === "TSAsExpression")
          );

        case "BinaryExpression":
        case "LogicalExpression": {
          if (!node.operator && node.type !== "TSTypeAssertion") {
            return true;
          }

          const po = parent.operator;
          const pp = util.getPrecedence(po);
          const no = node.operator;
          const np = util.getPrecedence(no);

          if (pp > np) {
            return true;
          }

          if ((po === "||" || po === "??") && no === "&&") {
            return true;
          }

          if (pp === np && name === "right") {
            assert.strictEqual(parent.right, node);
            return true;
          }

          if (pp === np && !util.shouldFlatten(po, no)) {
            return true;
          }

          if (pp < np && no === "%") {
            return po === "+" || po === "-";
          }

          // Add parenthesis when working with bitwise operators
          // It's not stricly needed but helps with code understanding
          if (util.isBitwiseOperator(po)) {
            return true;
          }

          return false;
        }

        default:
          return false;
      }

    case "TSParenthesizedType": {
      const grandParent = path.getParentNode(1);

      /**
       * const foo = (): (() => void) => (): void => null;
       *                 ^          ^
       */
      if (
        getUnparenthesizedNode(node).type === "TSFunctionType" &&
        parent.type === "TSTypeAnnotation" &&
        grandParent.type === "ArrowFunctionExpression" &&
        grandParent.returnType === parent
      ) {
        return true;
      }

      if (
        (parent.type === "TSTypeParameter" ||
          parent.type === "TypeParameter" ||
          parent.type === "TSTypeAliasDeclaration" ||
          parent.type === "TSTypeAnnotation" ||
          parent.type === "TSParenthesizedType" ||
          parent.type === "TSTypeParameterInstantiation") &&
        (grandParent.type !== "TSTypeOperator" &&
          grandParent.type !== "TSOptionalType")
      ) {
        return false;
      }
      // Delegate to inner TSParenthesizedType
      if (node.typeAnnotation.type === "TSParenthesizedType") {
        return false;
      }
      return true;
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
      if (
        parent.type === "UnaryExpression" ||
        parent.type === "AwaitExpression" ||
        parent.type === "TSAsExpression" ||
        parent.type === "TSNonNullExpression"
      ) {
        return true;
      }
    // else fallthrough
    case "AwaitExpression":
      switch (parent.type) {
        case "TaggedTemplateExpression":
        case "UnaryExpression":
        case "BinaryExpression":
        case "LogicalExpression":
        case "SpreadElement":
        case "SpreadProperty":
        case "TSAsExpression":
        case "TSNonNullExpression":
        case "BindExpression":
          return true;

        case "MemberExpression":
          return parent.object === node;

        case "NewExpression":
        case "CallExpression":
          return parent.callee === node;

        case "ConditionalExpression":
          return parent.test === node;

        default:
          return false;
      }

    case "ArrayTypeAnnotation":
      return parent.type === "NullableTypeAnnotation";

    case "IntersectionTypeAnnotation":
    case "UnionTypeAnnotation":
      return (
        parent.type === "ArrayTypeAnnotation" ||
        parent.type === "NullableTypeAnnotation" ||
        parent.type === "IntersectionTypeAnnotation" ||
        parent.type === "UnionTypeAnnotation"
      );

    case "NullableTypeAnnotation":
      return parent.type === "ArrayTypeAnnotation";

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
        ancestor.type === "NullableTypeAnnotation"
      );
    }

    case "StringLiteral":
    case "NumericLiteral":
    case "Literal":
      if (
        typeof node.value === "string" &&
        parent.type === "ExpressionStatement" &&
        // TypeScript workaround for https://github.com/JamesHenry/typescript-estree/issues/2
        // See corresponding workaround in printer.js case: "Literal"
        ((options.parser !== "typescript" && !parent.directive) ||
          (options.parser === "typescript" &&
            options.originalText.substr(options.locStart(node) - 1, 1) === "("))
      ) {
        // To avoid becoming a directive
        const grandParent = path.getParentNode(1);

        return (
          grandParent.type === "Program" ||
          grandParent.type === "BlockStatement"
        );
      }

      return (
        parent.type === "MemberExpression" &&
        typeof node.value === "number" &&
        name === "object" &&
        parent.object === node
      );

    case "AssignmentExpression": {
      const grandParent = path.getParentNode(1);

      if (parent.type === "ArrowFunctionExpression" && parent.body === node) {
        return true;
      } else if (
        parent.type === "ClassProperty" &&
        parent.key === node &&
        parent.computed
      ) {
        return false;
      } else if (
        parent.type === "TSPropertySignature" &&
        parent.name === node
      ) {
        return false;
      } else if (
        parent.type === "ForStatement" &&
        (parent.init === node || parent.update === node)
      ) {
        return false;
      } else if (parent.type === "ExpressionStatement") {
        return node.left.type === "ObjectPattern";
      } else if (parent.type === "TSPropertySignature" && parent.key === node) {
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
      } else if (parent.type === "Property" && parent.value === node) {
        return false;
      } else if (parent.type === "NGChainedExpression") {
        return false;
      }
      return true;
    }
    case "ConditionalExpression":
      switch (parent.type) {
        case "TaggedTemplateExpression":
        case "UnaryExpression":
        case "SpreadElement":
        case "SpreadProperty":
        case "BinaryExpression":
        case "LogicalExpression":
        case "NGPipeExpression":
        case "ExportDefaultDeclaration":
        case "AwaitExpression":
        case "JSXSpreadAttribute":
        case "TSTypeAssertion":
        case "TypeCastExpression":
        case "TSAsExpression":
        case "TSNonNullExpression":
        case "OptionalMemberExpression":
          return true;

        case "NewExpression":
        case "CallExpression":
          return name === "callee" && parent.callee === node;

        case "ConditionalExpression":
          return name === "test" && parent.test === node;

        case "MemberExpression":
          return name === "object" && parent.object === node;

        default:
          return false;
      }

    case "FunctionExpression":
      switch (parent.type) {
        case "NewExpression":
        case "CallExpression":
          return name === "callee"; // Not strictly necessary, but it's clearer to the reader if IIFEs are wrapped in parentheses.
        case "TaggedTemplateExpression":
          return true; // This is basically a kind of IIFE.
        case "ExportDefaultDeclaration":
          return true;
        default:
          return false;
      }

    case "ArrowFunctionExpression":
      switch (parent.type) {
        case "CallExpression":
          return name === "callee";

        case "NewExpression":
          return name === "callee";

        case "MemberExpression":
          return name === "object";

        case "TSAsExpression":
        case "BindExpression":
        case "TaggedTemplateExpression":
        case "UnaryExpression":
        case "LogicalExpression":
        case "BinaryExpression":
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
        case "ExportDefaultDeclaration":
          return true;
        case "NewExpression":
          return name === "callee" && parent.callee === node;
        default:
          return false;
      }

    case "OptionalMemberExpression":
      return parent.type === "MemberExpression";

    case "MemberExpression":
      if (
        parent.type === "BindExpression" &&
        name === "callee" &&
        parent.callee === node
      ) {
        let object = node.object;
        while (object) {
          if (object.type === "CallExpression") {
            return true;
          }
          if (
            object.type !== "MemberExpression" &&
            object.type !== "BindExpression"
          ) {
            break;
          }
          object = object.object;
        }
      }
      return false;

    case "BindExpression":
      if (
        (parent.type === "BindExpression" &&
          name === "callee" &&
          parent.callee === node) ||
        parent.type === "MemberExpression"
      ) {
        return true;
      }
      return false;
    case "NGPipeExpression":
      if (
        parent.type === "NGRoot" ||
        parent.type === "NGMicrosyntaxExpression" ||
        parent.type === "ObjectProperty" ||
        parent.type === "ArrayExpression" ||
        ((parent.type === "CallExpression" ||
          parent.type === "OptionalCallExpression") &&
          parent.arguments[name] === node) ||
        (parent.type === "NGPipeExpression" && name === "right") ||
        (parent.type === "MemberExpression" && name === "property") ||
        parent.type === "AssignmentExpression"
      ) {
        return false;
      }
      return true;
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
    node.type === "ExportAllDeclaration" ||
    node.type === "ExportDefaultDeclaration" ||
    node.type === "ExportNamedDeclaration" ||
    node.type === "ExpressionStatement" ||
    node.type === "ForAwaitStatement" ||
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

function getUnparenthesizedNode(node) {
  return node.type === "TSParenthesizedType"
    ? getUnparenthesizedNode(node.typeAnnotation)
    : node;
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

module.exports = needsParens;
