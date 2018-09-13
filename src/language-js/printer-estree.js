"use strict";

const assert = require("assert");
// TODO(azz): anything that imports from main shouldn't be in a `language-*` dir.
const comments = require("../main/comments");
const {
  getParentExportDeclaration,
  isExportDeclaration,
  shouldFlatten,
  getNextNonSpaceNonCommentCharacter,
  hasNewline,
  hasNewlineInRange,
  getLast,
  getStringWidth,
  printString,
  printNumber,
  hasIgnoreComment,
  skipWhitespace,
  hasNodeIgnoreComment,
  getPenultimate,
  startsWithNoLookaheadToken,
  getIndentSize,
  matchAncestorTypes,
  isWithinParentArrayProperty
} = require("../common/util");
const {
  isNextLineEmpty,
  isNextLineEmptyAfterIndex,
  getNextNonSpaceNonCommentCharacterIndex
} = require("../common/util-shared");
const isIdentifierName = require("esutils").keyword.isIdentifierNameES6;
const embed = require("./embed");
const clean = require("./clean");
const insertPragma = require("./pragma").insertPragma;
const handleComments = require("./comments");
const pathNeedsParens = require("./needs-parens");
const preprocess = require("./preprocess");

const {
  builders: {
    concat,
    join,
    line,
    hardline,
    softline,
    literalline,
    group,
    indent,
    align,
    conditionalGroup,
    fill,
    ifBreak,
    breakParent,
    lineSuffixBoundary,
    addAlignmentToDoc,
    dedent
  },
  utils: { willBreak, isLineNext, isEmpty, removeLines },
  printer: { printDocToString }
} = require("../doc");

function shouldPrintComma(options, level) {
  level = level || "es5";

  switch (options.trailingComma) {
    case "all":
      if (level === "all") {
        return true;
      }
    // fallthrough
    case "es5":
      if (level === "es5") {
        return true;
      }
    // fallthrough
    case "none":
    default:
      return false;
  }
}

function genericPrint(path, options, printPath, args) {
  const node = path.getValue();
  let needsParens = false;
  const linesWithoutParens = printPathNoParens(path, options, printPath, args);

  if (!node || isEmpty(linesWithoutParens)) {
    return linesWithoutParens;
  }

  const decorators = [];
  if (
    node.decorators &&
    node.decorators.length > 0 &&
    // If the parent node is an export declaration, it will be
    // responsible for printing node.decorators.
    !getParentExportDeclaration(path)
  ) {
    const separator =
      node.decorators.length === 1 &&
      isWithinParentArrayProperty(path, "params")
        ? line
        : hardline;

    path.each(decoratorPath => {
      let decorator = decoratorPath.getValue();
      if (decorator.expression) {
        decorator = decorator.expression;
      } else {
        decorator = decorator.callee;
      }

      decorators.push(printPath(decoratorPath), separator);
    }, "decorators");
  } else if (
    isExportDeclaration(node) &&
    node.declaration &&
    node.declaration.decorators
  ) {
    // Export declarations are responsible for printing any decorators
    // that logically apply to node.declaration.
    path.each(
      decoratorPath => {
        const decorator = decoratorPath.getValue();
        const prefix = decorator.type === "Decorator" ? "" : "@";
        decorators.push(prefix, printPath(decoratorPath), hardline);
      },
      "declaration",
      "decorators"
    );
  } else {
    // Nodes with decorators can't have parentheses, so we can avoid
    // computing pathNeedsParens() except in this case.
    needsParens = pathNeedsParens(path, options);
  }

  const parts = [];
  if (needsParens) {
    parts.unshift("(");
  }

  parts.push(linesWithoutParens);

  if (needsParens) {
    parts.push(")");
  }

  if (decorators.length > 0) {
    return group(concat(decorators.concat(parts)));
  }
  return concat(parts);
}

function hasPrettierIgnore(path) {
  return hasIgnoreComment(path) || hasJsxIgnoreComment(path);
}

function hasJsxIgnoreComment(path) {
  const node = path.getValue();
  const parent = path.getParentNode();
  if (!parent || !node || !isJSXNode(node) || !isJSXNode(parent)) {
    return false;
  }

  // Lookup the previous sibling, ignoring any empty JSXText elements
  const index = parent.children.indexOf(node);
  let prevSibling = null;
  for (let i = index; i > 0; i--) {
    const candidate = parent.children[i - 1];
    if (candidate.type === "JSXText" && !isMeaningfulJSXText(candidate)) {
      continue;
    }
    prevSibling = candidate;
    break;
  }

  return (
    prevSibling &&
    prevSibling.type === "JSXExpressionContainer" &&
    prevSibling.expression.type === "JSXEmptyExpression" &&
    prevSibling.expression.comments &&
    prevSibling.expression.comments.find(
      comment => comment.value.trim() === "prettier-ignore"
    )
  );
}

// The following is the shared logic for
// ternary operators, namely ConditionalExpression
// and TSConditionalType
function formatTernaryOperator(path, options, print, operatorOptions) {
  const n = path.getValue();
  const parts = [];
  const operatorOpts = Object.assign(
    {
      beforeParts: () => [""],
      afterParts: () => [""],
      shouldCheckJsx: true,
      operatorName: "ConditionalExpression",
      consequentNode: "consequent",
      alternateNode: "alternate",
      testNode: "test",
      breakNested: true
    },
    operatorOptions || {}
  );

  // We print a ConditionalExpression in either "JSX mode" or "normal mode".
  // See tests/jsx/conditional-expression.js for more info.
  let jsxMode = false;
  const parent = path.getParentNode();
  let forceNoIndent = parent.type === operatorOpts.operatorName;

  // Find the outermost non-ConditionalExpression parent, and the outermost
  // ConditionalExpression parent. We'll use these to determine if we should
  // print in JSX mode.
  let currentParent;
  let previousParent;
  let i = 0;
  do {
    previousParent = currentParent || n;
    currentParent = path.getParentNode(i);
    i++;
  } while (currentParent && currentParent.type === operatorOpts.operatorName);
  const firstNonConditionalParent = currentParent || parent;
  const lastConditionalParent = previousParent;

  if (
    (operatorOpts.shouldCheckJsx && isJSXNode(n[operatorOpts.testNode])) ||
    isJSXNode(n[operatorOpts.consequentNode]) ||
    isJSXNode(n[operatorOpts.alternateNode]) ||
    conditionalExpressionChainContainsJSX(lastConditionalParent)
  ) {
    jsxMode = true;
    forceNoIndent = true;

    // Even though they don't need parens, we wrap (almost) everything in
    // parens when using ?: within JSX, because the parens are analogous to
    // curly braces in an if statement.
    const wrap = doc =>
      concat([
        ifBreak("(", ""),
        indent(concat([softline, doc])),
        softline,
        ifBreak(")", "")
      ]);

    // The only things we don't wrap are:
    // * Nested conditional expressions in alternates
    // * null
    const isNull = node =>
      node.type === "NullLiteral" ||
      (node.type === "Literal" && node.value === null);

    parts.push(
      " ? ",
      isNull(n[operatorOpts.consequentNode])
        ? path.call(print, operatorOpts.consequentNode)
        : wrap(path.call(print, operatorOpts.consequentNode)),
      " : ",
      n[operatorOpts.alternateNode].type === operatorOpts.operatorName ||
      isNull(n[operatorOpts.alternateNode])
        ? path.call(print, operatorOpts.alternateNode)
        : wrap(path.call(print, operatorOpts.alternateNode))
    );
  } else {
    // normal mode
    const part = concat([
      line,
      "? ",
      n[operatorOpts.consequentNode].type === operatorOpts.operatorName
        ? ifBreak("", "(")
        : "",
      align(2, path.call(print, operatorOpts.consequentNode)),
      n[operatorOpts.consequentNode].type === operatorOpts.operatorName
        ? ifBreak("", ")")
        : "",
      line,
      ": ",
      align(2, path.call(print, operatorOpts.alternateNode))
    ]);
    parts.push(
      parent.type === operatorOpts.operatorName
        ? options.useTabs
          ? dedent(indent(part))
          : align(Math.max(0, options.tabWidth - 2), part)
        : part
    );
  }

  // We want a whole chain of ConditionalExpressions to all
  // break if any of them break. That means we should only group around the
  // outer-most ConditionalExpression.
  const maybeGroup = doc =>
    operatorOpts.breakNested
      ? parent === firstNonConditionalParent
        ? group(doc)
        : doc
      : group(doc); // Always group in normal mode.

  // Break the closing paren to keep the chain right after it:
  // (a
  //   ? b
  //   : c
  // ).call()
  const breakClosingParen =
    !jsxMode &&
    (parent.type === "MemberExpression" ||
      parent.type === "OptionalMemberExpression") &&
    !parent.computed;

  return maybeGroup(
    concat(
      [].concat(
        operatorOpts.beforeParts(),
        forceNoIndent ? concat(parts) : indent(concat(parts)),
        operatorOpts.afterParts(breakClosingParen)
      )
    )
  );
}

function getTypeScriptMappedTypeModifier(tokenNode, keyword) {
  if (tokenNode.type === "TSPlusToken") {
    return "+" + keyword;
  } else if (tokenNode.type === "TSMinusToken") {
    return "-" + keyword;
  }
  return keyword;
}

