import isNonEmptyArray from "../utils/is-non-empty-array.js";
import {
  createTypeCheckFunction,
  getFunctionParameters,
  getLeftSidePathName,
  getPrecedence,
  hasNakedLeftSide,
  hasNode,
  isArrayOrTupleExpression,
  isBinaryCastExpression,
  isBitwiseOperator,
  isCallExpression,
  isMemberExpression,
  isObjectOrRecordExpression,
  isObjectProperty,
  shouldFlatten,
  startsWithNoLookaheadToken,
} from "./utils/index.js";

function needsParens(path, options) {
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

  // Identifiers never need parentheses.
  if (node.type === "Identifier") {
    // ...unless those identifiers are embed placeholders. They might be substituted by complex
    // expressions, so the parens around them should not be dropped. Example (JS-in-HTML-in-JS):
    //     let tpl = html`<script> f((${expr}) / 2); </script>`;
    // If the inner JS formatter removes the parens, the expression might change its meaning:
    //     f((a + b) / 2)  vs  f(a + b / 2)
    if (
      node.extra?.parenthesized &&
      /^PRETTIER_HTML_PLACEHOLDER_\d+_\d+_IN_JS$/.test(node.name)
    ) {
      return true;
    }

    // `for ((async) of []);` and `for ((let) of []);`
    if (
      key === "left" &&
      ((node.name === "async" && !parent.await) || node.name === "let") &&
      parent.type === "ForOfStatement"
    ) {
      return true;
    }

    // `for ((let.a) of []);`
    if (node.name === "let") {
      const expression = path.findAncestor(
        (node) => node.type === "ForOfStatement",
      )?.left;
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

    // `(let)[a] = 1`
    if (
      key === "object" &&
      node.name === "let" &&
      parent.type === "MemberExpression" &&
      parent.computed &&
      !parent.optional
    ) {
      const statement = path.findAncestor(
        (node) =>
          node.type === "ExpressionStatement" ||
          node.type === "ForStatement" ||
          node.type === "ForInStatement",
      );
      const expression = !statement
        ? undefined
        : statement.type === "ExpressionStatement"
          ? statement.expression
          : statement.type === "ForStatement"
            ? statement.init
            : statement.left;
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

    // `(type) satisfies never;` and similar cases
    if (key === "expression") {
      switch (node.name) {
        case "await":
        case "interface":
        case "module":
        case "using":
        case "yield":
        case "let":
        case "component":
        case "hook":
        case "type": {
          const ancestorNeitherAsNorSatisfies = path.findAncestor(
            (node) => !isBinaryCastExpression(node),
          );
          if (
            ancestorNeitherAsNorSatisfies !== parent &&
            ancestorNeitherAsNorSatisfies.type === "ExpressionStatement"
          ) {
            return true;
          }
        }
      }
    }

    return false;
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

  switch (parent.type) {
    case "ParenthesizedExpression":
      return false;
    case "ClassDeclaration":
    case "ClassExpression":
      // Add parens around the extends clause of a class. It is needed for almost
      // all expressions.
      if (
        key === "superClass" &&
        (node.type === "ArrowFunctionExpression" ||
          node.type === "AssignmentExpression" ||
          node.type === "AwaitExpression" ||
          node.type === "BinaryExpression" ||
          node.type === "ConditionalExpression" ||
          node.type === "LogicalExpression" ||
          node.type === "NewExpression" ||
          node.type === "ObjectExpression" ||
          node.type === "SequenceExpression" ||
          node.type === "TaggedTemplateExpression" ||
          node.type === "UnaryExpression" ||
          node.type === "UpdateExpression" ||
          node.type === "YieldExpression" ||
          node.type === "TSNonNullExpression" ||
          (node.type === "ClassExpression" && isNonEmptyArray(node.decorators)))
      ) {
        return true;
      }
      break;

    case "ExportDefaultDeclaration":
      return (
        // `export default function` or `export default class` can't be followed by
        // anything after. So an expression like `export default (function(){}).toString()`
        // needs to be followed by a parentheses
        shouldWrapFunctionForExportDefault(path, options) ||
        // `export default (foo, bar)` also needs parentheses
        node.type === "SequenceExpression"
      );

    case "Decorator":
      if (key === "expression") {
        if (isMemberExpression(node) && node.computed) {
          return true;
        }

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
                return options.parser !== "typescript";
              }
              hasCallExpression = true;
              current = current.callee;
              break;
            case "Identifier":
              return false;
            case "TaggedTemplateExpression":
              // babel-parser cannot parse
              //   @foo`bar`
              return options.parser !== "typescript";
            default:
              return true;
          }
        }
        return true;
      }
      break;

    case "TypeAnnotation":
      if (
        path.match(
          undefined,
          undefined,
          (node, key) =>
            key === "returnType" && node.type === "ArrowFunctionExpression",
        ) &&
        includesFunctionTypeInObjectType(node)
      ) {
        return true;
      }
      break;

    // A user typing `!foo instanceof Bar` probably intended
    // `!(foo instanceof Bar)`, so format to `(!foo) instance Bar` to what is
    // really happening
    case "BinaryExpression":
      if (
        key === "left" &&
        (parent.operator === "in" || parent.operator === "instanceof") &&
        node.type === "UnaryExpression"
      ) {
        return true;
      }
      break;
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
          return isBinaryCastExpression(node);

        case "CallExpression":
        case "NewExpression":
        case "OptionalCallExpression":
          return key === "callee";

        case "ClassExpression":
        case "ClassDeclaration":
          return key === "superClass";

        case "TSTypeAssertion":
        case "TaggedTemplateExpression":
        case "UnaryExpression":
        case "JSXSpreadAttribute":
        case "SpreadElement":
        case "BindExpression":
        case "AwaitExpression":
        case "TSNonNullExpression":
        case "UpdateExpression":
          return true;

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
          return key !== "expression";

        case "ArrowFunctionExpression":
          // We do need parentheses, but SequenceExpressions are handled
          // specially when printing bodies of arrow functions.
          return key !== "body";

        default:
          // Otherwise err on the side of overparenthesization, adding
          // explicit exceptions above if this proves overzealous.
          return true;
      }

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
      if (key === "extendsType" && parent.type === "TSConditionalType") {
        if (node.type === "TSConditionalType") {
          return true;
        }

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

      if (key === "checkType" && parent.type === "TSConditionalType") {
        return true;
      }
    // fallthrough
    case "TSUnionType":
    case "TSIntersectionType":
      if (
        (parent.type === "TSUnionType" ||
          parent.type === "TSIntersectionType") &&
        parent.types.length > 1 &&
        (!node.types || node.types.length > 1)
      ) {
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
      return (
        parent.type === "ArrayTypeAnnotation" ||
        (key === "objectType" &&
          (parent.type === "IndexedAccessType" ||
            parent.type === "OptionalIndexedAccessType"))
      );

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

      /* Matches the following case in Flow:
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

    case "ConditionalTypeAnnotation":
      if (
        key === "extendsType" &&
        parent.type === "ConditionalTypeAnnotation" &&
        node.type === "ConditionalTypeAnnotation"
      ) {
        return true;
      }

      if (key === "checkType" && parent.type === "ConditionalTypeAnnotation") {
        return true;
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
        !parent.directive
      ) {
        // To avoid becoming a directive
        const grandParent = path.grandparent;

        return (
          grandParent.type === "Program" ||
          grandParent.type === "BlockStatement"
        );
      }

      return (
        key === "object" &&
        parent.type === "MemberExpression" &&
        typeof node.value === "number"
      );

    case "AssignmentExpression": {
      const grandParent = path.grandparent;

      if (key === "body" && parent.type === "ArrowFunctionExpression") {
        return true;
      }

      if (
        key === "key" &&
        (parent.type === "ClassProperty" ||
          parent.type === "PropertyDefinition") &&
        parent.computed
      ) {
        return false;
      }

      if (
        (key === "init" || key === "update") &&
        parent.type === "ForStatement"
      ) {
        return false;
      }

      if (parent.type === "ExpressionStatement") {
        return node.left.type === "ObjectPattern";
      }

      if (key === "key" && parent.type === "TSPropertySignature") {
        return false;
      }

      if (parent.type === "AssignmentExpression") {
        return false;
      }

      if (
        parent.type === "SequenceExpression" &&
        grandParent.type === "ForStatement" &&
        (grandParent.init === parent || grandParent.update === parent)
      ) {
        return false;
      }

      if (
        key === "value" &&
        parent.type === "Property" &&
        grandParent.type === "ObjectPattern" &&
        grandParent.properties.includes(parent)
      ) {
        return false;
      }

      if (parent.type === "NGChainedExpression") {
        return false;
      }

      return true;
    }
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
          return true;

        case "ConditionalExpression":
          return key === "test";

        default:
          return false;
      }

    case "ClassExpression":
      switch (parent.type) {
        case "NewExpression":
          return key === "callee";
        default:
          return false;
      }
    case "OptionalMemberExpression":
    case "OptionalCallExpression":
    case "CallExpression":
    case "MemberExpression":
      if (shouldAddParenthesesToChainElement(path)) {
        return true;
      }

    // fallthrough
    case "TaggedTemplateExpression":
    case "TSNonNullExpression":
      if (
        key === "callee" &&
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
        isArrayOrTupleExpression(parent) ||
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
        (!isArrayOrTupleExpression(parent) &&
          parent.type !== "ArrowFunctionExpression" &&
          parent.type !== "AssignmentExpression" &&
          parent.type !== "AssignmentPattern" &&
          parent.type !== "BinaryExpression" &&
          parent.type !== "NewExpression" &&
          parent.type !== "ConditionalExpression" &&
          parent.type !== "ExpressionStatement" &&
          parent.type !== "JsExpressionRoot" &&
          parent.type !== "JSXAttribute" &&
          parent.type !== "JSXElement" &&
          parent.type !== "JSXExpressionContainer" &&
          parent.type !== "JSXFragment" &&
          parent.type !== "LogicalExpression" &&
          !isCallExpression(parent) &&
          !isObjectProperty(parent) &&
          parent.type !== "ReturnStatement" &&
          parent.type !== "ThrowStatement" &&
          parent.type !== "TypeCastExpression" &&
          parent.type !== "VariableDeclarator" &&
          parent.type !== "YieldExpression")
      );

    case "TSInstantiationExpression":
      return key === "object" && isMemberExpression(parent);
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

function includesFunctionTypeInObjectType(node) {
  return hasNode(
    node,
    (node) =>
      node.type === "ObjectTypeAnnotation" &&
      hasNode(node, (node) => node.type === "FunctionTypeAnnotation"),
  );
}

function endsWithRightBracket(node) {
  return isObjectOrRecordExpression(node);
}

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
      if (parent.prefix) {
        return path.callParent(isFollowedByRightBracket);
      }
      break;
  }
  return false;
}

function shouldWrapFunctionForExportDefault(path, options) {
  const { node, parent } = path;

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
    () => shouldWrapFunctionForExportDefault(path, options),
    ...getLeftSidePathName(node),
  );
}

/*
Matches following cases:

```js
(a?.b).c;
(a?.()).b;
(a?.b!).c;
(a?.()!).b;
(a?.b)!.c;
(a?.())!.b;

(a?.b)();
(a?.())();

new (a?.b)();
new (a?.())();
```
*/
function shouldAddParenthesesToChainElement(path) {
  // Babel, this was implemented before #13735, can use `path.match` as estree does
  const { node, parent, grandparent, key } = path;
  if (
    (node.type === "OptionalMemberExpression" ||
      node.type === "OptionalCallExpression") &&
    ((key === "object" && parent.type === "MemberExpression") ||
      (key === "callee" &&
        (parent.type === "CallExpression" ||
          parent.type === "NewExpression")) ||
      (parent.type === "TSNonNullExpression" &&
        grandparent.type === "MemberExpression" &&
        grandparent.object === parent))
  ) {
    return true;
  }

  // ESTree, same logic as babel
  if (
    path.match(
      () => node.type === "CallExpression" || node.type === "MemberExpression",
      (node, name) => name === "expression" && node.type === "ChainExpression",
    ) &&
    (path.match(
      undefined,
      undefined,
      (node, name) =>
        (name === "callee" &&
          ((node.type === "CallExpression" && !node.optional) ||
            node.type === "NewExpression")) ||
        (name === "object" &&
          node.type === "MemberExpression" &&
          !node.optional),
    ) ||
      path.match(
        undefined,
        undefined,
        (node, name) =>
          name === "expression" && node.type === "TSNonNullExpression",
        (node, name) => name === "object" && node.type === "MemberExpression",
      ))
  ) {
    return true;
  }

  // Babel treat `(a?.b!).c` and `(a?.b)!.c` the same, https://github.com/babel/babel/discussions/15077
  // Use this to align with babel
  if (
    path.match(
      () => node.type === "CallExpression" || node.type === "MemberExpression",
      (node, name) =>
        name === "expression" && node.type === "TSNonNullExpression",
      (node, name) => name === "expression" && node.type === "ChainExpression",
      (node, name) => name === "object" && node.type === "MemberExpression",
    )
  ) {
    return true;
  }

  // This function only handle cases above
  return false;
}

export default needsParens;