function printPathNoParens(path, options, print, args) {
  const n = path.getValue();
  const semi = options.semi ? ";" : "";

  if (!n) {
    return "";
  }

  if (typeof n === "string") {
    return n;
  }

  let parts = [];
  switch (n.type) {
    case "JsonRoot":
      return concat([path.call(print, "node"), hardline]);
    case "File":
      // Print @babel/parser's InterpreterDirective here so that
      // leading comments on the `Program` node get printed after the hashbang.
      if (n.program && n.program.interpreter) {
        parts.push(
          path.call(
            programPath => programPath.call(print, "interpreter"),
            "program"
          )
        );
      }

      parts.push(path.call(print, "program"));

      return concat(parts);

    case "Program":
      // Babel 6
      if (n.directives) {
        path.each(childPath => {
          parts.push(print(childPath), semi, hardline);
          if (
            isNextLineEmpty(options.originalText, childPath.getValue(), options)
          ) {
            parts.push(hardline);
          }
        }, "directives");
      }

      parts.push(
        path.call(bodyPath => {
          return printStatementSequence(bodyPath, options, print);
        }, "body")
      );

      parts.push(
        comments.printDanglingComments(path, options, /* sameIndent */ true)
      );

      // Only force a trailing newline if there were any contents.
      if (n.body.length || n.comments) {
        parts.push(hardline);
      }

      return concat(parts);
    // Babel extension.
    case "EmptyStatement":
      return "";
    case "ExpressionStatement":
      // Detect Flow-parsed directives
      if (n.directive) {
        return concat([nodeStr(n.expression, options, true), semi]);
      }
      // Do not append semicolon after the only JSX element in a program
      return concat([
        path.call(print, "expression"),
        isTheOnlyJSXElementInMarkdown(options, path) ? "" : semi
      ]); // Babel extension.
    case "ParenthesizedExpression":
      return concat(["(", path.call(print, "expression"), ")"]);
    case "AssignmentExpression":
      return printAssignment(
        n.left,
        path.call(print, "left"),
        concat([" ", n.operator]),
        n.right,
        path.call(print, "right"),
        options
      );
    case "BinaryExpression":
    case "LogicalExpression": {
      const parent = path.getParentNode();
      const parentParent = path.getParentNode(1);
      const isInsideParenthesis =
        n !== parent.body &&
        (parent.type === "IfStatement" ||
          parent.type === "WhileStatement" ||
          parent.type === "DoWhileStatement");

      const parts = printBinaryishExpressions(
        path,
        print,
        options,
        /* isNested */ false,
        isInsideParenthesis
      );

      //   if (
      //     this.hasPlugin("dynamicImports") && this.lookahead().type === tt.parenLeft
      //   ) {
      //
      // looks super weird, we want to break the children if the parent breaks
      //
      //   if (
      //     this.hasPlugin("dynamicImports") &&
      //     this.lookahead().type === tt.parenLeft
      //   ) {
      if (isInsideParenthesis) {
        return concat(parts);
      }

      // Break between the parens in unaries or in a member expression, i.e.
      //
      //   (
      //     a &&
      //     b &&
      //     c
      //   ).call()
      if (
        parent.type === "UnaryExpression" ||
        ((parent.type === "MemberExpression" ||
          parent.type === "OptionalMemberExpression") &&
          !parent.computed)
      ) {
        return group(
          concat([indent(concat([softline, concat(parts)])), softline])
        );
      }

      // Avoid indenting sub-expressions in some cases where the first sub-expression is already
      // indented accordingly. We should indent sub-expressions where the first case isn't indented.
      const shouldNotIndent =
        parent.type === "ReturnStatement" ||
        (parent.type === "JSXExpressionContainer" &&
          parentParent.type === "JSXAttribute") ||
        (n === parent.body && parent.type === "ArrowFunctionExpression") ||
        (n !== parent.body && parent.type === "ForStatement") ||
        (parent.type === "ConditionalExpression" &&
          (parentParent.type !== "ReturnStatement" &&
            parentParent.type !== "CallExpression"));

      const shouldIndentIfInlining =
        parent.type === "AssignmentExpression" ||
        parent.type === "VariableDeclarator" ||
        parent.type === "ClassProperty" ||
        parent.type === "TSAbstractClassProperty" ||
        parent.type === "ClassPrivateProperty" ||
        parent.type === "ObjectProperty" ||
        parent.type === "Property";

      const samePrecedenceSubExpression =
        isBinaryish(n.left) && shouldFlatten(n.operator, n.left.operator);

      if (
        shouldNotIndent ||
        (shouldInlineLogicalExpression(n) && !samePrecedenceSubExpression) ||
        (!shouldInlineLogicalExpression(n) && shouldIndentIfInlining)
      ) {
        return group(concat(parts));
      }

      const rest = concat(parts.slice(1));

      return group(
        concat([
          // Don't include the initial expression in the indentation
          // level. The first item is guaranteed to be the first
          // left-most expression.
          parts.length > 0 ? parts[0] : "",
          indent(rest)
        ])
      );
    }
    case "AssignmentPattern":
      return concat([
        path.call(print, "left"),
        " = ",
        path.call(print, "right")
      ]);
    case "TSTypeAssertionExpression": {
      const shouldBreakAfterCast = !(
        n.expression.type === "ArrayExpression" ||
        n.expression.type === "ObjectExpression"
      );

      const castGroup = group(
        concat([
          "<",
          indent(concat([softline, path.call(print, "typeAnnotation")])),
          softline,
          ">"
        ])
      );

      const exprContents = concat([
        ifBreak("("),
        indent(concat([softline, path.call(print, "expression")])),
        softline,
        ifBreak(")")
      ]);

      if (shouldBreakAfterCast) {
        return conditionalGroup([
          concat([castGroup, path.call(print, "expression")]),
          concat([castGroup, group(exprContents, { shouldBreak: true })]),
          concat([castGroup, path.call(print, "expression")])
        ]);
      }
      return group(concat([castGroup, path.call(print, "expression")]));
    }
    case "OptionalMemberExpression":
    case "MemberExpression": {
      const parent = path.getParentNode();
      let firstNonMemberParent;
      let i = 0;
      do {
        firstNonMemberParent = path.getParentNode(i);
        i++;
      } while (
        firstNonMemberParent &&
        (firstNonMemberParent.type === "MemberExpression" ||
          firstNonMemberParent.type === "OptionalMemberExpression" ||
          firstNonMemberParent.type === "TSNonNullExpression")
      );

      const shouldInline =
        (firstNonMemberParent &&
          (firstNonMemberParent.type === "NewExpression" ||
            firstNonMemberParent.type === "BindExpression" ||
            (firstNonMemberParent.type === "VariableDeclarator" &&
              firstNonMemberParent.id.type !== "Identifier") ||
            (firstNonMemberParent.type === "AssignmentExpression" &&
              firstNonMemberParent.left.type !== "Identifier"))) ||
        n.computed ||
        (n.object.type === "Identifier" &&
          n.property.type === "Identifier" &&
          parent.type !== "MemberExpression" &&
          parent.type !== "OptionalMemberExpression");

      return concat([
        path.call(print, "object"),
        shouldInline
          ? printMemberLookup(path, options, print)
          : group(
              indent(
                concat([softline, printMemberLookup(path, options, print)])
              )
            )
      ]);
    }
    case "MetaProperty":
      return concat([
        path.call(print, "meta"),
        ".",
        path.call(print, "property")
      ]);
    case "BindExpression":
      if (n.object) {
        parts.push(path.call(print, "object"));
      }

      parts.push(
        group(
          indent(
            concat([softline, printBindExpressionCallee(path, options, print)])
          )
        )
      );

      return concat(parts);
    case "Identifier": {
      return concat([
        n.name,
        printOptionalToken(path),
        printTypeAnnotation(path, options, print)
      ]);
    }
    case "SpreadElement":
    case "SpreadElementPattern":
    case "RestProperty":
    case "SpreadProperty":
    case "SpreadPropertyPattern":
    case "RestElement":
    case "ObjectTypeSpreadProperty":
      return concat([
        "...",
        path.call(print, "argument"),
        printTypeAnnotation(path, options, print)
      ]);
    case "FunctionDeclaration":
    case "FunctionExpression":
      if (isNodeStartingWithDeclare(n, options)) {
        parts.push("declare ");
      }
      parts.push(printFunctionDeclaration(path, print, options));
      if (!n.body) {
        parts.push(semi);
      }
      return concat(parts);
    case "ArrowFunctionExpression": {
      if (n.async) {
        parts.push("async ");
      }

      if (shouldPrintParamsWithoutParens(path, options)) {
        parts.push(path.call(print, "params", 0));
      } else {
        parts.push(
          group(
            concat([
              printFunctionParams(
                path,
                print,
                options,
                /* expandLast */ args &&
                  (args.expandLastArg || args.expandFirstArg),
                /* printTypeParams */ true
              ),
              printReturnType(path, print, options)
            ])
          )
        );
      }

      const dangling = comments.printDanglingComments(
        path,
        options,
        /* sameIndent */ true,
        comment => {
          const nextCharacter = getNextNonSpaceNonCommentCharacterIndex(
            options.originalText,
            comment,
            options
          );
          return options.originalText.substr(nextCharacter, 2) === "=>";
        }
      );
      if (dangling) {
        parts.push(" ", dangling);
      }

      parts.push(" =>");

      const body = path.call(bodyPath => print(bodyPath, args), "body");

      // We want to always keep these types of nodes on the same line
      // as the arrow.
      if (
        !hasLeadingOwnLineComment(options.originalText, n.body, options) &&
        (n.body.type === "ArrayExpression" ||
          n.body.type === "ObjectExpression" ||
          n.body.type === "BlockStatement" ||
          isJSXNode(n.body) ||
          isTemplateOnItsOwnLine(n.body, options.originalText, options) ||
          n.body.type === "ArrowFunctionExpression" ||
          n.body.type === "DoExpression")
      ) {
        return group(concat([concat(parts), " ", body]));
      }

      // We handle sequence expressions as the body of arrows specially,
      // so that the required parentheses end up on their own lines.
      if (n.body.type === "SequenceExpression") {
        return group(
          concat([
            concat(parts),
            group(
              concat([" (", indent(concat([softline, body])), softline, ")"])
            )
          ])
        );
      }

      // if the arrow function is expanded as last argument, we are adding a
      // level of indentation and need to add a softline to align the closing )
      // with the opening (, or if it's inside a JSXExpression (e.g. an attribute)
      // we should align the expression's closing } with the line with the opening {.
      const shouldAddSoftLine =
        ((args && args.expandLastArg) ||
          path.getParentNode().type === "JSXExpressionContainer") &&
        !(n.comments && n.comments.length);

      const printTrailingComma =
        args && args.expandLastArg && shouldPrintComma(options, "all");

      // In order to avoid confusion between
      // a => a ? a : a
      // a <= a ? a : a
      const shouldAddParens =
        n.body.type === "ConditionalExpression" &&
        !startsWithNoLookaheadToken(n.body, /* forbidFunctionAndClass */ false);

      return group(
        concat([
          concat(parts),
          group(
            concat([
              indent(
                concat([
                  line,
                  shouldAddParens ? ifBreak("", "(") : "",
                  body,
                  shouldAddParens ? ifBreak("", ")") : ""
                ])
              ),
              shouldAddSoftLine
                ? concat([ifBreak(printTrailingComma ? "," : ""), softline])
                : ""
            ])
          )
        ])
      );
    }
    case "MethodDefinition":
    case "TSAbstractMethodDefinition":
      if (n.accessibility) {
        parts.push(n.accessibility + " ");
      }
      if (n.static) {
        parts.push("static ");
      }
      if (n.type === "TSAbstractMethodDefinition") {
        parts.push("abstract ");
      }

      parts.push(printMethod(path, options, print));

      return concat(parts);
    case "YieldExpression":
      parts.push("yield");

      if (n.delegate) {
        parts.push("*");
      }
      if (n.argument) {
        parts.push(" ", path.call(print, "argument"));
      }

      return concat(parts);
    case "AwaitExpression":
      return concat(["await ", path.call(print, "argument")]);
    case "ImportSpecifier":
      if (n.importKind) {
        parts.push(path.call(print, "importKind"), " ");
      }

      parts.push(path.call(print, "imported"));

      if (n.local && n.local.name !== n.imported.name) {
        parts.push(" as ", path.call(print, "local"));
      }

      return concat(parts);
    case "ExportSpecifier":
      parts.push(path.call(print, "local"));

      if (n.exported && n.exported.name !== n.local.name) {
        parts.push(" as ", path.call(print, "exported"));
      }

      return concat(parts);
    case "ImportNamespaceSpecifier":
      parts.push("* as ");

      if (n.local) {
        parts.push(path.call(print, "local"));
      } else if (n.id) {
        parts.push(path.call(print, "id"));
      }

      return concat(parts);
    case "ImportDefaultSpecifier":
      if (n.local) {
        return path.call(print, "local");
      }

      return path.call(print, "id");
    case "TSExportAssignment":
      return concat(["export = ", path.call(print, "expression"), semi]);
    case "ExportDefaultDeclaration":
    case "ExportNamedDeclaration":
      return printExportDeclaration(path, options, print);
    case "ExportAllDeclaration":
      parts.push("export ");

      if (n.exportKind === "type") {
        parts.push("type ");
      }

      parts.push("* from ", path.call(print, "source"), semi);

      return concat(parts);

    case "ExportNamespaceSpecifier":
    case "ExportDefaultSpecifier":
      return path.call(print, "exported");
    case "ImportDeclaration": {
      parts.push("import ");

      if (n.importKind && n.importKind !== "value") {
        parts.push(n.importKind + " ");
      }

      const standalones = [];
      const grouped = [];
      if (n.specifiers && n.specifiers.length > 0) {
        path.each(specifierPath => {
          const value = specifierPath.getValue();
          if (
            value.type === "ImportDefaultSpecifier" ||
            value.type === "ImportNamespaceSpecifier"
          ) {
            standalones.push(print(specifierPath));
          } else {
            grouped.push(print(specifierPath));
          }
        }, "specifiers");

        if (standalones.length > 0) {
          parts.push(join(", ", standalones));
        }

        if (standalones.length > 0 && grouped.length > 0) {
          parts.push(", ");
        }

        if (
          grouped.length === 1 &&
          standalones.length === 0 &&
          n.specifiers &&
          !n.specifiers.some(node => node.comments)
        ) {
          parts.push(
            concat([
              "{",
              options.bracketSpacing ? " " : "",
              concat(grouped),
              options.bracketSpacing ? " " : "",
              "}"
            ])
          );
        } else if (grouped.length >= 1) {
          parts.push(
            group(
              concat([
                "{",
                indent(
                  concat([
                    options.bracketSpacing ? line : softline,
                    join(concat([",", line]), grouped)
                  ])
                ),
                ifBreak(shouldPrintComma(options) ? "," : ""),
                options.bracketSpacing ? line : softline,
                "}"
              ])
            )
          );
        }

        parts.push(" from ");
      } else if (
        (n.importKind && n.importKind === "type") ||
        // import {} from 'x'
        /{\s*}/.test(
          options.originalText.slice(
            options.locStart(n),
            options.locStart(n.source)
          )
        )
      ) {
        parts.push("{} from ");
      }

      parts.push(path.call(print, "source"), semi);

      return concat(parts);
    }

    case "Import":
      return "import";
    case "BlockStatement": {
      const naked = path.call(bodyPath => {
        return printStatementSequence(bodyPath, options, print);
      }, "body");

      const hasContent = n.body.find(node => node.type !== "EmptyStatement");
      const hasDirectives = n.directives && n.directives.length > 0;

      const parent = path.getParentNode();
      const parentParent = path.getParentNode(1);
      if (
        !hasContent &&
        !hasDirectives &&
        !hasDanglingComments(n) &&
        (parent.type === "ArrowFunctionExpression" ||
          parent.type === "FunctionExpression" ||
          parent.type === "FunctionDeclaration" ||
          parent.type === "ObjectMethod" ||
          parent.type === "ClassMethod" ||
          parent.type === "ForStatement" ||
          parent.type === "WhileStatement" ||
          parent.type === "DoWhileStatement" ||
          parent.type === "DoExpression" ||
          (parent.type === "CatchClause" && !parentParent.finalizer))
      ) {
        return "{}";
      }

      parts.push("{");

      // Babel 6
      if (hasDirectives) {
        path.each(childPath => {
          parts.push(indent(concat([hardline, print(childPath), semi])));
          if (
            isNextLineEmpty(options.originalText, childPath.getValue(), options)
          ) {
            parts.push(hardline);
          }
        }, "directives");
      }

      if (hasContent) {
        parts.push(indent(concat([hardline, naked])));
      }

      parts.push(comments.printDanglingComments(path, options));
      parts.push(hardline, "}");

      return concat(parts);
    }
    case "ReturnStatement":
      parts.push("return");

      if (n.argument) {
        if (returnArgumentHasLeadingComment(options, n.argument)) {
          parts.push(
            concat([
              " (",
              indent(concat([hardline, path.call(print, "argument")])),
              hardline,
              ")"
            ])
          );
        } else if (
          n.argument.type === "LogicalExpression" ||
          n.argument.type === "BinaryExpression" ||
          n.argument.type === "SequenceExpression"
        ) {
          parts.push(
            group(
              concat([
                ifBreak(" (", " "),
                indent(concat([softline, path.call(print, "argument")])),
                softline,
                ifBreak(")")
              ])
            )
          );
        } else {
          parts.push(" ", path.call(print, "argument"));
        }
      }

      if (hasDanglingComments(n)) {
        parts.push(
          " ",
          comments.printDanglingComments(path, options, /* sameIndent */ true)
        );
      }

      parts.push(semi);

      return concat(parts);
    case "NewExpression":
    case "OptionalCallExpression":
    case "CallExpression": {
      const isNew = n.type === "NewExpression";

      const optional = printOptionalToken(path);
      if (
        // We want to keep CommonJS- and AMD-style require calls, and AMD-style
        // define calls, as a unit.
        // e.g. `define(["some/lib", (lib) => {`
        (!isNew &&
          n.callee.type === "Identifier" &&
          (n.callee.name === "require" || n.callee.name === "define")) ||
        n.callee.type === "Import" ||
        // Template literals as single arguments
        (n.arguments.length === 1 &&
          isTemplateOnItsOwnLine(
            n.arguments[0],
            options.originalText,
            options
          )) ||
        // Keep test declarations on a single line
        // e.g. `it('long name', () => {`
        (!isNew && isTestCall(n, path.getParentNode()))
      ) {
        return concat([
          isNew ? "new " : "",
          path.call(print, "callee"),
          optional,
          printFunctionTypeParameters(path, options, print),
          concat(["(", join(", ", path.map(print, "arguments")), ")"])
        ]);
      }

      // We detect calls on member lookups and possibly print them in a
      // special chain format. See `printMemberChain` for more info.
      if (!isNew && isMemberish(n.callee)) {
        return printMemberChain(path, options, print);
      }

      return concat([
        isNew ? "new " : "",
        path.call(print, "callee"),
        optional,
        printFunctionTypeParameters(path, options, print),
        printArgumentsList(path, options, print)
      ]);
    }
    case "TSInterfaceDeclaration":
      if (isNodeStartingWithDeclare(n, options)) {
        parts.push("declare ");
      }

      parts.push(
        n.abstract ? "abstract " : "",
        printTypeScriptModifiers(path, options, print),
        "interface ",
        path.call(print, "id"),
        n.typeParameters ? path.call(print, "typeParameters") : "",
        " "
      );

      if (n.heritage.length) {
        parts.push(
          group(
            indent(
              concat([
                softline,
                "extends ",
                indent(join(concat([",", line]), path.map(print, "heritage"))),
                " "
              ])
            )
          )
        );
      }

      parts.push(path.call(print, "body"));

      return concat(parts);

    case "ObjectTypeInternalSlot":
      return concat([
        n.static ? "static " : "",
        "[[",
        path.call(print, "id"),
        "]]",
        printOptionalToken(path),
        n.method ? "" : ": ",
        path.call(print, "value")
      ]);

    case "ObjectExpression":
    case "ObjectPattern":
    case "ObjectTypeAnnotation":
    case "TSInterfaceBody":
    case "TSTypeLiteral": {
      const isTypeAnnotation = n.type === "ObjectTypeAnnotation";
      const parent = path.getParentNode(0);
      const shouldBreak =
        n.type === "TSInterfaceBody" ||
        (n.type === "ObjectPattern" &&
          parent.type !== "FunctionDeclaration" &&
          parent.type !== "FunctionExpression" &&
          parent.type !== "ArrowFunctionExpression" &&
          parent.type !== "AssignmentPattern" &&
          parent.type !== "CatchClause" &&
          n.properties.some(
            property =>
              property.value &&
              (property.value.type === "ObjectPattern" ||
                property.value.type === "ArrayPattern")
          )) ||
        (n.type !== "ObjectPattern" &&
          hasNewlineInRange(
            options.originalText,
            options.locStart(n),
            options.locEnd(n)
          ));
      const isFlowInterfaceLikeBody =
        isTypeAnnotation &&
        parent &&
        (parent.type === "InterfaceDeclaration" ||
          parent.type === "DeclareInterface" ||
          parent.type === "DeclareClass") &&
        path.getName() === "body";
      const separator = isFlowInterfaceLikeBody
        ? ";"
        : n.type === "TSInterfaceBody" || n.type === "TSTypeLiteral"
          ? ifBreak(semi, ";")
          : ",";
      const fields = [];
      const leftBrace = n.exact ? "{|" : "{";
      const rightBrace = n.exact ? "|}" : "}";

      let propertiesField;

      if (n.type === "TSTypeLiteral") {
        propertiesField = "members";
      } else if (n.type === "TSInterfaceBody") {
        propertiesField = "body";
      } else {
        propertiesField = "properties";
      }

      if (isTypeAnnotation) {
        fields.push("indexers", "callProperties", "internalSlots");
      }
      fields.push(propertiesField);

      // Unfortunately, things are grouped together in the ast can be
      // interleaved in the source code. So we need to reorder them before
      // printing them.
      const propsAndLoc = [];
      fields.forEach(field => {
        path.each(childPath => {
          const node = childPath.getValue();
          propsAndLoc.push({
            node: node,
            printed: print(childPath),
            loc: options.locStart(node)
          });
        }, field);
      });

      let separatorParts = [];
      const props = propsAndLoc.sort((a, b) => a.loc - b.loc).map(prop => {
        const result = concat(separatorParts.concat(group(prop.printed)));
        separatorParts = [separator, line];
        if (
          prop.node.type === "TSPropertySignature" &&
          hasNodeIgnoreComment(prop.node)
        ) {
          separatorParts.shift();
        }
        if (isNextLineEmpty(options.originalText, prop.node, options)) {
          separatorParts.push(hardline);
        }
        return result;
      });

      const lastElem = getLast(n[propertiesField]);

      const canHaveTrailingSeparator = !(
        lastElem &&
        (lastElem.type === "RestProperty" ||
          lastElem.type === "RestElement" ||
          hasNodeIgnoreComment(lastElem))
      );

      let content;
      if (props.length === 0 && !n.typeAnnotation) {
        if (!hasDanglingComments(n)) {
          return concat([leftBrace, rightBrace]);
        }

        content = group(
          concat([
            leftBrace,
            comments.printDanglingComments(path, options),
            softline,
            rightBrace,
            printOptionalToken(path)
          ])
        );
      } else {
        content = concat([
          leftBrace,
          indent(
            concat([options.bracketSpacing ? line : softline, concat(props)])
          ),
          ifBreak(
            canHaveTrailingSeparator &&
            (separator !== "," || shouldPrintComma(options))
              ? separator
              : ""
          ),
          concat([options.bracketSpacing ? line : softline, rightBrace]),
          printOptionalToken(path),
          printTypeAnnotation(path, options, print)
        ]);
      }

      // If we inline the object as first argument of the parent, we don't want
      // to create another group so that the object breaks before the return
      // type
      const parentParentParent = path.getParentNode(2);
      if (
        (n.type === "ObjectPattern" &&
          parent &&
          shouldHugArguments(parent) &&
          parent.params[0] === n) ||
        (shouldHugType(n) &&
          parentParentParent &&
          shouldHugArguments(parentParentParent) &&
          parentParentParent.params[0].typeAnnotation &&
          parentParentParent.params[0].typeAnnotation.typeAnnotation === n)
      ) {
        return content;
      }

      return group(content, { shouldBreak });
    }
    // Babel 6
    case "ObjectProperty": // Non-standard AST node type.
    case "Property":
      if (n.method || n.kind === "get" || n.kind === "set") {
        return printMethod(path, options, print);
      }

      if (n.shorthand) {
        parts.push(path.call(print, "value"));
      } else {
        let printedLeft;
        if (n.computed) {
          printedLeft = concat(["[", path.call(print, "key"), "]"]);
        } else {
          printedLeft = printPropertyKey(path, options, print);
        }
        parts.push(
          printAssignment(
            n.key,
            printedLeft,
            ":",
            n.value,
            path.call(print, "value"),
            options
          )
        );
      }

      return concat(parts); // Babel 6
    case "ClassMethod":
      if (n.static) {
        parts.push("static ");
      }

      parts = parts.concat(printObjectMethod(path, options, print));

      return concat(parts); // Babel 6
    case "ObjectMethod":
      return printObjectMethod(path, options, print);
    case "Decorator":
      return concat([
        "@",
        path.call(print, "expression"),
        path.call(print, "callee")
      ]);
    case "ArrayExpression":
    case "ArrayPattern":
      if (n.elements.length === 0) {
        if (!hasDanglingComments(n)) {
          parts.push("[]");
        } else {
          parts.push(
            group(
              concat([
                "[",
                comments.printDanglingComments(path, options),
                softline,
                "]"
              ])
            )
          );
        }
      } else {
        const lastElem = getLast(n.elements);
        const canHaveTrailingComma = !(
          lastElem && lastElem.type === "RestElement"
        );

        // JavaScript allows you to have empty elements in an array which
        // changes its length based on the number of commas. The algorithm
        // is that if the last argument is null, we need to force insert
        // a comma to ensure JavaScript recognizes it.
        //   [,].length === 1
        //   [1,].length === 1
        //   [1,,].length === 2
        //
        // Note that getLast returns null if the array is empty, but
        // we already check for an empty array just above so we are safe
        const needsForcedTrailingComma =
          canHaveTrailingComma && lastElem === null;

        parts.push(
          group(
            concat([
              "[",
              indent(
                concat([
                  softline,
                  printArrayItems(path, options, "elements", print)
                ])
              ),
              needsForcedTrailingComma ? "," : "",
              ifBreak(
                canHaveTrailingComma &&
                !needsForcedTrailingComma &&
                shouldPrintComma(options)
                  ? ","
                  : ""
              ),
              comments.printDanglingComments(
                path,
                options,
                /* sameIndent */ true
              ),
              softline,
              "]"
            ])
          )
        );
      }

      parts.push(
        printOptionalToken(path),
        printTypeAnnotation(path, options, print)
      );

      return concat(parts);
    case "SequenceExpression": {
      const parent = path.getParentNode(0);
      if (
        parent.type === "ExpressionStatement" ||
        parent.type === "ForStatement"
      ) {
        // For ExpressionStatements and for-loop heads, which are among
        // the few places a SequenceExpression appears unparenthesized, we want
        // to indent expressions after the first.
        const parts = [];
        path.each(p => {
          if (p.getName() === 0) {
            parts.push(print(p));
          } else {
            parts.push(",", indent(concat([line, print(p)])));
          }
        }, "expressions");
        return group(concat(parts));
      }
      return group(
        concat([join(concat([",", line]), path.map(print, "expressions"))])
      );
    }
    case "ThisExpression":
      return "this";
    case "Super":
      return "super";
    case "NullLiteral": // Babel 6 Literal split
      return "null";
    case "RegExpLiteral": // Babel 6 Literal split
      return printRegex(n);
    case "NumericLiteral": // Babel 6 Literal split
      return printNumber(n.extra.raw);
    case "BigIntLiteral":
      return concat([printNumber(n.extra.rawValue), "n"]);
    case "BooleanLiteral": // Babel 6 Literal split
    case "StringLiteral": // Babel 6 Literal split
    case "Literal": {
      if (n.regex) {
        return printRegex(n.regex);
      }
      if (typeof n.value === "number") {
        return printNumber(n.raw);
      }
      if (typeof n.value !== "string") {
        return "" + n.value;
      }
      // TypeScript workaround for eslint/typescript-eslint-parser#267
      // See corresponding workaround in needs-parens.js
      const grandParent = path.getParentNode(1);
      const isTypeScriptDirective =
        options.parser === "typescript" &&
        typeof n.value === "string" &&
        grandParent &&
        (grandParent.type === "Program" ||
          grandParent.type === "BlockStatement");

      return nodeStr(n, options, isTypeScriptDirective);
    }
    case "Directive":
      return path.call(print, "value"); // Babel 6
    case "DirectiveLiteral":
      return nodeStr(n, options);
    case "UnaryExpression":
      parts.push(n.operator);

      if (/[a-z]$/.test(n.operator)) {
        parts.push(" ");
      }

      parts.push(path.call(print, "argument"));

      return concat(parts);
    case "UpdateExpression":
      parts.push(path.call(print, "argument"), n.operator);

      if (n.prefix) {
        parts.reverse();
      }

      return concat(parts);
    case "ConditionalExpression":
      return formatTernaryOperator(path, options, print, {
        beforeParts: () => [path.call(print, "test")],
        afterParts: breakClosingParen => [breakClosingParen ? softline : ""]
      });
    case "VariableDeclaration": {
      const printed = path.map(childPath => {
        return print(childPath);
      }, "declarations");

      // We generally want to terminate all variable declarations with a
      // semicolon, except when they in the () part of for loops.
      const parentNode = path.getParentNode();

      const isParentForLoop =
        parentNode.type === "ForStatement" ||
        parentNode.type === "ForInStatement" ||
        parentNode.type === "ForOfStatement" ||
        parentNode.type === "ForAwaitStatement";

      const hasValue = n.declarations.some(decl => decl.init);

      let firstVariable;
      if (printed.length === 1) {
        firstVariable = printed[0];
      } else if (printed.length > 1) {
        // Indent first var to comply with eslint one-var rule
        firstVariable = indent(printed[0]);
      }

      parts = [
        isNodeStartingWithDeclare(n, options) ? "declare " : "",
        n.kind,
        firstVariable ? concat([" ", firstVariable]) : "",
        indent(
          concat(
            printed
              .slice(1)
              .map(p =>
                concat([",", hasValue && !isParentForLoop ? hardline : line, p])
              )
          )
        )
      ];

      if (!(isParentForLoop && parentNode.body !== n)) {
        parts.push(semi);
      }

      return group(concat(parts));
    }
    case "VariableDeclarator":
      return printAssignment(
        n.id,
        concat([path.call(print, "id"), path.call(print, "typeParameters")]),
        " =",
        n.init,
        n.init && path.call(print, "init"),
        options
      );
    case "WithStatement":
      return group(
        concat([
          "with (",
          path.call(print, "object"),
          ")",
          adjustClause(n.body, path.call(print, "body"))
        ])
      );
    case "IfStatement": {
      const con = adjustClause(n.consequent, path.call(print, "consequent"));
      const opening = group(
        concat([
          "if (",
          group(
            concat([
              indent(concat([softline, path.call(print, "test")])),
              softline
            ])
          ),
          ")",
          con
        ])
      );

      parts.push(opening);

      if (n.alternate) {
        const commentOnOwnLine =
          (hasTrailingComment(n.consequent) &&
            n.consequent.comments.some(
              comment =>
                comment.trailing && !handleComments.isBlockComment(comment)
            )) ||
          needsHardlineAfterDanglingComment(n);
        const elseOnSameLine =
          n.consequent.type === "BlockStatement" && !commentOnOwnLine;
        parts.push(elseOnSameLine ? " " : hardline);

        if (hasDanglingComments(n)) {
          parts.push(
            comments.printDanglingComments(path, options, true),
            commentOnOwnLine ? hardline : " "
          );
        }

        parts.push(
          "else",
          group(
            adjustClause(
              n.alternate,
              path.call(print, "alternate"),
              n.alternate.type === "IfStatement"
            )
          )
        );
      }

      return concat(parts);
    }
    case "ForStatement": {
      const body = adjustClause(n.body, path.call(print, "body"));

      // We want to keep dangling comments above the loop to stay consistent.
      // Any comment positioned between the for statement and the parentheses
      // is going to be printed before the statement.
      const dangling = comments.printDanglingComments(
        path,
        options,
        /* sameLine */ true
      );
      const printedComments = dangling ? concat([dangling, softline]) : "";

      if (!n.init && !n.test && !n.update) {
        return concat([printedComments, group(concat(["for (;;)", body]))]);
      }

      return concat([
        printedComments,
        group(
          concat([
            "for (",
            group(
              concat([
                indent(
                  concat([
                    softline,
                    path.call(print, "init"),
                    ";",
                    line,
                    path.call(print, "test"),
                    ";",
                    line,
                    path.call(print, "update")
                  ])
                ),
                softline
              ])
            ),
            ")",
            body
          ])
        )
      ]);
    }
    case "WhileStatement":
      return group(
        concat([
          "while (",
          group(
            concat([
              indent(concat([softline, path.call(print, "test")])),
              softline
            ])
          ),
          ")",
          adjustClause(n.body, path.call(print, "body"))
        ])
      );
    case "ForInStatement":
      // Note: esprima can't actually parse "for each (".
      return group(
        concat([
          n.each ? "for each (" : "for (",
          path.call(print, "left"),
          " in ",
          path.call(print, "right"),
          ")",
          adjustClause(n.body, path.call(print, "body"))
        ])
      );

    case "ForOfStatement":
    case "ForAwaitStatement": {
      // Babylon 7 removed ForAwaitStatement in favor of ForOfStatement
      // with `"await": true`:
      // https://github.com/estree/estree/pull/138
      const isAwait = n.type === "ForAwaitStatement" || n.await;

      return group(
        concat([
          "for",
          isAwait ? " await" : "",
          " (",
          path.call(print, "left"),
          " of ",
          path.call(print, "right"),
          ")",
          adjustClause(n.body, path.call(print, "body"))
        ])
      );
    }

    case "DoWhileStatement": {
      const clause = adjustClause(n.body, path.call(print, "body"));
      const doBody = group(concat(["do", clause]));
      parts = [doBody];

      if (n.body.type === "BlockStatement") {
        parts.push(" ");
      } else {
        parts.push(hardline);
      }
      parts.push("while (");

      parts.push(
        group(
          concat([
            indent(concat([softline, path.call(print, "test")])),
            softline
          ])
        ),
        ")",
        semi
      );

      return concat(parts);
    }
    case "DoExpression":
      return concat(["do ", path.call(print, "body")]);
    case "BreakStatement":
      parts.push("break");

      if (n.label) {
        parts.push(" ", path.call(print, "label"));
      }

      parts.push(semi);

      return concat(parts);
    case "ContinueStatement":
      parts.push("continue");

      if (n.label) {
        parts.push(" ", path.call(print, "label"));
      }

      parts.push(semi);

      return concat(parts);
    case "LabeledStatement":
      if (n.body.type === "EmptyStatement") {
        return concat([path.call(print, "label"), ":;"]);
      }

      return concat([
        path.call(print, "label"),
        ": ",
        path.call(print, "body")
      ]);
    case "TryStatement":
      return concat([
        "try ",
        path.call(print, "block"),
        n.handler ? concat([" ", path.call(print, "handler")]) : "",
        n.finalizer ? concat([" finally ", path.call(print, "finalizer")]) : ""
      ]);
    case "CatchClause":
      return concat([
        "catch ",
        n.param ? concat(["(", path.call(print, "param"), ") "]) : "",
        path.call(print, "body")
      ]);
    case "ThrowStatement":
      return concat(["throw ", path.call(print, "argument"), semi]);
    // Note: ignoring n.lexical because it has no printing consequences.
    case "SwitchStatement":
      return concat([
        group(
          concat([
            "switch (",
            indent(concat([softline, path.call(print, "discriminant")])),
            softline,
            ")"
          ])
        ),
        " {",
        n.cases.length > 0
          ? indent(
              concat([
                hardline,
                join(
                  hardline,
                  path.map(casePath => {
                    const caseNode = casePath.getValue();
                    return concat([
                      casePath.call(print),
                      n.cases.indexOf(caseNode) !== n.cases.length - 1 &&
                      isNextLineEmpty(options.originalText, caseNode, options)
                        ? hardline
                        : ""
                    ]);
                  }, "cases")
                )
              ])
            )
          : "",
        hardline,
        "}"
      ]);
    case "SwitchCase": {
      if (n.test) {
        parts.push("case ", path.call(print, "test"), ":");
      } else {
        parts.push("default:");
      }

      const consequent = n.consequent.filter(
        node => node.type !== "EmptyStatement"
      );

      if (consequent.length > 0) {
        const cons = path.call(consequentPath => {
          return printStatementSequence(consequentPath, options, print);
        }, "consequent");

        parts.push(
          consequent.length === 1 && consequent[0].type === "BlockStatement"
            ? concat([" ", cons])
            : indent(concat([hardline, cons]))
        );
      }

      return concat(parts);
    }
    // JSX extensions below.
    case "DebuggerStatement":
      return concat(["debugger", semi]);
    case "JSXAttribute":
      parts.push(path.call(print, "name"));

      if (n.value) {
        let res;
        if (isStringLiteral(n.value)) {
          const value = rawText(n.value);
          res = '"' + value.slice(1, -1).replace(/"/g, "&quot;") + '"';
        } else {
          res = path.call(print, "value");
        }
        parts.push("=", res);
      }

      return concat(parts);
    case "JSXIdentifier":
      // Can be removed when this is fixed:
      // https://github.com/eslint/typescript-eslint-parser/issues/337
      if (!n.name) {
        return "this";
      }
      return "" + n.name;
    case "JSXNamespacedName":
      return join(":", [
        path.call(print, "namespace"),
        path.call(print, "name")
      ]);
    case "JSXMemberExpression":
      return join(".", [
        path.call(print, "object"),
        path.call(print, "property")
      ]);
    case "TSQualifiedName":
      return join(".", [path.call(print, "left"), path.call(print, "right")]);
    case "JSXSpreadAttribute":
    case "JSXSpreadChild": {
      return concat([
        "{",
        path.call(p => {
          const printed = concat(["...", print(p)]);
          const n = p.getValue();
          if (!n.comments || !n.comments.length) {
            return printed;
          }
          return concat([
            indent(
              concat([
                softline,
                comments.printComments(p, () => printed, options)
              ])
            ),
            softline
          ]);
        }, n.type === "JSXSpreadAttribute" ? "argument" : "expression"),
        "}"
      ]);
    }
    case "JSXExpressionContainer": {
      const parent = path.getParentNode(0);

      const preventInline =
        parent.type === "JSXAttribute" &&
        n.expression.comments &&
        n.expression.comments.length > 0;

      const shouldInline =
        !preventInline &&
        (n.expression.type === "ArrayExpression" ||
          n.expression.type === "ObjectExpression" ||
          n.expression.type === "ArrowFunctionExpression" ||
          n.expression.type === "CallExpression" ||
          n.expression.type === "OptionalCallExpression" ||
          n.expression.type === "FunctionExpression" ||
          n.expression.type === "JSXEmptyExpression" ||
          n.expression.type === "TemplateLiteral" ||
          n.expression.type === "TaggedTemplateExpression" ||
          n.expression.type === "DoExpression" ||
          (isJSXNode(parent) &&
            (n.expression.type === "ConditionalExpression" ||
              isBinaryish(n.expression))));

      if (shouldInline) {
        return group(
          concat(["{", path.call(print, "expression"), lineSuffixBoundary, "}"])
        );
      }

      return group(
        concat([
          "{",
          indent(concat([softline, path.call(print, "expression")])),
          softline,
          lineSuffixBoundary,
          "}"
        ])
      );
    }
    case "JSXFragment":
    case "TSJsxFragment":
    case "JSXElement": {
      const elem = comments.printComments(
        path,
        () => printJSXElement(path, options, print),
        options
      );
      return maybeWrapJSXElementInParens(path, elem);
    }
    case "JSXOpeningElement": {
      const n = path.getValue();

      const nameHasComments =
        n.name && n.name.comments && n.name.comments.length > 0;

      // Don't break self-closing elements with no attributes and no comments
      if (n.selfClosing && !n.attributes.length && !nameHasComments) {
        return concat([
          "<",
          path.call(print, "name"),
          path.call(print, "typeParameters"),
          " />"
        ]);
      }

      // don't break up opening elements with a single long text attribute
      if (
        n.attributes &&
        n.attributes.length === 1 &&
        n.attributes[0].value &&
        isStringLiteral(n.attributes[0].value) &&
        !n.attributes[0].value.value.includes("\n") &&
        // We should break for the following cases:
        // <div
        //   // comment
        //   attr="value"
        // >
        // <div
        //   attr="value"
        //   // comment
        // >
        !nameHasComments &&
        (!n.attributes[0].comments || !n.attributes[0].comments.length)
      ) {
        return group(
          concat([
            "<",
            path.call(print, "name"),
            path.call(print, "typeParameters"),
            " ",
            concat(path.map(print, "attributes")),
            n.selfClosing ? " />" : ">"
          ])
        );
      }

      const lastAttrHasTrailingComments =
        n.attributes.length && hasTrailingComment(getLast(n.attributes));

      const bracketSameLine =
        // Simple tags (no attributes and no comment in tag name) should be
        // kept unbroken regardless of `jsxBracketSameLine`
        (!n.attributes.length && !nameHasComments) ||
        (options.jsxBracketSameLine &&
          // We should print the bracket in a new line for the following cases:
          // <div
          //   // comment
          // >
          // <div
          //   attr // comment
          // >
          (!nameHasComments || n.attributes.length) &&
          !lastAttrHasTrailingComments);

      // We should print the opening element expanded if any prop value is a
      // string literal with newlines
      const shouldBreak =
        n.attributes &&
        n.attributes.some(
          attr =>
            attr.value &&
            isStringLiteral(attr.value) &&
            attr.value.value.includes("\n")
        );

      return group(
        concat([
          "<",
          path.call(print, "name"),
          path.call(print, "typeParameters"),
          concat([
            indent(
              concat(
                path.map(attr => concat([line, print(attr)]), "attributes")
              )
            ),
            n.selfClosing ? line : bracketSameLine ? ">" : softline
          ]),
          n.selfClosing ? "/>" : bracketSameLine ? "" : ">"
        ]),
        { shouldBreak }
      );
    }
    case "JSXClosingElement":
      return concat(["</", path.call(print, "name"), ">"]);
    case "JSXOpeningFragment":
    case "JSXClosingFragment":
    case "TSJsxOpeningFragment":
    case "TSJsxClosingFragment": {
      const hasComment = n.comments && n.comments.length;
      const hasOwnLineComment =
        hasComment && !n.comments.every(handleComments.isBlockComment);
      const isOpeningFragment =
        n.type === "JSXOpeningFragment" || n.type === "TSJsxOpeningFragment";
      return concat([
        isOpeningFragment ? "<" : "</",
        indent(
          concat([
            hasOwnLineComment
              ? hardline
              : hasComment && !isOpeningFragment
                ? " "
                : "",
            comments.printDanglingComments(path, options, true)
          ])
        ),
        hasOwnLineComment ? hardline : "",
        ">"
      ]);
    }
    case "JSXText":
      /* istanbul ignore next */
      throw new Error("JSXTest should be handled by JSXElement");
    case "JSXEmptyExpression": {
      const requiresHardline =
        n.comments && !n.comments.every(handleComments.isBlockComment);

      return concat([
        comments.printDanglingComments(
          path,
          options,
          /* sameIndent */ !requiresHardline
        ),
        requiresHardline ? hardline : ""
      ]);
    }
    case "ClassBody":
      if (!n.comments && n.body.length === 0) {
        return "{}";
      }

      return concat([
        "{",
        n.body.length > 0
          ? indent(
              concat([
                hardline,
                path.call(bodyPath => {
                  return printStatementSequence(bodyPath, options, print);
                }, "body")
              ])
            )
          : comments.printDanglingComments(path, options),
        hardline,
        "}"
      ]);
    case "ClassProperty":
    case "TSAbstractClassProperty":
    case "ClassPrivateProperty": {
      if (n.accessibility) {
        parts.push(n.accessibility + " ");
      }
      if (n.static) {
        parts.push("static ");
      }
      if (n.type === "TSAbstractClassProperty") {
        parts.push("abstract ");
      }
      if (n.readonly) {
        parts.push("readonly ");
      }
      const variance = getFlowVariance(n);
      if (variance) {
        parts.push(variance);
      }
      if (n.computed) {
        parts.push("[", path.call(print, "key"), "]");
      } else {
        parts.push(printPropertyKey(path, options, print));
      }
      parts.push(printOptionalToken(path));
      parts.push(printTypeAnnotation(path, options, print));
      if (n.value) {
        parts.push(
          " =",
          printAssignmentRight(
            n.key,
            n.value,
            path.call(print, "value"),
            options
          )
        );
      }

      parts.push(semi);

      return group(concat(parts));
    }
    case "ClassDeclaration":
    case "ClassExpression":
    case "TSAbstractClassDeclaration":
      if (isNodeStartingWithDeclare(n, options)) {
        parts.push("declare ");
      }
      parts.push(concat(printClass(path, options, print)));
      return concat(parts);
    case "TSInterfaceHeritage":
      parts.push(path.call(print, "id"));

      if (n.typeParameters) {
        parts.push(path.call(print, "typeParameters"));
      }

      return concat(parts);
    case "TemplateElement":
      return join(literalline, n.value.raw.split(/\r?\n/g));
    case "TemplateLiteral": {
      const expressions = path.map(print, "expressions");
      const parentNode = path.getParentNode();

      /**
       * describe.each`table`(name, fn)
       * describe.only.each`table`(name, fn)
       * describe.skip.each`table`(name, fn)
       * test.each`table`(name, fn)
       * test.only.each`table`(name, fn)
       * test.skip.each`table`(name, fn)
       *
       * Ref: https://github.com/facebook/jest/pull/6102
       */
      const jestEachTriggerRegex = /^[xf]?(describe|it|test)$/;
      if (
        parentNode.type === "TaggedTemplateExpression" &&
        parentNode.quasi === n &&
        parentNode.tag.type === "MemberExpression" &&
        parentNode.tag.property.type === "Identifier" &&
        parentNode.tag.property.name === "each" &&
        ((parentNode.tag.object.type === "Identifier" &&
          jestEachTriggerRegex.test(parentNode.tag.object.name)) ||
          (parentNode.tag.object.type === "MemberExpression" &&
            parentNode.tag.object.property.type === "Identifier" &&
            (parentNode.tag.object.property.name === "only" ||
              parentNode.tag.object.property.name === "skip") &&
            parentNode.tag.object.object.type === "Identifier" &&
            jestEachTriggerRegex.test(parentNode.tag.object.object.name)))
      ) {
        /**
         * a    | b    | expected
         * ${1} | ${1} | ${2}
         * ${1} | ${2} | ${3}
         * ${2} | ${1} | ${3}
         */
        const headerNames = n.quasis[0].value.raw.trim().split(/\s*\|\s*/);
        if (
          headerNames.length > 1 ||
          headerNames.some(headerName => headerName.length !== 0)
        ) {
          const stringifiedExpressions = expressions.map(
            doc =>
              "${" +
              printDocToString(
                doc,
                Object.assign({}, options, { printWidth: Infinity })
              ).formatted +
              "}"
          );

          const tableBody = [{ hasLineBreak: false, cells: [] }];
          for (let i = 1; i < n.quasis.length; i++) {
            const row = tableBody[tableBody.length - 1];
            const correspondingExpression = stringifiedExpressions[i - 1];

            row.cells.push(correspondingExpression);
            if (correspondingExpression.indexOf("\n") !== -1) {
              row.hasLineBreak = true;
            }

            if (n.quasis[i].value.raw.indexOf("\n") !== -1) {
              tableBody.push({ hasLineBreak: false, cells: [] });
            }
          }

          const maxColumnCount = tableBody.reduce(
            (maxColumnCount, row) => Math.max(maxColumnCount, row.cells.length),
            headerNames.length
          );

          const maxColumnWidths = Array.from(
            new Array(maxColumnCount),
            () => 0
          );
          const table = [{ cells: headerNames }].concat(
            tableBody.filter(row => row.cells.length !== 0)
          );
          table.filter(row => !row.hasLineBreak).forEach(row => {
            row.cells.forEach((cell, index) => {
              maxColumnWidths[index] = Math.max(
                maxColumnWidths[index],
                getStringWidth(cell)
              );
            });
          });

          parts.push(
            "`",
            indent(
              concat([
                hardline,
                join(
                  hardline,
                  table.map(row =>
                    join(
                      " | ",
                      row.cells.map(
                        (cell, index) =>
                          row.hasLineBreak
                            ? cell
                            : cell +
                              " ".repeat(
                                maxColumnWidths[index] - getStringWidth(cell)
                              )
                      )
                    )
                  )
                )
              ])
            ),
            hardline,
            "`"
          );
          return concat(parts);
        }
      }

      parts.push("`");

      path.each(childPath => {
        const i = childPath.getName();

        parts.push(print(childPath));

        if (i < expressions.length) {
          // For a template literal of the following form:
          //   `someQuery {
          //     ${call({
          //       a,
          //       b,
          //     })}
          //   }`
          // the expression is on its own line (there is a \n in the previous
          // quasi literal), therefore we want to indent the JavaScript
          // expression inside at the beginning of ${ instead of the beginning
          // of the `.
          const tabWidth = options.tabWidth;
          const indentSize = getIndentSize(
            childPath.getValue().value.raw,
            tabWidth
          );

          let printed = expressions[i];

          if (
            (n.expressions[i].comments && n.expressions[i].comments.length) ||
            n.expressions[i].type === "MemberExpression" ||
            n.expressions[i].type === "OptionalMemberExpression" ||
            n.expressions[i].type === "ConditionalExpression"
          ) {
            printed = concat([indent(concat([softline, printed])), softline]);
          }

          const aligned = addAlignmentToDoc(printed, indentSize, tabWidth);

          parts.push(group(concat(["${", aligned, lineSuffixBoundary, "}"])));
        }
      }, "quasis");

      parts.push("`");

      return concat(parts);
    }
    // These types are unprintable because they serve as abstract
    // supertypes for other (printable) types.
    case "TaggedTemplateExpression":
      return concat([
        path.call(print, "tag"),
        path.call(print, "typeParameters"),
        path.call(print, "quasi")
      ]);
    case "Node":
    case "Printable":
    case "SourceLocation":
    case "Position":
    case "Statement":
    case "Function":
    case "Pattern":
    case "Expression":
    case "Declaration":
    case "Specifier":
    case "NamedSpecifier":
    case "Comment":
    case "MemberTypeAnnotation": // Flow
    case "Type":
      /* istanbul ignore next */
      throw new Error("unprintable type: " + JSON.stringify(n.type));
    // Type Annotations for Facebook Flow, typically stripped out or
    // transformed away before printing.
    case "TypeAnnotation":
    case "TSTypeAnnotation":
      if (n.typeAnnotation) {
        return path.call(print, "typeAnnotation");
      }

      /* istanbul ignore next */
      return "";
    case "TSTupleType":
    case "TupleTypeAnnotation": {
      const typesField = n.type === "TSTupleType" ? "elementTypes" : "types";
      return group(
        concat([
          "[",
          indent(
            concat([
              softline,
              printArrayItems(path, options, typesField, print)
            ])
          ),
          // TypeScript doesn't support trailing commas in tuple types
          n.type === "TSTupleType"
            ? ""
            : ifBreak(shouldPrintComma(options) ? "," : ""),
          comments.printDanglingComments(path, options, /* sameIndent */ true),
          softline,
          "]"
        ])
      );
    }

    case "ExistsTypeAnnotation":
      return "*";
    case "EmptyTypeAnnotation":
      return "empty";
    case "AnyTypeAnnotation":
      return "any";
    case "MixedTypeAnnotation":
      return "mixed";
    case "ArrayTypeAnnotation":
      return concat([path.call(print, "elementType"), "[]"]);
    case "BooleanTypeAnnotation":
      return "boolean";
    case "BooleanLiteralTypeAnnotation":
      return "" + n.value;
    case "DeclareClass":
      return printFlowDeclaration(path, printClass(path, options, print));
    case "DeclareFunction":
      // For TypeScript the DeclareFunction node shares the AST
      // structure with FunctionDeclaration
      if (n.params) {
        return concat([
          "declare ",
          printFunctionDeclaration(path, print, options),
          semi
        ]);
      }
      return printFlowDeclaration(path, [
        "function ",
        path.call(print, "id"),
        n.predicate ? " " : "",
        path.call(print, "predicate"),
        semi
      ]);
    case "DeclareModule":
      return printFlowDeclaration(path, [
        "module ",
        path.call(print, "id"),
        " ",
        path.call(print, "body")
      ]);
    case "DeclareModuleExports":
      return printFlowDeclaration(path, [
        "module.exports",
        ": ",
        path.call(print, "typeAnnotation"),
        semi
      ]);
    case "DeclareVariable":
      return printFlowDeclaration(path, ["var ", path.call(print, "id"), semi]);
    case "DeclareExportAllDeclaration":
      return concat(["declare export * from ", path.call(print, "source")]);
    case "DeclareExportDeclaration":
      return concat(["declare ", printExportDeclaration(path, options, print)]);
    case "DeclareOpaqueType":
    case "OpaqueType": {
      parts.push(
        "opaque type ",
        path.call(print, "id"),
        path.call(print, "typeParameters")
      );

      if (n.supertype) {
        parts.push(": ", path.call(print, "supertype"));
      }

      if (n.impltype) {
        parts.push(" = ", path.call(print, "impltype"));
      }

      parts.push(semi);

      if (n.type === "DeclareOpaqueType") {
        return printFlowDeclaration(path, parts);
      }

      return concat(parts);
    }

    case "FunctionTypeAnnotation":
    case "TSFunctionType": {
      // FunctionTypeAnnotation is ambiguous:
      // declare function foo(a: B): void; OR
      // var A: (a: B) => void;
      const parent = path.getParentNode(0);
      const parentParent = path.getParentNode(1);
      const parentParentParent = path.getParentNode(2);
      let isArrowFunctionTypeAnnotation =
        n.type === "TSFunctionType" ||
        !(
          ((parent.type === "ObjectTypeProperty" ||
            parent.type === "ObjectTypeInternalSlot") &&
            !getFlowVariance(parent) &&
            !parent.optional &&
            options.locStart(parent) === options.locStart(n)) ||
          parent.type === "ObjectTypeCallProperty" ||
          (parentParentParent && parentParentParent.type === "DeclareFunction")
        );

      let needsColon =
        isArrowFunctionTypeAnnotation &&
        (parent.type === "TypeAnnotation" ||
          parent.type === "TSTypeAnnotation");

      // Sadly we can't put it inside of FastPath::needsColon because we are
      // printing ":" as part of the expression and it would put parenthesis
      // around :(
      const needsParens =
        needsColon &&
        isArrowFunctionTypeAnnotation &&
        (parent.type === "TypeAnnotation" ||
          parent.type === "TSTypeAnnotation") &&
        parentParent.type === "ArrowFunctionExpression";

      if (isObjectTypePropertyAFunction(parent, options)) {
        isArrowFunctionTypeAnnotation = true;
        needsColon = true;
      }

      if (needsParens) {
        parts.push("(");
      }

      parts.push(
        printFunctionParams(
          path,
          print,
          options,
          /* expandArg */ false,
          /* printTypeParams */ true
        )
      );

      // The returnType is not wrapped in a TypeAnnotation, so the colon
      // needs to be added separately.
      if (n.returnType || n.predicate || n.typeAnnotation) {
        parts.push(
          isArrowFunctionTypeAnnotation ? " => " : ": ",
          path.call(print, "returnType"),
          path.call(print, "predicate"),
          path.call(print, "typeAnnotation")
        );
      }
      if (needsParens) {
        parts.push(")");
      }

      return group(concat(parts));
    }
    case "TSRestType":
      return concat(["...", path.call(print, "typeAnnotation")]);
    case "TSOptionalType":
      return concat([path.call(print, "typeAnnotation"), "?"]);
    case "FunctionTypeParam":
      return concat([
        path.call(print, "name"),
        printOptionalToken(path),
        n.name ? ": " : "",
        path.call(print, "typeAnnotation")
      ]);
    case "GenericTypeAnnotation":
      return concat([
        path.call(print, "id"),
        path.call(print, "typeParameters")
      ]);

    case "DeclareInterface":
    case "InterfaceDeclaration":
    case "InterfaceTypeAnnotation": {
      if (
        n.type === "DeclareInterface" ||
        isNodeStartingWithDeclare(n, options)
      ) {
        parts.push("declare ");
      }

      parts.push("interface");

      if (n.type === "DeclareInterface" || n.type === "InterfaceDeclaration") {
        parts.push(
          " ",
          path.call(print, "id"),
          path.call(print, "typeParameters")
        );
      }

      if (n["extends"].length > 0) {
        parts.push(
          group(
            indent(
              concat([line, "extends ", join(", ", path.map(print, "extends"))])
            )
          )
        );
      }

      parts.push(" ", path.call(print, "body"));

      return group(concat(parts));
    }
    case "ClassImplements":
    case "InterfaceExtends":
      return concat([
        path.call(print, "id"),
        path.call(print, "typeParameters")
      ]);
    case "TSIntersectionType":
    case "IntersectionTypeAnnotation": {
      const types = path.map(print, "types");
      const result = [];
      let wasIndented = false;
      for (let i = 0; i < types.length; ++i) {
        if (i === 0) {
          result.push(types[i]);
        } else if (isObjectType(n.types[i - 1]) && isObjectType(n.types[i])) {
          // If both are objects, don't indent
          result.push(
            concat([" & ", wasIndented ? indent(types[i]) : types[i]])
          );
        } else if (!isObjectType(n.types[i - 1]) && !isObjectType(n.types[i])) {
          // If no object is involved, go to the next line if it breaks
          result.push(indent(concat([" &", line, types[i]])));
        } else {
          // If you go from object to non-object or vis-versa, then inline it
          if (i > 1) {
            wasIndented = true;
          }
          result.push(" & ", i > 1 ? indent(types[i]) : types[i]);
        }
      }
      return group(concat(result));
    }
    case "TSUnionType":
    case "UnionTypeAnnotation": {
      // single-line variation
      // A | B | C

      // multi-line variation
      // | A
      // | B
      // | C

      const parent = path.getParentNode();
      const parentParent = path.getParentNode(1);

      // If there's a leading comment, the parent is doing the indentation
      const shouldIndent =
        parent.type !== "TypeParameterInstantiation" &&
        parent.type !== "TSTypeParameterInstantiation" &&
        parent.type !== "GenericTypeAnnotation" &&
        parent.type !== "TSTypeReference" &&
        !(parent.type === "FunctionTypeParam" && !parent.name) &&
        parentParent.type !== "TSTypeAssertionExpression" &&
        !(
          (parent.type === "TypeAlias" ||
            parent.type === "VariableDeclarator") &&
          hasLeadingOwnLineComment(options.originalText, n, options)
        );

      // {
      //   a: string
      // } | null | void
      // should be inlined and not be printed in the multi-line variant
      const shouldHug = shouldHugType(n);

      // We want to align the children but without its comment, so it looks like
      // | child1
      // // comment
      // | child2
      const printed = path.map(typePath => {
        let printedType = typePath.call(print);
        if (!shouldHug) {
          printedType = align(2, printedType);
        }
        return comments.printComments(typePath, () => printedType, options);
      }, "types");

      if (shouldHug) {
        return join(" | ", printed);
      }

      const code = concat([
        ifBreak(concat([shouldIndent ? line : "", "| "])),
        join(concat([line, "| "]), printed)
      ]);

      let hasParens;

      if (n.type === "TSUnionType") {
        const greatGrandParent = path.getParentNode(2);
        const greatGreatGrandParent = path.getParentNode(3);

        hasParens =
          greatGrandParent &&
          greatGrandParent.type === "TSParenthesizedType" &&
          greatGreatGrandParent &&
          (greatGreatGrandParent.type === "TSUnionType" ||
            greatGreatGrandParent.type === "TSIntersectionType");
      } else {
        hasParens = pathNeedsParens(path, options);
      }

      if (hasParens) {
        return group(concat([indent(code), softline]));
      }

      return group(shouldIndent ? indent(code) : code);
    }
    case "NullableTypeAnnotation":
      return concat(["?", path.call(print, "typeAnnotation")]);
    case "TSNullKeyword":
    case "NullLiteralTypeAnnotation":
      return "null";
    case "ThisTypeAnnotation":
      return "this";
    case "NumberTypeAnnotation":
      return "number";
    case "ObjectTypeCallProperty":
      if (n.static) {
        parts.push("static ");
      }

      parts.push(path.call(print, "value"));

      return concat(parts);
    case "ObjectTypeIndexer": {
      const variance = getFlowVariance(n);
      return concat([
        variance || "",
        "[",
        path.call(print, "id"),
        n.id ? ": " : "",
        path.call(print, "key"),
        "]: ",
        path.call(print, "value")
      ]);
    }
    case "ObjectTypeProperty": {
      const variance = getFlowVariance(n);

      let modifier = "";

      if (n.proto) {
        modifier = "proto ";
      } else if (n.static) {
        modifier = "static ";
      }

      return concat([
        modifier,
        isGetterOrSetter(n) ? n.kind + " " : "",
        variance || "",
        printPropertyKey(path, options, print),
        printOptionalToken(path),
        isFunctionNotation(n, options) ? "" : ": ",
        path.call(print, "value")
      ]);
    }
    case "QualifiedTypeIdentifier":
      return concat([
        path.call(print, "qualification"),
        ".",
        path.call(print, "id")
      ]);
    case "StringLiteralTypeAnnotation":
      return nodeStr(n, options);
    case "NumberLiteralTypeAnnotation":
      assert.strictEqual(typeof n.value, "number");

      if (n.extra != null) {
        return printNumber(n.extra.raw);
      }
      return printNumber(n.raw);

    case "StringTypeAnnotation":
      return "string";
    case "DeclareTypeAlias":
    case "TypeAlias": {
      if (
        n.type === "DeclareTypeAlias" ||
        isNodeStartingWithDeclare(n, options)
      ) {
        parts.push("declare ");
      }

      const printed = printAssignmentRight(
        n.id,
        n.right,
        path.call(print, "right"),
        options
      );

      parts.push(
        "type ",
        path.call(print, "id"),
        path.call(print, "typeParameters"),
        " =",
        printed,
        semi
      );

      return group(concat(parts));
    }
    case "TypeCastExpression":
      return concat([
        "(",
        path.call(print, "expression"),
        ": ",
        path.call(print, "typeAnnotation"),
        ")"
      ]);
    case "TypeParameterDeclaration":
    case "TypeParameterInstantiation":
    case "TSTypeParameterDeclaration":
    case "TSTypeParameterInstantiation":
      return printTypeParameters(path, options, print, "params");

    case "TSTypeParameter":
    case "TypeParameter": {
      const parent = path.getParentNode();
      if (parent.type === "TSMappedType") {
        parts.push("[", path.call(print, "name"));
        if (n.constraint) {
          parts.push(" in ", path.call(print, "constraint"));
        }
        parts.push("]");
        return concat(parts);
      }

      const variance = getFlowVariance(n);

      if (variance) {
        parts.push(variance);
      }

      parts.push(path.call(print, "name"));

      if (n.bound) {
        parts.push(": ");
        parts.push(path.call(print, "bound"));
      }

      if (n.constraint) {
        parts.push(" extends ", path.call(print, "constraint"));
      }

      if (n["default"]) {
        parts.push(" = ", path.call(print, "default"));
      }

      return concat(parts);
    }
    case "TypeofTypeAnnotation":
      return concat(["typeof ", path.call(print, "argument")]);
    case "VoidTypeAnnotation":
      return "void";
    case "InferredPredicate":
      return "%checks";
    // Unhandled types below. If encountered, nodes of these types should
    // be either left alone or desugared into AST types that are fully
    // supported by the pretty-printer.
    case "DeclaredPredicate":
      return concat(["%checks(", path.call(print, "value"), ")"]);
    case "TSAbstractKeyword":
      return "abstract";
    case "TSAnyKeyword":
      return "any";
    case "TSAsyncKeyword":
      return "async";
    case "TSBooleanKeyword":
      return "boolean";
    case "TSConstKeyword":
      return "const";
    case "TSDeclareKeyword":
      return "declare";
    case "TSExportKeyword":
      return "export";
    case "TSNeverKeyword":
      return "never";
    case "TSNumberKeyword":
      return "number";
    case "TSObjectKeyword":
      return "object";
    case "TSProtectedKeyword":
      return "protected";
    case "TSPrivateKeyword":
      return "private";
    case "TSPublicKeyword":
      return "public";
    case "TSReadonlyKeyword":
      return "readonly";
    case "TSSymbolKeyword":
      return "symbol";
    case "TSStaticKeyword":
      return "static";
    case "TSStringKeyword":
      return "string";
    case "TSUndefinedKeyword":
      return "undefined";
    case "TSUnknownKeyword":
      return "unknown";
    case "TSVoidKeyword":
      return "void";
    case "TSAsExpression":
      return concat([
        path.call(print, "expression"),
        " as ",
        path.call(print, "typeAnnotation")
      ]);
    case "TSArrayType":
      return concat([path.call(print, "elementType"), "[]"]);
    case "TSPropertySignature": {
      if (n.export) {
        parts.push("export ");
      }
      if (n.accessibility) {
        parts.push(n.accessibility + " ");
      }
      if (n.static) {
        parts.push("static ");
      }
      if (n.readonly) {
        parts.push("readonly ");
      }
      if (n.computed) {
        parts.push("[");
      }

      parts.push(printPropertyKey(path, options, print));

      if (n.computed) {
        parts.push("]");
      }

      parts.push(printOptionalToken(path));

      if (n.typeAnnotation) {
        parts.push(": ");
        parts.push(path.call(print, "typeAnnotation"));
      }

      // This isn't valid semantically, but it's in the AST so we can print it.
      if (n.initializer) {
        parts.push(" = ", path.call(print, "initializer"));
      }

      return concat(parts);
    }
    case "TSParameterProperty":
      if (n.accessibility) {
        parts.push(n.accessibility + " ");
      }
      if (n.export) {
        parts.push("export ");
      }
      if (n.static) {
        parts.push("static ");
      }
      if (n.readonly) {
        parts.push("readonly ");
      }

      parts.push(path.call(print, "parameter"));

      return concat(parts);
    case "TSTypeReference":
      return concat([
        path.call(print, "typeName"),
        printTypeParameters(path, options, print, "typeParameters")
      ]);
    case "TSTypeQuery":
      return concat(["typeof ", path.call(print, "exprName")]);
    case "TSParenthesizedType": {
      return path.call(print, "typeAnnotation");
    }
    case "TSIndexSignature": {
      const parent = path.getParentNode();

      return concat([
        n.export ? "export " : "",
        n.accessibility ? concat([n.accessibility, " "]) : "",
        n.static ? "static " : "",
        n.readonly ? "readonly " : "",
        "[",
        path.call(print, "index"),
        "]: ",
        path.call(print, "typeAnnotation"),
        parent.type === "ClassBody" ? semi : ""
      ]);
    }
    case "TSTypePredicate":
      return concat([
        path.call(print, "parameterName"),
        " is ",
        path.call(print, "typeAnnotation")
      ]);
    case "TSNonNullExpression":
      return concat([path.call(print, "expression"), "!"]);
    case "TSThisType":
      return "this";
    case "TSImportType":
      return concat([
        !n.isTypeOf ? "" : "typeof ",
        "import(",
        path.call(print, "parameter"),
        ")",
        !n.qualifier ? "" : concat([".", path.call(print, "qualifier")]),
        printTypeParameters(path, options, print, "typeParameters")
      ]);
    case "TSLiteralType":
      return path.call(print, "literal");
    case "TSIndexedAccessType":
      return concat([
        path.call(print, "objectType"),
        "[",
        path.call(print, "indexType"),
        "]"
      ]);
    case "TSConstructSignature":
    case "TSConstructorType":
    case "TSCallSignature": {
      if (n.type !== "TSCallSignature") {
        parts.push("new ");
      }

      parts.push(
        group(
          printFunctionParams(
            path,
            print,
            options,
            /* expandArg */ false,
            /* printTypeParams */ true
          )
        )
      );

      if (n.typeAnnotation) {
        const isType = n.type === "TSConstructorType";
        parts.push(isType ? " => " : ": ", path.call(print, "typeAnnotation"));
      }
      return concat(parts);
    }
    case "TSTypeOperator":
      return concat([n.operator, " ", path.call(print, "typeAnnotation")]);
    case "TSMappedType":
      return group(
        concat([
          "{",
          indent(
            concat([
              options.bracketSpacing ? line : softline,
              n.readonlyToken
                ? concat([
                    getTypeScriptMappedTypeModifier(
                      n.readonlyToken,
                      "readonly"
                    ),
                    " "
                  ])
                : "",
              printTypeScriptModifiers(path, options, print),
              path.call(print, "typeParameter"),
              n.questionToken
                ? getTypeScriptMappedTypeModifier(n.questionToken, "?")
                : "",
              ": ",
              path.call(print, "typeAnnotation")
            ])
          ),
          comments.printDanglingComments(path, options, /* sameIndent */ true),
          options.bracketSpacing ? line : softline,
          "}"
        ])
      );
    case "TSMethodSignature":
      parts.push(
        n.accessibility ? concat([n.accessibility, " "]) : "",
        n.export ? "export " : "",
        n.static ? "static " : "",
        n.readonly ? "readonly " : "",
        n.computed ? "[" : "",
        path.call(print, "key"),
        n.computed ? "]" : "",
        printOptionalToken(path),
        printFunctionParams(
          path,
          print,
          options,
          /* expandArg */ false,
          /* printTypeParams */ true
        )
      );

      if (n.typeAnnotation) {
        parts.push(": ", path.call(print, "typeAnnotation"));
      }
      return group(concat(parts));
    case "TSNamespaceExportDeclaration":
      parts.push("export as namespace ", path.call(print, "name"));

      if (options.semi) {
        parts.push(";");
      }

      return group(concat(parts));
    case "TSEnumDeclaration":
      if (isNodeStartingWithDeclare(n, options)) {
        parts.push("declare ");
      }

      if (n.modifiers) {
        parts.push(printTypeScriptModifiers(path, options, print));
      }
      if (n.const) {
        parts.push("const ");
      }

      parts.push("enum ", path.call(print, "id"), " ");

      if (n.members.length === 0) {
        parts.push(
          group(
            concat([
              "{",
              comments.printDanglingComments(path, options),
              softline,
              "}"
            ])
          )
        );
      } else {
        parts.push(
          group(
            concat([
              "{",
              indent(
                concat([
                  hardline,
                  printArrayItems(path, options, "members", print),
                  shouldPrintComma(options, "es5") ? "," : ""
                ])
              ),
              comments.printDanglingComments(
                path,
                options,
                /* sameIndent */ true
              ),
              hardline,
              "}"
            ])
          )
        );
      }

      return concat(parts);
    case "TSEnumMember":
      parts.push(path.call(print, "id"));
      if (n.initializer) {
        parts.push(" = ", path.call(print, "initializer"));
      }
      return concat(parts);
    case "TSImportEqualsDeclaration":
      parts.push(
        printTypeScriptModifiers(path, options, print),
        "import ",
        path.call(print, "name"),
        " = ",
        path.call(print, "moduleReference")
      );

      if (options.semi) {
        parts.push(";");
      }

      return group(concat(parts));
    case "TSExternalModuleReference":
      return concat(["require(", path.call(print, "expression"), ")"]);
    case "TSModuleDeclaration": {
      const parent = path.getParentNode();
      const isExternalModule = isLiteral(n.id);
      const parentIsDeclaration = parent.type === "TSModuleDeclaration";
      const bodyIsDeclaration = n.body && n.body.type === "TSModuleDeclaration";

      if (parentIsDeclaration) {
        parts.push(".");
      } else {
        if (n.declare === true) {
          parts.push("declare ");
        }
        parts.push(printTypeScriptModifiers(path, options, print));

        // Global declaration looks like this:
        // (declare)? global { ... }
        const isGlobalDeclaration =
          n.id.type === "Identifier" &&
          n.id.name === "global" &&
          !/namespace|module/.test(
            options.originalText.slice(
              options.locStart(n),
              options.locStart(n.id)
            )
          );

        if (!isGlobalDeclaration) {
          parts.push(isExternalModule ? "module " : "namespace ");
        }
      }

      parts.push(path.call(print, "id"));

      if (bodyIsDeclaration) {
        parts.push(path.call(print, "body"));
      } else if (n.body) {
        parts.push(
          " {",
          indent(
            concat([
              line,
              path.call(
                bodyPath =>
                  comments.printDanglingComments(bodyPath, options, true),
                "body"
              ),
              group(path.call(print, "body"))
            ])
          ),
          line,
          "}"
        );
      } else {
        parts.push(semi);
      }

      return concat(parts);
    }
    case "TSModuleBlock":
      return path.call(bodyPath => {
        return printStatementSequence(bodyPath, options, print);
      }, "body");

    case "PrivateName":
      return concat(["#", path.call(print, "id")]);

    case "TSConditionalType":
      return formatTernaryOperator(path, options, print, {
        beforeParts: () => [
          path.call(print, "checkType"),
          " ",
          "extends",
          " ",
          path.call(print, "extendsType")
        ],
        shouldCheckJsx: false,
        operatorName: "TSConditionalType",
        consequentNode: "trueType",
        alternateNode: "falseType",
        testNode: "checkType",
        breakNested: false
      });

    case "TSInferType":
      return concat(["infer", " ", path.call(print, "typeParameter")]);

    case "InterpreterDirective":
      parts.push("#!", n.value, hardline);

      if (isNextLineEmpty(options.originalText, n, options)) {
        parts.push(hardline);
      }

      return concat(parts);

    default:
      /* istanbul ignore next */
      throw new Error("unknown type: " + JSON.stringify(n.type));
  }
}

function printStatementSequence(path, options, print) {
  const printed = [];

  const bodyNode = path.getNode();
  const isClass = bodyNode.type === "ClassBody";

  path.map((stmtPath, i) => {
    const stmt = stmtPath.getValue();

    // Just in case the AST has been modified to contain falsy
    // "statements," it's safer simply to skip them.
    /* istanbul ignore if */
    if (!stmt) {
      return;
    }

    // Skip printing EmptyStatement nodes to avoid leaving stray
    // semicolons lying around.
    if (stmt.type === "EmptyStatement") {
      return;
    }

    const stmtPrinted = print(stmtPath);
    const text = options.originalText;
    const parts = [];

    // in no-semi mode, prepend statement with semicolon if it might break ASI
    // don't prepend the only JSX element in a program with semicolon
    if (
      !options.semi &&
      !isClass &&
      !isTheOnlyJSXElementInMarkdown(options, stmtPath) &&
      stmtNeedsASIProtection(stmtPath, options)
    ) {
      if (stmt.comments && stmt.comments.some(comment => comment.leading)) {
        parts.push(print(stmtPath, { needsSemi: true }));
      } else {
        parts.push(";", stmtPrinted);
      }
    } else {
      parts.push(stmtPrinted);
    }

    if (!options.semi && isClass) {
      if (classPropMayCauseASIProblems(stmtPath)) {
        parts.push(";");
      } else if (stmt.type === "ClassProperty") {
        const nextChild = bodyNode.body[i + 1];
        if (classChildNeedsASIProtection(nextChild)) {
          parts.push(";");
        }
      }
    }

    if (isNextLineEmpty(text, stmt, options) && !isLastStatement(stmtPath)) {
      parts.push(hardline);
    }

    printed.push(concat(parts));
  });

  return join(hardline, printed);
}

function printPropertyKey(path, options, print) {
  const node = path.getNode();
  const key = node.key;

  if (
    key.type === "Identifier" &&
    !node.computed &&
    options.parser === "json"
  ) {
    // a -> "a"
    return path.call(
      keyPath =>
        comments.printComments(
          keyPath,
          () => JSON.stringify(key.name),
          options
        ),
      "key"
    );
  }

  if (
    isStringLiteral(key) &&
    isIdentifierName(key.value) &&
    !node.computed &&
    options.parser !== "json" &&
    !(options.parser === "typescript" && node.type === "ClassProperty")
  ) {
    // 'a' -> a
    return path.call(
      keyPath => comments.printComments(keyPath, () => key.value, options),
      "key"
    );
  }
  return path.call(print, "key");
}

function printMethod(path, options, print) {
  const node = path.getNode();
  const semi = options.semi ? ";" : "";
  const kind = node.kind;
  const parts = [];

  if (node.type === "ObjectMethod" || node.type === "ClassMethod") {
    node.value = node;
  }

  if (node.value.async) {
    parts.push("async ");
  }

  if (!kind || kind === "init" || kind === "method" || kind === "constructor") {
    if (node.value.generator) {
      parts.push("*");
    }
  } else {
    assert.ok(kind === "get" || kind === "set");

    parts.push(kind, " ");
  }

  let key = printPropertyKey(path, options, print);

  if (node.computed) {
    key = concat(["[", key, "]"]);
  }

  parts.push(
    key,
    concat(
      path.call(
        valuePath => [
          printFunctionTypeParameters(valuePath, options, print),
          group(
            concat([
              printFunctionParams(valuePath, print, options),
              printReturnType(valuePath, print, options)
            ])
          )
        ],
        "value"
      )
    )
  );

  if (!node.value.body || node.value.body.length === 0) {
    parts.push(semi);
  } else {
    parts.push(" ", path.call(print, "value", "body"));
  }

  return concat(parts);
}

function couldGroupArg(arg) {
  return (
    (arg.type === "ObjectExpression" &&
      (arg.properties.length > 0 || arg.comments)) ||
    (arg.type === "ArrayExpression" &&
      (arg.elements.length > 0 || arg.comments)) ||
    arg.type === "TSTypeAssertionExpression" ||
    arg.type === "TSAsExpression" ||
    arg.type === "FunctionExpression" ||
    (arg.type === "ArrowFunctionExpression" &&
      !arg.returnType &&
      (arg.body.type === "BlockStatement" ||
        arg.body.type === "ArrowFunctionExpression" ||
        arg.body.type === "ObjectExpression" ||
        arg.body.type === "ArrayExpression" ||
        arg.body.type === "CallExpression" ||
        arg.body.type === "OptionalCallExpression" ||
        isJSXNode(arg.body)))
  );
}

function shouldGroupLastArg(args) {
  const lastArg = getLast(args);
  const penultimateArg = getPenultimate(args);
  return (
    !hasLeadingComment(lastArg) &&
    !hasTrailingComment(lastArg) &&
    couldGroupArg(lastArg) &&
    // If the last two arguments are of the same type,
    // disable last element expansion.
    (!penultimateArg || penultimateArg.type !== lastArg.type)
  );
}

function shouldGroupFirstArg(args) {
  if (args.length !== 2) {
    return false;
  }

  const firstArg = args[0];
  const secondArg = args[1];
  return (
    (!firstArg.comments || !firstArg.comments.length) &&
    (firstArg.type === "FunctionExpression" ||
      (firstArg.type === "ArrowFunctionExpression" &&
        firstArg.body.type === "BlockStatement")) &&
    secondArg.type !== "FunctionExpression" &&
    secondArg.type !== "ArrowFunctionExpression" &&
    !couldGroupArg(secondArg)
  );
}

function isSimpleFlowType(node) {
  const flowTypeAnnotations = [
    "AnyTypeAnnotation",
    "NullLiteralTypeAnnotation",
    "GenericTypeAnnotation",
    "ThisTypeAnnotation",
    "NumberTypeAnnotation",
    "VoidTypeAnnotation",
    "EmptyTypeAnnotation",
    "MixedTypeAnnotation",
    "BooleanTypeAnnotation",
    "BooleanLiteralTypeAnnotation",
    "StringTypeAnnotation"
  ];

  return (
    node &&
    flowTypeAnnotations.indexOf(node.type) !== -1 &&
    !(node.type === "GenericTypeAnnotation" && node.typeParameters)
  );
}

const functionCompositionFunctionNames = new Set([
  "pipe", // RxJS, Ramda
  "pipeP", // Ramda
  "pipeK", // Ramda
  "compose", // Ramda, Redux
  "composeFlipped", // Not from any library, but common in Haskell, so supported
  "composeP", // Ramda
  "composeK", // Ramda
  "flow", // Lodash
  "flowRight", // Lodash
  "connect" // Redux
]);

function isFunctionCompositionFunction(node) {
  switch (node.type) {
    case "OptionalMemberExpression":
    case "MemberExpression": {
      return isFunctionCompositionFunction(node.property);
    }
    case "Identifier": {
      return functionCompositionFunctionNames.has(node.name);
    }
    case "StringLiteral":
    case "Literal": {
      return functionCompositionFunctionNames.has(node.value);
    }
  }
}

function printArgumentsList(path, options, print) {
  const node = path.getValue();
  const args = node.arguments;

  if (args.length === 0) {
    return concat([
      "(",
      comments.printDanglingComments(path, options, /* sameIndent */ true),
      ")"
    ]);
  }

  let anyArgEmptyLine = false;
  let hasEmptyLineFollowingFirstArg = false;
  const lastArgIndex = args.length - 1;
  const printedArguments = path.map((argPath, index) => {
    const arg = argPath.getNode();
    const parts = [print(argPath)];

    if (index === lastArgIndex) {
      // do nothing
    } else if (isNextLineEmpty(options.originalText, arg, options)) {
      if (index === 0) {
        hasEmptyLineFollowingFirstArg = true;
      }

      anyArgEmptyLine = true;
      parts.push(",", hardline, hardline);
    } else {
      parts.push(",", line);
    }

    return concat(parts);
  }, "arguments");

  const maybeTrailingComma = shouldPrintComma(options, "all") ? "," : "";

  function allArgsBrokenOut() {
    return group(
      concat([
        "(",
        indent(concat([line, concat(printedArguments)])),
        maybeTrailingComma,
        line,
        ")"
      ]),
      { shouldBreak: true }
    );
  }

  // We want to get
  //    pipe(
  //      x => x + 1,
  //      x => x - 1
  //    )
  // here, but not
  //    process.stdout.pipe(socket)
  if (isFunctionCompositionFunction(node.callee) && args.length > 1) {
    return allArgsBrokenOut();
  }

  const shouldGroupFirst = shouldGroupFirstArg(args);
  const shouldGroupLast = shouldGroupLastArg(args);
  if (shouldGroupFirst || shouldGroupLast) {
    const shouldBreak =
      (shouldGroupFirst
        ? printedArguments.slice(1).some(willBreak)
        : printedArguments.slice(0, -1).some(willBreak)) || anyArgEmptyLine;

    // We want to print the last argument with a special flag
    let printedExpanded;
    let i = 0;
    path.each(argPath => {
      if (shouldGroupFirst && i === 0) {
        printedExpanded = [
          concat([
            argPath.call(p => print(p, { expandFirstArg: true })),
            printedArguments.length > 1 ? "," : "",
            hasEmptyLineFollowingFirstArg ? hardline : line,
            hasEmptyLineFollowingFirstArg ? hardline : ""
          ])
        ].concat(printedArguments.slice(1));
      }
      if (shouldGroupLast && i === args.length - 1) {
        printedExpanded = printedArguments
          .slice(0, -1)
          .concat(argPath.call(p => print(p, { expandLastArg: true })));
      }
      i++;
    }, "arguments");

    const somePrintedArgumentsWillBreak = printedArguments.some(willBreak);

    return concat([
      somePrintedArgumentsWillBreak ? breakParent : "",
      conditionalGroup(
        [
          concat([
            ifBreak(
              indent(concat(["(", softline, concat(printedExpanded)])),
              concat(["(", concat(printedExpanded)])
            ),
            somePrintedArgumentsWillBreak
              ? concat([ifBreak(maybeTrailingComma), softline])
              : "",
            ")"
          ]),
          shouldGroupFirst
            ? concat([
                "(",
                group(printedExpanded[0], { shouldBreak: true }),
                concat(printedExpanded.slice(1)),
                ")"
              ])
            : concat([
                "(",
                concat(printedArguments.slice(0, -1)),
                group(getLast(printedExpanded), {
                  shouldBreak: true
                }),
                ")"
              ]),
          allArgsBrokenOut()
        ],
        { shouldBreak }
      )
    ]);
  }

  return group(
    concat([
      "(",
      indent(concat([softline, concat(printedArguments)])),
      ifBreak(shouldPrintComma(options, "all") ? "," : ""),
      softline,
      ")"
    ]),
    { shouldBreak: printedArguments.some(willBreak) || anyArgEmptyLine }
  );
}

function printTypeAnnotation(path, options, print) {
  const node = path.getValue();
  if (!node.typeAnnotation) {
    return "";
  }

  const parentNode = path.getParentNode();
  const isDefinite =
    node.definite ||
    (parentNode &&
      parentNode.type === "VariableDeclarator" &&
      parentNode.definite);

  const isFunctionDeclarationIdentifier =
    parentNode.type === "DeclareFunction" && parentNode.id === node;

  if (
    isFlowAnnotationComment(options.originalText, node.typeAnnotation, options)
  ) {
    return concat([" /*: ", path.call(print, "typeAnnotation"), " */"]);
  }

  return concat([
    isFunctionDeclarationIdentifier ? "" : isDefinite ? "!: " : ": ",
    path.call(print, "typeAnnotation")
  ]);
}

function printFunctionTypeParameters(path, options, print) {
  const fun = path.getValue();
  if (fun.typeArguments) {
    return path.call(print, "typeArguments");
  }
  if (fun.typeParameters) {
    return path.call(print, "typeParameters");
  }
  return "";
}

function printFunctionParams(path, print, options, expandArg, printTypeParams) {
  const fun = path.getValue();
  const paramsField = fun.parameters ? "parameters" : "params";

  const typeParams = printTypeParams
    ? printFunctionTypeParameters(path, options, print)
    : "";

  let printed = [];
  if (fun[paramsField]) {
    printed = path.map(print, paramsField);
  }

  if (fun.rest) {
    printed.push(concat(["...", path.call(print, "rest")]));
  }

  if (printed.length === 0) {
    return concat([
      typeParams,
      "(",
      comments.printDanglingComments(
        path,
        options,
        /* sameIndent */ true,
        comment =>
          getNextNonSpaceNonCommentCharacter(
            options.originalText,
            comment,
            options.locEnd
          ) === ")"
      ),
      ")"
    ]);
  }

  const lastParam = getLast(fun[paramsField]);

  // If the parent is a call with the first/last argument expansion and this is the
  // params of the first/last argument, we dont want the arguments to break and instead
  // want the whole expression to be on a new line.
  //
  // Good:                 Bad:
  //   verylongcall(         verylongcall((
  //     (a, b) => {           a,
  //     }                     b,
  //   })                    ) => {
  //                         })
  if (
    expandArg &&
    !(fun[paramsField] && fun[paramsField].some(n => n.comments))
  ) {
    return group(
      concat([
        removeLines(typeParams),
        "(",
        join(", ", printed.map(removeLines)),
        ")"
      ])
    );
  }

  // Single object destructuring should hug
  //
  // function({
  //   a,
  //   b,
  //   c
  // }) {}
  if (shouldHugArguments(fun)) {
    return concat([typeParams, "(", join(", ", printed), ")"]);
  }

  const parent = path.getParentNode();

  // don't break in specs, eg; `it("should maintain parens around done even when long", (done) => {})`
  if (isTestCall(parent)) {
    return concat([typeParams, "(", join(", ", printed), ")"]);
  }

  const isFlowShorthandWithOneArg =
    (isObjectTypePropertyAFunction(parent, options) ||
      isTypeAnnotationAFunction(parent, options) ||
      parent.type === "TypeAlias" ||
      parent.type === "UnionTypeAnnotation" ||
      parent.type === "TSUnionType" ||
      parent.type === "IntersectionTypeAnnotation" ||
      (parent.type === "FunctionTypeAnnotation" &&
        parent.returnType === fun)) &&
    fun[paramsField].length === 1 &&
    fun[paramsField][0].name === null &&
    fun[paramsField][0].typeAnnotation &&
    fun.typeParameters === null &&
    isSimpleFlowType(fun[paramsField][0].typeAnnotation) &&
    !fun.rest;

  if (isFlowShorthandWithOneArg) {
    if (options.arrowParens === "always") {
      return concat(["(", concat(printed), ")"]);
    }
    return concat(printed);
  }

  const canHaveTrailingComma =
    !(lastParam && lastParam.type === "RestElement") && !fun.rest;

  return concat([
    typeParams,
    "(",
    indent(concat([softline, join(concat([",", line]), printed)])),
    ifBreak(
      canHaveTrailingComma && shouldPrintComma(options, "all") ? "," : ""
    ),
    softline,
    ")"
  ]);
}

function shouldPrintParamsWithoutParens(path, options) {
  if (options.arrowParens === "always") {
    return false;
  }

  if (options.arrowParens === "avoid") {
    const node = path.getValue();
    return canPrintParamsWithoutParens(node);
  }

  // Fallback default; should be unreachable
  return false;
}

function canPrintParamsWithoutParens(node) {
  return (
    node.params.length === 1 &&
    !node.rest &&
    !node.typeParameters &&
    !hasDanglingComments(node) &&
    node.params[0].type === "Identifier" &&
    !node.params[0].typeAnnotation &&
    !node.params[0].comments &&
    !node.params[0].optional &&
    !node.predicate &&
    !node.returnType
  );
}

function printFunctionDeclaration(path, print, options) {
  const n = path.getValue();
  const parts = [];

  if (n.async) {
    parts.push("async ");
  }

  parts.push("function");

  if (n.generator) {
    parts.push("*");
  }
  if (n.id) {
    parts.push(" ", path.call(print, "id"));
  }

  parts.push(
    printFunctionTypeParameters(path, options, print),
    group(
      concat([
        printFunctionParams(path, print, options),
        printReturnType(path, print, options)
      ])
    ),
    n.body ? " " : "",
    path.call(print, "body")
  );

  return concat(parts);
}

function printObjectMethod(path, options, print) {
  const objMethod = path.getValue();
  const parts = [];

  if (objMethod.async) {
    parts.push("async ");
  }
  if (objMethod.generator) {
    parts.push("*");
  }
  if (
    objMethod.method ||
    objMethod.kind === "get" ||
    objMethod.kind === "set"
  ) {
    return printMethod(path, options, print);
  }

  const key = printPropertyKey(path, options, print);

  if (objMethod.computed) {
    parts.push("[", key, "]");
  } else {
    parts.push(key);
  }

  parts.push(
    printFunctionTypeParameters(path, options, print),
    group(
      concat([
        printFunctionParams(path, print, options),
        printReturnType(path, print, options)
      ])
    ),
    " ",
    path.call(print, "body")
  );

  return concat(parts);
}

function printReturnType(path, print, options) {
  const n = path.getValue();
  const returnType = path.call(print, "returnType");

  if (
    n.returnType &&
    isFlowAnnotationComment(options.originalText, n.returnType, options)
  ) {
    return concat([" /*: ", returnType, " */"]);
  }

  const parts = [returnType];

  // prepend colon to TypeScript type annotation
  if (n.returnType && n.returnType.typeAnnotation) {
    parts.unshift(": ");
  }

  if (n.predicate) {
    // The return type will already add the colon, but otherwise we
    // need to do it ourselves
    parts.push(n.returnType ? " " : ": ", path.call(print, "predicate"));
  }

  return concat(parts);
}

function printExportDeclaration(path, options, print) {
  const decl = path.getValue();
  const semi = options.semi ? ";" : "";
  const parts = ["export "];

  const isDefault = decl["default"] || decl.type === "ExportDefaultDeclaration";

  if (isDefault) {
    parts.push("default ");
  }

  parts.push(
    comments.printDanglingComments(path, options, /* sameIndent */ true)
  );

  if (needsHardlineAfterDanglingComment(decl)) {
    parts.push(hardline);
  }

  if (decl.declaration) {
    parts.push(path.call(print, "declaration"));

    if (
      isDefault &&
      (decl.declaration.type !== "ClassDeclaration" &&
        decl.declaration.type !== "FunctionDeclaration" &&
        decl.declaration.type !== "TSAbstractClassDeclaration" &&
        decl.declaration.type !== "TSInterfaceDeclaration" &&
        decl.declaration.type !== "DeclareClass" &&
        decl.declaration.type !== "DeclareFunction")
    ) {
      parts.push(semi);
    }
  } else {
    if (decl.specifiers && decl.specifiers.length > 0) {
      const specifiers = [];
      const defaultSpecifiers = [];
      const namespaceSpecifiers = [];
      path.each(specifierPath => {
        const specifierType = path.getValue().type;
        if (specifierType === "ExportSpecifier") {
          specifiers.push(print(specifierPath));
        } else if (specifierType === "ExportDefaultSpecifier") {
          defaultSpecifiers.push(print(specifierPath));
        } else if (specifierType === "ExportNamespaceSpecifier") {
          namespaceSpecifiers.push(concat(["* as ", print(specifierPath)]));
        }
      }, "specifiers");

      const isNamespaceFollowed =
        namespaceSpecifiers.length !== 0 && specifiers.length !== 0;

      const isDefaultFollowed =
        defaultSpecifiers.length !== 0 &&
        (namespaceSpecifiers.length !== 0 || specifiers.length !== 0);

      parts.push(
        decl.exportKind === "type" ? "type " : "",
        concat(defaultSpecifiers),
        concat([isDefaultFollowed ? ", " : ""]),
        concat(namespaceSpecifiers),
        concat([isNamespaceFollowed ? ", " : ""]),
        specifiers.length !== 0
          ? group(
              concat([
                "{",
                indent(
                  concat([
                    options.bracketSpacing ? line : softline,
                    join(concat([",", line]), specifiers)
                  ])
                ),
                ifBreak(shouldPrintComma(options) ? "," : ""),
                options.bracketSpacing ? line : softline,
                "}"
              ])
            )
          : ""
      );
    } else {
      parts.push("{}");
    }

    if (decl.source) {
      parts.push(" from ", path.call(print, "source"));
    }

    parts.push(semi);
  }

  return concat(parts);
}

function printFlowDeclaration(path, parts) {
  const parentExportDecl = getParentExportDeclaration(path);

  if (parentExportDecl) {
    assert.strictEqual(parentExportDecl.type, "DeclareExportDeclaration");
  } else {
    // If the parent node has type DeclareExportDeclaration, then it
    // will be responsible for printing the "declare" token. Otherwise
    // it needs to be printed with this non-exported declaration node.
    parts.unshift("declare ");
  }

  return concat(parts);
}

function getFlowVariance(path) {
  if (!path.variance) {
    return null;
  }

  // Babylon 7.0 currently uses variance node type, and flow should
  // follow suit soon:
  // https://github.com/babel/babel/issues/4722
  const variance = path.variance.kind || path.variance;

  switch (variance) {
    case "plus":
      return "+";
    case "minus":
      return "-";
    default:
      /* istanbul ignore next */
      return variance;
  }
}

function printTypeScriptModifiers(path, options, print) {
  const n = path.getValue();
  if (!n.modifiers || !n.modifiers.length) {
    return "";
  }
  return concat([join(" ", path.map(print, "modifiers")), " "]);
}

function printTypeParameters(path, options, print, paramsKey) {
  const n = path.getValue();

  if (!n[paramsKey]) {
    return "";
  }

  // for TypeParameterDeclaration typeParameters is a single node
  if (!Array.isArray(n[paramsKey])) {
    return path.call(print, paramsKey);
  }

  const grandparent = path.getNode(2);

  const isParameterInTestCall = grandparent != null && isTestCall(grandparent);

  const shouldInline =
    isParameterInTestCall ||
    n[paramsKey].length === 0 ||
    (n[paramsKey].length === 1 &&
      (shouldHugType(n[paramsKey][0]) ||
        (n[paramsKey][0].type === "GenericTypeAnnotation" &&
          shouldHugType(n[paramsKey][0].id)) ||
        (n[paramsKey][0].type === "TSTypeReference" &&
          shouldHugType(n[paramsKey][0].typeName)) ||
        n[paramsKey][0].type === "NullableTypeAnnotation"));

  if (shouldInline) {
    return concat(["<", join(", ", path.map(print, paramsKey)), ">"]);
  }

  return group(
    concat([
      "<",
      indent(
        concat([
          softline,
          join(concat([",", line]), path.map(print, paramsKey))
        ])
      ),
      ifBreak(
        options.parser !== "typescript" && shouldPrintComma(options, "all")
          ? ","
          : ""
      ),
      softline,
      ">"
    ])
  );
}

function printClass(path, options, print) {
  const n = path.getValue();
  const parts = [];

  if (n.type === "TSAbstractClassDeclaration") {
    parts.push("abstract ");
  }

  parts.push("class");

  if (n.id) {
    parts.push(" ", path.call(print, "id"));
  }

  parts.push(path.call(print, "typeParameters"));

  const partsGroup = [];
  if (n.superClass) {
    const printed = concat([
      "extends ",
      path.call(print, "superClass"),
      path.call(print, "superTypeParameters")
    ]);
    // Keep old behaviour of extends in same line
    // If there is only on extends and there are not comments
    if (
      (!n.implements || n.implements.length === 0) &&
      (!n.superClass.comments || n.superClass.comments.length === 0)
    ) {
      parts.push(
        concat([
          " ",
          path.call(
            superClass =>
              comments.printComments(superClass, () => printed, options),
            "superClass"
          )
        ])
      );
    } else {
      partsGroup.push(
        group(
          concat([
            line,
            path.call(
              superClass =>
                comments.printComments(superClass, () => printed, options),
              "superClass"
            )
          ])
        )
      );
    }
  } else if (n.extends && n.extends.length > 0) {
    parts.push(" extends ", join(", ", path.map(print, "extends")));
  }

  if (n["mixins"] && n["mixins"].length > 0) {
    partsGroup.push(
      line,
      "mixins ",
      group(indent(join(concat([",", line]), path.map(print, "mixins"))))
    );
  }

  if (n["implements"] && n["implements"].length > 0) {
    partsGroup.push(
      line,
      "implements",
      group(
        indent(
          concat([
            line,
            join(concat([",", line]), path.map(print, "implements"))
          ])
        )
      )
    );
  }

  if (partsGroup.length > 0) {
    parts.push(group(indent(concat(partsGroup))));
  }

  if (
    n.body &&
    n.body.comments &&
    hasLeadingOwnLineComment(options.originalText, n.body, options)
  ) {
    parts.push(hardline);
  } else {
    parts.push(" ");
  }
  parts.push(path.call(print, "body"));

  return parts;
}

function printOptionalToken(path) {
  const node = path.getValue();
  if (!node.optional) {
    return "";
  }
  if (
    node.type === "OptionalCallExpression" ||
    (node.type === "OptionalMemberExpression" && node.computed)
  ) {
    return "?.";
  }
  return "?";
}

function printMemberLookup(path, options, print) {
  const property = path.call(print, "property");
  const n = path.getValue();
  const optional = printOptionalToken(path);

  if (!n.computed) {
    return concat([optional, ".", property]);
  }

  if (!n.property || isNumericLiteral(n.property)) {
    return concat([optional, "[", property, "]"]);
  }

  return group(
    concat([optional, "[", indent(concat([softline, property])), softline, "]"])
  );
}

function printBindExpressionCallee(path, options, print) {
  return concat(["::", path.call(print, "callee")]);
}

// We detect calls on member expressions specially to format a
// common pattern better. The pattern we are looking for is this:
//
// arr
//   .map(x => x + 1)
//   .filter(x => x > 10)
//   .some(x => x % 2)
//
// The way it is structured in the AST is via a nested sequence of
// MemberExpression and CallExpression. We need to traverse the AST
// and make groups out of it to print it in the desired way.
function printMemberChain(path, options, print) {
  // The first phase is to linearize the AST by traversing it down.
  //
  //   a().b()
  // has the following AST structure:
  //   CallExpression(MemberExpression(CallExpression(Identifier)))
  // and we transform it into
  //   [Identifier, CallExpression, MemberExpression, CallExpression]
  const printedNodes = [];

  // Here we try to retain one typed empty line after each call expression or
  // the first group whether it is in parentheses or not
  function shouldInsertEmptyLineAfter(node) {
    const originalText = options.originalText;
    const nextCharIndex = getNextNonSpaceNonCommentCharacterIndex(
      originalText,
      node,
      options
    );
    const nextChar = originalText.charAt(nextCharIndex);

    // if it is cut off by a parenthesis, we only account for one typed empty
    // line after that parenthesis
    if (nextChar == ")") {
      return isNextLineEmptyAfterIndex(
        originalText,
        nextCharIndex + 1,
        options
      );
    }

    return isNextLineEmpty(originalText, node, options);
  }

  function rec(path) {
    const node = path.getValue();
    if (
      (node.type === "CallExpression" ||
        node.type === "OptionalCallExpression") &&
      (isMemberish(node.callee) ||
        node.callee.type === "CallExpression" ||
        node.callee.type === "OptionalCallExpression")
    ) {
      printedNodes.unshift({
        node: node,
        printed: concat([
          comments.printComments(
            path,
            () =>
              concat([
                printOptionalToken(path),
                printFunctionTypeParameters(path, options, print),
                printArgumentsList(path, options, print)
              ]),
            options
          ),
          shouldInsertEmptyLineAfter(node) ? hardline : ""
        ])
      });
      path.call(callee => rec(callee), "callee");
    } else if (isMemberish(node)) {
      printedNodes.unshift({
        node: node,
        needsParens: pathNeedsParens(path, options),
        printed: comments.printComments(
          path,
          () =>
            node.type === "OptionalMemberExpression" ||
            node.type === "MemberExpression"
              ? printMemberLookup(path, options, print)
              : printBindExpressionCallee(path, options, print),
          options
        )
      });
      path.call(object => rec(object), "object");
    } else if (node.type === "TSNonNullExpression") {
      printedNodes.unshift({
        node: node,
        printed: comments.printComments(path, () => "!", options)
      });
      path.call(expression => rec(expression), "expression");
    } else {
      printedNodes.unshift({
        node: node,
        printed: path.call(print)
      });
    }
  }
  // Note: the comments of the root node have already been printed, so we
  // need to extract this first call without printing them as they would
  // if handled inside of the recursive call.
  const node = path.getValue();
  printedNodes.unshift({
    node,
    printed: concat([
      printOptionalToken(path),
      printFunctionTypeParameters(path, options, print),
      printArgumentsList(path, options, print)
    ])
  });
  path.call(callee => rec(callee), "callee");

  // Once we have a linear list of printed nodes, we want to create groups out
  // of it.
  //
  //   a().b.c().d().e
  // will be grouped as
  //   [
  //     [Identifier, CallExpression],
  //     [MemberExpression, MemberExpression, CallExpression],
  //     [MemberExpression, CallExpression],
  //     [MemberExpression],
  //   ]
  // so that we can print it as
  //   a()
  //     .b.c()
  //     .d()
  //     .e

  // The first group is the first node followed by
  //   - as many CallExpression as possible
  //       < fn()()() >.something()
  //   - as many array acessors as possible
  //       < fn()[0][1][2] >.something()
  //   - then, as many MemberExpression as possible but the last one
  //       < this.items >.something()
  const groups = [];
  let currentGroup = [printedNodes[0]];
  let i = 1;
  for (; i < printedNodes.length; ++i) {
    if (
      printedNodes[i].node.type === "TSNonNullExpression" ||
      printedNodes[i].node.type === "OptionalCallExpression" ||
      printedNodes[i].node.type === "CallExpression" ||
      ((printedNodes[i].node.type === "MemberExpression" ||
        printedNodes[i].node.type === "OptionalMemberExpression") &&
        printedNodes[i].node.computed &&
        isNumericLiteral(printedNodes[i].node.property))
    ) {
      currentGroup.push(printedNodes[i]);
    } else {
      break;
    }
  }
  if (
    printedNodes[0].node.type !== "CallExpression" &&
    printedNodes[0].node.type !== "OptionalCallExpression"
  ) {
    for (; i + 1 < printedNodes.length; ++i) {
      if (
        isMemberish(printedNodes[i].node) &&
        isMemberish(printedNodes[i + 1].node)
      ) {
        currentGroup.push(printedNodes[i]);
      } else {
        break;
      }
    }
  }
  groups.push(currentGroup);
  currentGroup = [];

  // Then, each following group is a sequence of MemberExpression followed by
  // a sequence of CallExpression. To compute it, we keep adding things to the
  // group until we has seen a CallExpression in the past and reach a
  // MemberExpression
  let hasSeenCallExpression = false;
  for (; i < printedNodes.length; ++i) {
    if (hasSeenCallExpression && isMemberish(printedNodes[i].node)) {
      // [0] should be appended at the end of the group instead of the
      // beginning of the next one
      if (
        printedNodes[i].node.computed &&
        isNumericLiteral(printedNodes[i].node.property)
      ) {
        currentGroup.push(printedNodes[i]);
        continue;
      }

      groups.push(currentGroup);
      currentGroup = [];
      hasSeenCallExpression = false;
    }

    if (
      printedNodes[i].node.type === "CallExpression" ||
      printedNodes[i].node.type === "OptionalCallExpression"
    ) {
      hasSeenCallExpression = true;
    }
    currentGroup.push(printedNodes[i]);

    if (
      printedNodes[i].node.comments &&
      printedNodes[i].node.comments.some(comment => comment.trailing)
    ) {
      groups.push(currentGroup);
      currentGroup = [];
      hasSeenCallExpression = false;
    }
  }
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  // There are cases like Object.keys(), Observable.of(), _.values() where
  // they are the subject of all the chained calls and therefore should
  // be kept on the same line:
  //
  //   Object.keys(items)
  //     .filter(x => x)
  //     .map(x => x)
  //
  // In order to detect those cases, we use an heuristic: if the first
  // node is an identifier with the name starting with a capital
  // letter or just a sequence of _$. The rationale is that they are
  // likely to be factories.
  function isFactory(name) {
    return /^[A-Z]|^[_$]+$/.test(name);
  }

  // In case the Identifier is shorter than tab width, we can keep the
  // first call in a single line, if it's an ExpressionStatement.
  //
  //   d3.scaleLinear()
  //     .domain([0, 100])
  //     .range([0, width]);
  //
  function isShort(name) {
    return name.length <= options.tabWidth;
  }

  function shouldNotWrap(groups) {
    const parent = path.getParentNode();
    const isExpression = parent && parent.type === "ExpressionStatement";
    const hasComputed = groups[1].length && groups[1][0].node.computed;

    if (groups[0].length === 1) {
      const firstNode = groups[0][0].node;
      return (
        firstNode.type === "ThisExpression" ||
        (firstNode.type === "Identifier" &&
          (isFactory(firstNode.name) ||
            (isExpression && isShort(firstNode.name)) ||
            hasComputed))
      );
    }

    const lastNode = getLast(groups[0]).node;
    return (
      (lastNode.type === "MemberExpression" ||
        lastNode.type === "OptionalMemberExpression") &&
      lastNode.property.type === "Identifier" &&
      (isFactory(lastNode.property.name) || hasComputed)
    );
  }

  const shouldMerge =
    groups.length >= 2 && !groups[1][0].node.comments && shouldNotWrap(groups);

  function printGroup(printedGroup) {
    const result = [];
    for (let i = 0; i < printedGroup.length; i++) {
      // Checks if the next node (i.e. the parent node) needs parens
      // and print accordingl y
      if (printedGroup[i + 1] && printedGroup[i + 1].needsParens) {
        result.push(
          "(",
          printedGroup[i].printed,
          printedGroup[i + 1].printed,
          ")"
        );
        i++;
      } else {
        result.push(printedGroup[i].printed);
      }
    }
    return concat(result);
  }

  function printIndentedGroup(groups) {
    if (groups.length === 0) {
      return "";
    }
    return indent(
      group(concat([hardline, join(hardline, groups.map(printGroup))]))
    );
  }

  const printedGroups = groups.map(printGroup);
  const oneLine = concat(printedGroups);

  const cutoff = shouldMerge ? 3 : 2;
  const flatGroups = groups
    .slice(0, cutoff)
    .reduce((res, group) => res.concat(group), []);

  const hasComment =
    flatGroups.slice(1, -1).some(node => hasLeadingComment(node.node)) ||
    flatGroups.slice(0, -1).some(node => hasTrailingComment(node.node)) ||
    (groups[cutoff] && hasLeadingComment(groups[cutoff][0].node));

  // If we only have a single `.`, we shouldn't do anything fancy and just
  // render everything concatenated together.
  if (groups.length <= cutoff && !hasComment) {
    return group(oneLine);
  }

  // Find out the last node in the first group and check if it has an
  // empty line after
  const lastNodeBeforeIndent = getLast(
    shouldMerge ? groups.slice(1, 2)[0] : groups[0]
  ).node;
  const shouldHaveEmptyLineBeforeIndent =
    lastNodeBeforeIndent.type !== "CallExpression" &&
    lastNodeBeforeIndent.type !== "OptionalCallExpression" &&
    shouldInsertEmptyLineAfter(lastNodeBeforeIndent);

  const expanded = concat([
    printGroup(groups[0]),
    shouldMerge ? concat(groups.slice(1, 2).map(printGroup)) : "",
    shouldHaveEmptyLineBeforeIndent ? hardline : "",
    printIndentedGroup(groups.slice(shouldMerge ? 2 : 1))
  ]);

  const callExpressionCount = printedNodes.filter(
    tuple =>
      tuple.node.type === "CallExpression" ||
      tuple.node.type === "OptionalCallExpression"
  ).length;

  // We don't want to print in one line if there's:
  //  * A comment.
  //  * 3 or more chained calls.
  //  * Any group but the last one has a hard line.
  // If the last group is a function it's okay to inline if it fits.
  if (
    hasComment ||
    callExpressionCount >= 3 ||
    printedGroups.slice(0, -1).some(willBreak)
  ) {
    return group(expanded);
  }

  return concat([
    // We only need to check `oneLine` because if `expanded` is chosen
    // that means that the parent group has already been broken
    // naturally
    willBreak(oneLine) || shouldHaveEmptyLineBeforeIndent ? breakParent : "",
    conditionalGroup([oneLine, expanded])
  ]);
}

function isJSXNode(node) {
  return (
    node.type === "JSXElement" ||
    node.type === "JSXFragment" ||
    node.type === "TSJsxFragment"
  );
}

function isEmptyJSXElement(node) {
  if (node.children.length === 0) {
    return true;
  }
  if (node.children.length > 1) {
    return false;
  }

  // if there is one text child and does not contain any meaningful text
  // we can treat the element as empty.
  const child = node.children[0];
  return isLiteral(child) && !isMeaningfulJSXText(child);
}

// Only space, newline, carriage return, and tab are treated as whitespace
// inside JSX.
const jsxWhitespaceChars = " \n\r\t";
const containsNonJsxWhitespaceRegex = new RegExp(
  "[^" + jsxWhitespaceChars + "]"
);
const matchJsxWhitespaceRegex = new RegExp("([" + jsxWhitespaceChars + "]+)");

// Meaningful if it contains non-whitespace characters,
// or it contains whitespace without a new line.
function isMeaningfulJSXText(node) {
  return (
    isLiteral(node) &&
    (containsNonJsxWhitespaceRegex.test(rawText(node)) ||
      !/\n/.test(rawText(node)))
  );
}

function conditionalExpressionChainContainsJSX(node) {
  return Boolean(getConditionalChainContents(node).find(isJSXNode));
}

// If we have nested conditional expressions, we want to print them in JSX mode
// if there's at least one JSXElement somewhere in the tree.
//
// A conditional expression chain like this should be printed in normal mode,
// because there aren't JSXElements anywhere in it:
//
// isA ? "A" : isB ? "B" : isC ? "C" : "Unknown";
//
// But a conditional expression chain like this should be printed in JSX mode,
// because there is a JSXElement in the last ConditionalExpression:
//
// isA ? "A" : isB ? "B" : isC ? "C" : <span className="warning">Unknown</span>;
//
// This type of ConditionalExpression chain is structured like this in the AST:
//
// ConditionalExpression {
//   test: ...,
//   consequent: ...,
//   alternate: ConditionalExpression {
//     test: ...,
//     consequent: ...,
//     alternate: ConditionalExpression {
//       test: ...,
//       consequent: ...,
//       alternate: ...,
//     }
//   }
// }
//
// We want to traverse over that shape and convert it into a flat structure so
// that we can find if there's a JSXElement somewhere inside.
function getConditionalChainContents(node) {
  // Given this code:
  //
  // // Using a ConditionalExpression as the consequent is uncommon, but should
  // // be handled.
  // A ? B : C ? D : E ? F ? G : H : I
  //
  // which has this AST:
  //
  // ConditionalExpression {
  //   test: Identifier(A),
  //   consequent: Identifier(B),
  //   alternate: ConditionalExpression {
  //     test: Identifier(C),
  //     consequent: Identifier(D),
  //     alternate: ConditionalExpression {
  //       test: Identifier(E),
  //       consequent: ConditionalExpression {
  //         test: Identifier(F),
  //         consequent: Identifier(G),
  //         alternate: Identifier(H),
  //       },
  //       alternate: Identifier(I),
  //     }
  //   }
  // }
  //
  // we should return this Array:
  //
  // [
  //   Identifier(A),
  //   Identifier(B),
  //   Identifier(C),
  //   Identifier(D),
  //   Identifier(E),
  //   Identifier(F),
  //   Identifier(G),
  //   Identifier(H),
  //   Identifier(I)
  // ];
  //
  // This loses the information about whether each node was the test,
  // consequent, or alternate, but we don't care about that here- we are only
  // flattening this structure to find if there's any JSXElements inside.
  const nonConditionalExpressions = [];

  function recurse(node) {
    if (node.type === "ConditionalExpression") {
      recurse(node.test);
      recurse(node.consequent);
      recurse(node.alternate);
    } else {
      nonConditionalExpressions.push(node);
    }
  }
  recurse(node);

  return nonConditionalExpressions;
}

// Detect an expression node representing `{" "}`
function isJSXWhitespaceExpression(node) {
  return (
    node.type === "JSXExpressionContainer" &&
    isLiteral(node.expression) &&
    node.expression.value === " " &&
    !node.expression.comments
  );
}

function separatorNoWhitespace(
  isFacebookTranslationTag,
  child,
  childNode,
  nextNode
) {
  if (isFacebookTranslationTag) {
    return "";
  }

  if (
    (childNode.type === "JSXElement" && !childNode.closingElement) ||
    (nextNode && (nextNode.type === "JSXElement" && !nextNode.closingElement))
  ) {
    return hardline;
  }

  return softline;
}

function separatorWithWhitespace(isFacebookTranslationTag, child) {
  if (isFacebookTranslationTag) {
    return hardline;
  }

  if (child.length === 1) {
    return softline;
  }

  return hardline;
}

// JSX Children are strange, mostly for two reasons:
// 1. JSX reads newlines into string values, instead of skipping them like JS
// 2. up to one whitespace between elements within a line is significant,
//    but not between lines.
//
// Leading, trailing, and lone whitespace all need to
// turn themselves into the rather ugly `{' '}` when breaking.
//
// We print JSX using the `fill` doc primitive.
// This requires that we give it an array of alternating
// content and whitespace elements.
// To ensure this we add dummy `""` content elements as needed.
function printJSXChildren(
  path,
  options,
  print,
  jsxWhitespace,
  isFacebookTranslationTag
) {
  const n = path.getValue();
  const children = [];

  // using `map` instead of `each` because it provides `i`
  path.map((childPath, i) => {
    const child = childPath.getValue();
    if (isLiteral(child)) {
      const text = rawText(child);

      // Contains a non-whitespace character
      if (isMeaningfulJSXText(child)) {
        const words = text.split(matchJsxWhitespaceRegex);

        // Starts with whitespace
        if (words[0] === "") {
          children.push("");
          words.shift();
          if (/\n/.test(words[0])) {
            children.push(
              separatorWithWhitespace(isFacebookTranslationTag, words[1])
            );
          } else {
            children.push(jsxWhitespace);
          }
          words.shift();
        }

        let endWhitespace;
        // Ends with whitespace
        if (getLast(words) === "") {
          words.pop();
          endWhitespace = words.pop();
        }

        // This was whitespace only without a new line.
        if (words.length === 0) {
          return;
        }

        words.forEach((word, i) => {
          if (i % 2 === 1) {
            children.push(line);
          } else {
            children.push(word);
          }
        });

        if (endWhitespace !== undefined) {
          if (/\n/.test(endWhitespace)) {
            children.push(
              separatorWithWhitespace(
                isFacebookTranslationTag,
                getLast(children)
              )
            );
          } else {
            children.push(jsxWhitespace);
          }
        } else {
          const next = n.children[i + 1];
          children.push(
            separatorNoWhitespace(
              isFacebookTranslationTag,
              getLast(children),
              child,
              next
            )
          );
        }
      } else if (/\n/.test(text)) {
        // Keep (up to one) blank line between tags/expressions/text.
        // Note: We don't keep blank lines between text elements.
        if (text.match(/\n/g).length > 1) {
          children.push("");
          children.push(hardline);
        }
      } else {
        children.push("");
        children.push(jsxWhitespace);
      }
    } else {
      const printedChild = print(childPath);
      children.push(printedChild);

      const next = n.children[i + 1];
      const directlyFollowedByMeaningfulText =
        next && isMeaningfulJSXText(next);
      if (directlyFollowedByMeaningfulText) {
        const firstWord = rawText(next)
          .trim()
          .split(matchJsxWhitespaceRegex)[0];
        children.push(
          separatorNoWhitespace(
            isFacebookTranslationTag,
            firstWord,
            child,
            next
          )
        );
      } else {
        children.push(hardline);
      }
    }
  }, "children");

  return children;
}

// JSX expands children from the inside-out, instead of the outside-in.
// This is both to break children before attributes,
// and to ensure that when children break, their parents do as well.
//
// Any element that is written without any newlines and fits on a single line
// is left that way.
// Not only that, any user-written-line containing multiple JSX siblings
// should also be kept on one line if possible,
// so each user-written-line is wrapped in its own group.
//
// Elements that contain newlines or don't fit on a single line (recursively)
// are fully-split, using hardline and shouldBreak: true.
//
// To support that case properly, all leading and trailing spaces
// are stripped from the list of children, and replaced with a single hardline.
function printJSXElement(path, options, print) {
  const n = path.getValue();

  // Turn <div></div> into <div />
  if (n.type === "JSXElement" && isEmptyJSXElement(n)) {
    n.openingElement.selfClosing = true;
    return path.call(print, "openingElement");
  }

  const openingLines =
    n.type === "JSXElement"
      ? path.call(print, "openingElement")
      : path.call(print, "openingFragment");
  const closingLines =
    n.type === "JSXElement"
      ? path.call(print, "closingElement")
      : path.call(print, "closingFragment");

  if (
    n.children.length === 1 &&
    n.children[0].type === "JSXExpressionContainer" &&
    (n.children[0].expression.type === "TemplateLiteral" ||
      n.children[0].expression.type === "TaggedTemplateExpression")
  ) {
    return concat([
      openingLines,
      concat(path.map(print, "children")),
      closingLines
    ]);
  }

  // Convert `{" "}` to text nodes containing a space.
  // This makes it easy to turn them into `jsxWhitespace` which
  // can then print as either a space or `{" "}` when breaking.
  n.children = n.children.map(child => {
    if (isJSXWhitespaceExpression(child)) {
      return {
        type: "JSXText",
        value: " ",
        raw: " "
      };
    }
    return child;
  });

  const containsTag = n.children.filter(isJSXNode).length > 0;
  const containsMultipleExpressions =
    n.children.filter(child => child.type === "JSXExpressionContainer").length >
    1;
  const containsMultipleAttributes =
    n.type === "JSXElement" && n.openingElement.attributes.length > 1;

  // Record any breaks. Should never go from true to false, only false to true.
  let forcedBreak =
    willBreak(openingLines) ||
    containsTag ||
    containsMultipleAttributes ||
    containsMultipleExpressions;

  const rawJsxWhitespace = options.singleQuote ? "{' '}" : '{" "}';
  const jsxWhitespace = ifBreak(concat([rawJsxWhitespace, softline]), " ");

  const isFacebookTranslationTag =
    n.openingElement &&
    n.openingElement.name &&
    n.openingElement.name.name === "fbt";

  const children = printJSXChildren(
    path,
    options,
    print,
    jsxWhitespace,
    isFacebookTranslationTag
  );

  const containsText =
    n.children.filter(child => isMeaningfulJSXText(child)).length > 0;

  // We can end up we multiple whitespace elements with empty string
  // content between them.
  // We need to remove empty whitespace and softlines before JSX whitespace
  // to get the correct output.
  for (let i = children.length - 2; i >= 0; i--) {
    const isPairOfEmptyStrings = children[i] === "" && children[i + 1] === "";
    const isPairOfHardlines =
      children[i] === hardline &&
      children[i + 1] === "" &&
      children[i + 2] === hardline;
    const isLineFollowedByJSXWhitespace =
      (children[i] === softline || children[i] === hardline) &&
      children[i + 1] === "" &&
      children[i + 2] === jsxWhitespace;
    const isJSXWhitespaceFollowedByLine =
      children[i] === jsxWhitespace &&
      children[i + 1] === "" &&
      (children[i + 2] === softline || children[i + 2] === hardline);
    const isDoubleJSXWhitespace =
      children[i] === jsxWhitespace &&
      children[i + 1] === "" &&
      children[i + 2] === jsxWhitespace;
    const isPairOfHardOrSoftLines =
      (children[i] === softline &&
        children[i + 1] === "" &&
        children[i + 2] === hardline) ||
      (children[i] === hardline &&
        children[i + 1] === "" &&
        children[i + 2] === softline);

    if (
      (isPairOfHardlines && containsText) ||
      isPairOfEmptyStrings ||
      isLineFollowedByJSXWhitespace ||
      isDoubleJSXWhitespace ||
      isPairOfHardOrSoftLines
    ) {
      children.splice(i, 2);
    } else if (isJSXWhitespaceFollowedByLine) {
      children.splice(i + 1, 2);
    }
  }

  // Trim trailing lines (or empty strings)
  while (
    children.length &&
    (isLineNext(getLast(children)) || isEmpty(getLast(children)))
  ) {
    children.pop();
  }

  // Trim leading lines (or empty strings)
  while (
    children.length &&
    (isLineNext(children[0]) || isEmpty(children[0])) &&
    (isLineNext(children[1]) || isEmpty(children[1]))
  ) {
    children.shift();
    children.shift();
  }

  // Tweak how we format children if outputting this element over multiple lines.
  // Also detect whether we will force this element to output over multiple lines.
  const multilineChildren = [];
  children.forEach((child, i) => {
    // There are a number of situations where we need to ensure we display
    // whitespace as `{" "}` when outputting this element over multiple lines.
    if (child === jsxWhitespace) {
      if (i === 1 && children[i - 1] === "") {
        if (children.length === 2) {
          // Solitary whitespace
          multilineChildren.push(rawJsxWhitespace);
          return;
        }
        // Leading whitespace
        multilineChildren.push(concat([rawJsxWhitespace, hardline]));
        return;
      } else if (i === children.length - 1) {
        // Trailing whitespace
        multilineChildren.push(rawJsxWhitespace);
        return;
      } else if (children[i - 1] === "" && children[i - 2] === hardline) {
        // Whitespace after line break
        multilineChildren.push(rawJsxWhitespace);
        return;
      }
    }

    multilineChildren.push(child);

    if (willBreak(child)) {
      forcedBreak = true;
    }
  });

  // If there is text we use `fill` to fit as much onto each line as possible.
  // When there is no text (just tags and expressions) we use `group`
  // to output each on a separate line.
  const content = containsText
    ? fill(multilineChildren)
    : group(concat(multilineChildren), { shouldBreak: true });

  const multiLineElem = group(
    concat([
      openingLines,
      indent(concat([hardline, content])),
      hardline,
      closingLines
    ])
  );

  if (forcedBreak) {
    return multiLineElem;
  }

  return conditionalGroup([
    group(concat([openingLines, concat(children), closingLines])),
    multiLineElem
  ]);
}

function maybeWrapJSXElementInParens(path, elem) {
  const parent = path.getParentNode();
  if (!parent) {
    return elem;
  }

  const NO_WRAP_PARENTS = {
    ArrayExpression: true,
    JSXAttribute: true,
    JSXElement: true,
    JSXExpressionContainer: true,
    JSXFragment: true,
    TSJsxFragment: true,
    ExpressionStatement: true,
    CallExpression: true,
    OptionalCallExpression: true,
    ConditionalExpression: true
  };
  if (NO_WRAP_PARENTS[parent.type]) {
    return elem;
  }

  const shouldBreak =
    matchAncestorTypes(path, [
      "ArrowFunctionExpression",
      "CallExpression",
      "JSXExpressionContainer"
    ]) && isMemberExpressionChain(path.getParentNode(1).callee);

  return group(
    concat([
      ifBreak("("),
      indent(concat([softline, elem])),
      softline,
      ifBreak(")")
    ]),
    { shouldBreak }
  );
}

function isBinaryish(node) {
  return node.type === "BinaryExpression" || node.type === "LogicalExpression";
}

function isMemberish(node) {
  return (
    node.type === "MemberExpression" ||
    node.type === "OptionalMemberExpression" ||
    (node.type === "BindExpression" && node.object)
  );
}

function shouldInlineLogicalExpression(node) {
  if (node.type !== "LogicalExpression") {
    return false;
  }

  if (
    node.right.type === "ObjectExpression" &&
    node.right.properties.length !== 0
  ) {
    return true;
  }

  if (
    node.right.type === "ArrayExpression" &&
    node.right.elements.length !== 0
  ) {
    return true;
  }

  if (isJSXNode(node.right)) {
    return true;
  }

  return false;
}

// For binary expressions to be consistent, we need to group
// subsequent operators with the same precedence level under a single
// group. Otherwise they will be nested such that some of them break
// onto new lines but not all. Operators with the same precedence
// level should either all break or not. Because we group them by
// precedence level and the AST is structured based on precedence
// level, things are naturally broken up correctly, i.e. `&&` is
// broken before `+`.
function printBinaryishExpressions(
  path,
  print,
  options,
  isNested,
  isInsideParenthesis
) {
  let parts = [];
  const node = path.getValue();

  // We treat BinaryExpression and LogicalExpression nodes the same.
  if (isBinaryish(node)) {
    // Put all operators with the same precedence level in the same
    // group. The reason we only need to do this with the `left`
    // expression is because given an expression like `1 + 2 - 3`, it
    // is always parsed like `((1 + 2) - 3)`, meaning the `left` side
    // is where the rest of the expression will exist. Binary
    // expressions on the right side mean they have a difference
    // precedence level and should be treated as a separate group, so
    // print them normally. (This doesn't hold for the `**` operator,
    // which is unique in that it is right-associative.)
    if (shouldFlatten(node.operator, node.left.operator)) {
      // Flatten them out by recursively calling this function.
      parts = parts.concat(
        path.call(
          left =>
            printBinaryishExpressions(
              left,
              print,
              options,
              /* isNested */ true,
              isInsideParenthesis
            ),
          "left"
        )
      );
    } else {
      parts.push(path.call(print, "left"));
    }

    const shouldInline = shouldInlineLogicalExpression(node);
    const lineBeforeOperator =
      node.operator === "|>" &&
      !hasLeadingOwnLineComment(options.originalText, node.right, options);

    const right = shouldInline
      ? concat([node.operator, " ", path.call(print, "right")])
      : concat([
          lineBeforeOperator ? softline : "",
          node.operator,
          lineBeforeOperator ? " " : line,
          path.call(print, "right")
        ]);

    // If there's only a single binary expression, we want to create a group
    // in order to avoid having a small right part like -1 be on its own line.
    const parent = path.getParentNode();
    const shouldGroup =
      !(isInsideParenthesis && node.type === "LogicalExpression") &&
      parent.type !== node.type &&
      node.left.type !== node.type &&
      node.right.type !== node.type;

    parts.push(" ", shouldGroup ? group(right) : right);

    // The root comments are already printed, but we need to manually print
    // the other ones since we don't call the normal print on BinaryExpression,
    // only for the left and right parts
    if (isNested && node.comments) {
      parts = comments.printComments(path, () => concat(parts), options);
    }
  } else {
    // Our stopping case. Simply print the node normally.
    parts.push(path.call(print));
  }

  return parts;
}

function printAssignmentRight(leftNode, rightNode, printedRight, options) {
  if (hasLeadingOwnLineComment(options.originalText, rightNode, options)) {
    return indent(concat([hardline, printedRight]));
  }

  const canBreak =
    (isBinaryish(rightNode) && !shouldInlineLogicalExpression(rightNode)) ||
    (rightNode.type === "ConditionalExpression" &&
      isBinaryish(rightNode.test) &&
      !shouldInlineLogicalExpression(rightNode.test)) ||
    rightNode.type === "StringLiteralTypeAnnotation" ||
    ((leftNode.type === "Identifier" ||
      isStringLiteral(leftNode) ||
      leftNode.type === "MemberExpression") &&
      (isStringLiteral(rightNode) || isMemberExpressionChain(rightNode)) &&
      // do not put values on a separate line from the key in json
      options.parser !== "json" &&
      options.parser !== "json5");

  if (canBreak) {
    return group(indent(concat([line, printedRight])));
  }

  return concat([" ", printedRight]);
}

function printAssignment(
  leftNode,
  printedLeft,
  operator,
  rightNode,
  printedRight,
  options
) {
  if (!rightNode) {
    return printedLeft;
  }

  const printed = printAssignmentRight(
    leftNode,
    rightNode,
    printedRight,
    options
  );

  return group(concat([printedLeft, operator, printed]));
}

function adjustClause(node, clause, forceSpace) {
  if (node.type === "EmptyStatement") {
    return ";";
  }

  if (node.type === "BlockStatement" || forceSpace) {
    return concat([" ", clause]);
  }

  return indent(concat([line, clause]));
}

function nodeStr(node, options, isFlowOrTypeScriptDirectiveLiteral) {
  const raw = rawText(node);
  const isDirectiveLiteral =
    isFlowOrTypeScriptDirectiveLiteral || node.type === "DirectiveLiteral";
  return printString(raw, options, isDirectiveLiteral);
}

function printRegex(node) {
  const flags = node.flags
    .split("")
    .sort()
    .join("");
  return `/${node.pattern}/${flags}`;
}

function isLastStatement(path) {
  const parent = path.getParentNode();
  if (!parent) {
    return true;
  }
  const node = path.getValue();
  const body = (parent.body || parent.consequent).filter(
    stmt => stmt.type !== "EmptyStatement"
  );
  return body && body[body.length - 1] === node;
}

function hasLeadingComment(node) {
  return node.comments && node.comments.some(comment => comment.leading);
}

function hasTrailingComment(node) {
  return node.comments && node.comments.some(comment => comment.trailing);
}

function hasLeadingOwnLineComment(text, node, options) {
  if (isJSXNode(node)) {
    return hasNodeIgnoreComment(node);
  }

  const res =
    node.comments &&
    node.comments.some(
      comment => comment.leading && hasNewline(text, options.locEnd(comment))
    );
  return res;
}

function hasNakedLeftSide(node) {
  return (
    node.type === "AssignmentExpression" ||
    node.type === "BinaryExpression" ||
    node.type === "LogicalExpression" ||
    node.type === "ConditionalExpression" ||
    node.type === "CallExpression" ||
    node.type === "OptionalCallExpression" ||
    node.type === "MemberExpression" ||
    node.type === "OptionalMemberExpression" ||
    node.type === "SequenceExpression" ||
    node.type === "TaggedTemplateExpression" ||
    node.type === "BindExpression" ||
    (node.type === "UpdateExpression" && !node.prefix)
  );
}

function isFlowAnnotationComment(text, typeAnnotation, options) {
  const start = options.locStart(typeAnnotation);
  const end = skipWhitespace(text, options.locEnd(typeAnnotation));
  return text.substr(start, 2) === "/*" && text.substr(end, 2) === "*/";
}

function getLeftSide(node) {
  if (node.expressions) {
    return node.expressions[0];
  }
  return (
    node.left ||
    node.test ||
    node.callee ||
    node.object ||
    node.tag ||
    node.argument ||
    node.expression
  );
}

function getLeftSidePathName(path, node) {
  if (node.expressions) {
    return ["expressions", 0];
  }
  if (node.left) {
    return ["left"];
  }
  if (node.test) {
    return ["test"];
  }
  if (node.object) {
    return ["object"];
  }
  if (node.callee) {
    return ["callee"];
  }
  if (node.tag) {
    return ["tag"];
  }
  if (node.argument) {
    return ["argument"];
  }
  if (node.expression) {
    return ["expression"];
  }
  throw new Error("Unexpected node has no left side", node);
}

function exprNeedsASIProtection(path, options) {
  const node = path.getValue();

  const maybeASIProblem =
    pathNeedsParens(path, options) ||
    node.type === "ParenthesizedExpression" ||
    node.type === "TypeCastExpression" ||
    (node.type === "ArrowFunctionExpression" &&
      !shouldPrintParamsWithoutParens(path, options)) ||
    node.type === "ArrayExpression" ||
    node.type === "ArrayPattern" ||
    (node.type === "UnaryExpression" &&
      node.prefix &&
      (node.operator === "+" || node.operator === "-")) ||
    node.type === "TemplateLiteral" ||
    node.type === "TemplateElement" ||
    isJSXNode(node) ||
    (node.type === "BindExpression" && !node.object) ||
    node.type === "RegExpLiteral" ||
    (node.type === "Literal" && node.pattern) ||
    (node.type === "Literal" && node.regex);

  if (maybeASIProblem) {
    return true;
  }

  if (!hasNakedLeftSide(node)) {
    return false;
  }

  return path.call.apply(
    path,
    [childPath => exprNeedsASIProtection(childPath, options)].concat(
      getLeftSidePathName(path, node)
    )
  );
}

function stmtNeedsASIProtection(path, options) {
  const node = path.getNode();

  if (node.type !== "ExpressionStatement") {
    return false;
  }

  return path.call(
    childPath => exprNeedsASIProtection(childPath, options),
    "expression"
  );
}

function classPropMayCauseASIProblems(path) {
  const node = path.getNode();

  if (node.type !== "ClassProperty") {
    return false;
  }

  const name = node.key && node.key.name;

  // this isn't actually possible yet with most parsers available today
  // so isn't properly tested yet.
  if (
    (name === "static" || name === "get" || name === "set") &&
    !node.value &&
    !node.typeAnnotation
  ) {
    return true;
  }
}

function classChildNeedsASIProtection(node) {
  if (!node) {
    return;
  }

  if (
    node.static ||
    node.accessibility // TypeScript
  ) {
    return false;
  }

  if (!node.computed) {
    const name = node.key && node.key.name;
    if (name === "in" || name === "instanceof") {
      return true;
    }
  }
  switch (node.type) {
    case "ClassProperty":
    case "TSAbstractClassProperty":
      return node.computed;
    case "MethodDefinition": // Flow
    case "TSAbstractMethodDefinition": // TypeScript
    case "ClassMethod": {
      // Babylon
      const isAsync = node.value ? node.value.async : node.async;
      const isGenerator = node.value ? node.value.generator : node.generator;
      if (isAsync || node.kind === "get" || node.kind === "set") {
        return false;
      }
      if (node.computed || isGenerator) {
        return true;
      }
      return false;
    }

    default:
      /* istanbul ignore next */
      return false;
  }
}

// This recurses the return argument, looking for the first token
// (the leftmost leaf node) and, if it (or its parents) has any
// leadingComments, returns true (so it can be wrapped in parens).
function returnArgumentHasLeadingComment(options, argument) {
  if (hasLeadingOwnLineComment(options.originalText, argument, options)) {
    return true;
  }

  if (hasNakedLeftSide(argument)) {
    let leftMost = argument;
    let newLeftMost;
    while ((newLeftMost = getLeftSide(leftMost))) {
      leftMost = newLeftMost;

      if (hasLeadingOwnLineComment(options.originalText, leftMost, options)) {
        return true;
      }
    }
  }

  return false;
}

function isMemberExpressionChain(node) {
  if (
    node.type !== "MemberExpression" &&
    node.type !== "OptionalMemberExpression"
  ) {
    return false;
  }
  if (node.object.type === "Identifier") {
    return true;
  }
  return isMemberExpressionChain(node.object);
}

// Hack to differentiate between the following two which have the same ast
// type T = { method: () => void };
// type T = { method(): void };
function isObjectTypePropertyAFunction(node, options) {
  return (
    (node.type === "ObjectTypeProperty" ||
      node.type === "ObjectTypeInternalSlot") &&
    node.value.type === "FunctionTypeAnnotation" &&
    !node.static &&
    !isFunctionNotation(node, options)
  );
}

// TODO: This is a bad hack and we need a better way to distinguish between
// arrow functions and otherwise
function isFunctionNotation(node, options) {
  return isGetterOrSetter(node) || sameLocStart(node, node.value, options);
}

function isGetterOrSetter(node) {
  return node.kind === "get" || node.kind === "set";
}

function sameLocStart(nodeA, nodeB, options) {
  return options.locStart(nodeA) === options.locStart(nodeB);
}

// Hack to differentiate between the following two which have the same ast
// declare function f(a): void;
// var f: (a) => void;
function isTypeAnnotationAFunction(node, options) {
  return (
    (node.type === "TypeAnnotation" || node.type === "TSTypeAnnotation") &&
    node.typeAnnotation.type === "FunctionTypeAnnotation" &&
    !node.static &&
    !sameLocStart(node, node.typeAnnotation, options)
  );
}

function isNodeStartingWithDeclare(node, options) {
  if (!(options.parser === "flow" || options.parser === "typescript")) {
    return false;
  }
  return (
    options.originalText
      .slice(0, options.locStart(node))
      .match(/declare[ \t]*$/) ||
    options.originalText
      .slice(node.range[0], node.range[1])
      .startsWith("declare ")
  );
}

function shouldHugType(node) {
  if (isSimpleFlowType(node) || isObjectType(node)) {
    return true;
  }

  if (node.type === "UnionTypeAnnotation" || node.type === "TSUnionType") {
    const voidCount = node.types.filter(
      n =>
        n.type === "VoidTypeAnnotation" ||
        n.type === "TSVoidKeyword" ||
        n.type === "NullLiteralTypeAnnotation" ||
        n.type === "TSNullKeyword"
    ).length;

    const objectCount = node.types.filter(
      n =>
        n.type === "ObjectTypeAnnotation" ||
        n.type === "TSTypeLiteral" ||
        // This is a bit aggressive but captures Array<{x}>
        n.type === "GenericTypeAnnotation" ||
        n.type === "TSTypeReference"
    ).length;

    if (node.types.length - 1 === voidCount && objectCount > 0) {
      return true;
    }
  }

  return false;
}

function shouldHugArguments(fun) {
  return (
    fun &&
    fun.params &&
    fun.params.length === 1 &&
    !fun.params[0].comments &&
    (fun.params[0].type === "ObjectPattern" ||
      fun.params[0].type === "ArrayPattern" ||
      (fun.params[0].type === "Identifier" &&
        fun.params[0].typeAnnotation &&
        (fun.params[0].typeAnnotation.type === "TypeAnnotation" ||
          fun.params[0].typeAnnotation.type === "TSTypeAnnotation") &&
        isObjectType(fun.params[0].typeAnnotation.typeAnnotation)) ||
      (fun.params[0].type === "FunctionTypeParam" &&
        isObjectType(fun.params[0].typeAnnotation)) ||
      (fun.params[0].type === "AssignmentPattern" &&
        (fun.params[0].left.type === "ObjectPattern" ||
          fun.params[0].left.type === "ArrayPattern") &&
        (fun.params[0].right.type === "Identifier" ||
          (fun.params[0].right.type === "ObjectExpression" &&
            fun.params[0].right.properties.length === 0) ||
          (fun.params[0].right.type === "ArrayExpression" &&
            fun.params[0].right.elements.length === 0)))) &&
    !fun.rest
  );
}

function templateLiteralHasNewLines(template) {
  return template.quasis.some(quasi => quasi.value.raw.includes("\n"));
}

function isTemplateOnItsOwnLine(n, text, options) {
  return (
    ((n.type === "TemplateLiteral" && templateLiteralHasNewLines(n)) ||
      (n.type === "TaggedTemplateExpression" &&
        templateLiteralHasNewLines(n.quasi))) &&
    !hasNewline(text, options.locStart(n), { backwards: true })
  );
}

function printArrayItems(path, options, printPath, print) {
  const printedElements = [];
  let separatorParts = [];

  path.each(childPath => {
    printedElements.push(concat(separatorParts));
    printedElements.push(group(print(childPath)));

    separatorParts = [",", line];
    if (
      childPath.getValue() &&
      isNextLineEmpty(options.originalText, childPath.getValue(), options)
    ) {
      separatorParts.push(softline);
    }
  }, printPath);

  return concat(printedElements);
}

function hasDanglingComments(node) {
  return (
    node.comments &&
    node.comments.some(comment => !comment.leading && !comment.trailing)
  );
}

function needsHardlineAfterDanglingComment(node) {
  if (!node.comments) {
    return false;
  }
  const lastDanglingComment = getLast(
    node.comments.filter(comment => !comment.leading && !comment.trailing)
  );
  return (
    lastDanglingComment && !handleComments.isBlockComment(lastDanglingComment)
  );
}

function isLiteral(node) {
  return (
    node.type === "BooleanLiteral" ||
    node.type === "DirectiveLiteral" ||
    node.type === "Literal" ||
    node.type === "NullLiteral" ||
    node.type === "NumericLiteral" ||
    node.type === "RegExpLiteral" ||
    node.type === "StringLiteral" ||
    node.type === "TemplateLiteral" ||
    node.type === "TSTypeLiteral" ||
    node.type === "JSXText"
  );
}

function isNumericLiteral(node) {
  return (
    node.type === "NumericLiteral" ||
    (node.type === "Literal" && typeof node.value === "number")
  );
}

function isStringLiteral(node) {
  return (
    node.type === "StringLiteral" ||
    (node.type === "Literal" && typeof node.value === "string")
  );
}

function isObjectType(n) {
  return n.type === "ObjectTypeAnnotation" || n.type === "TSTypeLiteral";
}

const unitTestRe = /^(skip|[fx]?(it|describe|test))$/;

// eg; `describe("some string", (done) => {})`
function isTestCall(n, parent) {
  if (n.type !== "CallExpression") {
    return false;
  }
  if (n.arguments.length === 1) {
    if (isAngularTestWrapper(n) && parent && isTestCall(parent)) {
      return isFunctionOrArrowExpression(n.arguments[0].type);
    }

    if (isUnitTestSetUp(n)) {
      return isAngularTestWrapper(n.arguments[0]);
    }
  } else if (n.arguments.length === 2 || n.arguments.length === 3) {
    if (
      ((n.callee.type === "Identifier" && unitTestRe.test(n.callee.name)) ||
        isSkipOrOnlyBlock(n)) &&
      (isTemplateLiteral(n.arguments[0]) || isStringLiteral(n.arguments[0]))
    ) {
      // it("name", () => { ... }, 2500)
      if (n.arguments[2] && !isNumericLiteral(n.arguments[2])) {
        return false;
      }
      return (
        (isFunctionOrArrowExpression(n.arguments[1].type) &&
          n.arguments[1].params.length <= 1) ||
        isAngularTestWrapper(n.arguments[1])
      );
    }
  }
  return false;
}

function isSkipOrOnlyBlock(node) {
  return (
    (node.callee.type === "MemberExpression" ||
      node.callee.type === "OptionalMemberExpression") &&
    node.callee.object.type === "Identifier" &&
    node.callee.property.type === "Identifier" &&
    unitTestRe.test(node.callee.object.name) &&
    (node.callee.property.name === "only" ||
      node.callee.property.name === "skip")
  );
}

function isTemplateLiteral(node) {
  return node.type === "TemplateLiteral";
}

// `inject` is used in AngularJS 1.x, `async` in Angular 2+
// example: https://docs.angularjs.org/guide/unit-testing#using-beforeall-
function isAngularTestWrapper(node) {
  return (
    (node.type === "CallExpression" ||
      node.type === "OptionalCallExpression") &&
    node.callee.type === "Identifier" &&
    (node.callee.name === "async" ||
      node.callee.name === "inject" ||
      node.callee.name === "fakeAsync")
  );
}

function isFunctionOrArrowExpression(type) {
  return type === "FunctionExpression" || type === "ArrowFunctionExpression";
}

function isUnitTestSetUp(n) {
  const unitTestSetUpRe = /^(before|after)(Each|All)$/;
  return (
    n.callee.type === "Identifier" &&
    unitTestSetUpRe.test(n.callee.name) &&
    n.arguments.length === 1
  );
}

function isTheOnlyJSXElementInMarkdown(options, path) {
  if (options.parentParser !== "markdown") {
    return false;
  }

  const node = path.getNode();

  if (!node.expression || !isJSXNode(node.expression)) {
    return false;
  }

  const parent = path.getParentNode();

  return parent.type === "Program" && parent.body.length == 1;
}

function willPrintOwnComments(path) {
  const node = path.getValue();
  const parent = path.getParentNode();

  return (
    ((node && isJSXNode(node)) ||
      (parent &&
        (parent.type === "JSXSpreadAttribute" ||
          parent.type === "JSXSpreadChild" ||
          parent.type === "UnionTypeAnnotation" ||
          parent.type === "TSUnionType" ||
          ((parent.type === "ClassDeclaration" ||
            parent.type === "ClassExpression") &&
            parent.superClass === node)))) &&
    !hasIgnoreComment(path)
  );
}

function canAttachComment(node) {
  return (
    node.type &&
    node.type !== "CommentBlock" &&
    node.type !== "CommentLine" &&
    node.type !== "Line" &&
    node.type !== "Block" &&
    node.type !== "EmptyStatement" &&
    node.type !== "TemplateElement" &&
    node.type !== "Import" &&
    !(node.callee && node.callee.type === "Import")
  );
}

function printComment(commentPath, options) {
  const comment = commentPath.getValue();

  switch (comment.type) {
    case "CommentBlock":
    case "Block": {
      if (isJsDocComment(comment)) {
        const printed = printJsDocComment(comment);
        // We need to prevent an edge case of a previous trailing comment
        // printed as a `lineSuffix` which causes the comments to be
        // interleaved. See https://github.com/prettier/prettier/issues/4412
        if (
          comment.trailing &&
          !hasNewline(options.originalText, options.locStart(comment), {
            backwards: true
          })
        ) {
          return concat([hardline, printed]);
        }
        return printed;
      }

      const isInsideFlowComment =
        options.originalText.substr(options.locEnd(comment) - 3, 3) === "*-/";

      return "/*" + comment.value + (isInsideFlowComment ? "*-/" : "*/");
    }
    case "CommentLine":
    case "Line":
      // Print shebangs with the proper comment characters
      if (
        options.originalText.slice(options.locStart(comment)).startsWith("#!")
      ) {
        return "#!" + comment.value.trimRight();
      }
      return "//" + comment.value.trimRight();
    default:
      throw new Error("Not a comment: " + JSON.stringify(comment));
  }
}

function isJsDocComment(comment) {
  const lines = comment.value.split("\n");
  return (
    lines.length > 1 &&
    lines.slice(0, lines.length - 1).every(line => line.trim()[0] === "*")
  );
}

function printJsDocComment(comment) {
  const lines = comment.value.split("\n");

  return concat([
    "/*",
    join(
      hardline,
      lines.map(
        (line, index) =>
          (index > 0 ? " " : "") +
          (index < lines.length - 1 ? line.trim() : line.trimLeft())
      )
    ),
    "*/"
  ]);
}

function rawText(node) {
  return node.extra ? node.extra.raw : node.raw;
}

module.exports = {
  preprocess,
  print: genericPrint,
  embed,
  insertPragma,
  massageAstNode: clean,
  hasPrettierIgnore,
  willPrintOwnComments,
  canAttachComment,
  printComment,
  isBlockComment: handleComments.isBlockComment,
  handleComments: {
    ownLine: handleComments.handleOwnLineComment,
    endOfLine: handleComments.handleEndOfLineComment,
    remaining: handleComments.handleRemainingComment
  }
};
