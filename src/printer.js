"use strict";

var assert = require("assert");
var comments = require("./comments");
var FastPath = require("./fast-path");
var util = require("./util");
var isIdentifierName = require("esutils").keyword.isIdentifierNameES6;

var docBuilders = require("./doc-builders");
var concat = docBuilders.concat;
var join = docBuilders.join;
var line = docBuilders.line;
var hardline = docBuilders.hardline;
var softline = docBuilders.softline;
var literalline = docBuilders.literalline;
var group = docBuilders.group;
var indent = docBuilders.indent;
var align = docBuilders.align;
var conditionalGroup = docBuilders.conditionalGroup;
var ifBreak = docBuilders.ifBreak;
var breakParent = docBuilders.breakParent;
var lineSuffixBoundary = docBuilders.lineSuffixBoundary;

var docUtils = require("./doc-utils");
var willBreak = docUtils.willBreak;
var isLineNext = docUtils.isLineNext;
var isEmpty = docUtils.isEmpty;

var types = require("ast-types");
var namedTypes = types.namedTypes;
var isString = types.builtInTypes.string;
var isObject = types.builtInTypes.object;

function shouldPrintComma(options, level) {
  level = level || "es5";

  switch (options.trailingComma) {
    case "all":
      if (level === "all") {
        return true;
      }
    case "es5":
      if (level === "es5") {
        return true;
      }
    case "none":
    default:
      return false;
  }
}

function genericPrint(path, options, printPath, args) {
  assert.ok(path instanceof FastPath);

  var node = path.getValue();

  // Escape hatch
  if (
    node &&
    node.comments &&
    node.comments.length > 0 &&
    node.comments.some(comment => comment.value.trim() === "prettier-ignore")
  ) {
    return options.originalText.slice(util.locStart(node), util.locEnd(node));
  }

  var parts = [];
  var needsParens = false;
  var linesWithoutParens = genericPrintNoParens(path, options, printPath, args);

  if (!node || isEmpty(linesWithoutParens)) {
    return linesWithoutParens;
  }

  if (
    node.decorators &&
    node.decorators.length > 0 &&
    // If the parent node is an export declaration, it will be
    // responsible for printing node.decorators.
    !util.getParentExportDeclaration(path)
  ) {
    const separator = node.decorators.length === 1 &&
      (node.decorators[0].expression.type === "Identifier" ||
        node.decorators[0].expression.type === "MemberExpression")
      ? " "
      : hardline;
    path.each(function(decoratorPath) {
      parts.push(printPath(decoratorPath), separator);
    }, "decorators");
  } else if (
    util.isExportDeclaration(node) &&
    node.declaration &&
    node.declaration.decorators
  ) {
    // Export declarations are responsible for printing any decorators
    // that logically apply to node.declaration.
    path.each(
      function(decoratorPath) {
        parts.push(printPath(decoratorPath), line);
      },
      "declaration",
      "decorators"
    );
  } else {
    // Nodes with decorators can't have parentheses, so we can avoid
    // computing path.needsParens() except in this case.
    needsParens = path.needsParens();
  }

  if (node.type) {
    // HACK: ASI prevention in no-semi mode relies on knowledge of whether
    // or not a paren has been inserted (see `exprNeedsASIProtection()`).
    // For now, we're just passing that information by mutating the AST here,
    // but it would be nice to find a cleaner way to do this.
    node.needsParens = needsParens;
  }

  if (needsParens) {
    parts.unshift("(");
  }

  parts.push(linesWithoutParens);

  if (needsParens) {
    parts.push(")");
  }

  return concat(parts);
}

function genericPrintNoParens(path, options, print, args) {
  var n = path.getValue();
  const semi = options.semi ? ";" : "";

  if (!n) {
    return "";
  }

  if (typeof n === "string") {
    return n;
  }

  // TODO: Investigate types that return not printable.
  // This assert isn't very useful though.
  // namedTypes.Printable.assert(n);

  var parts = [];
  switch (n.type) {
    case "File":
      return path.call(print, "program");
    case "Program":
      // Babel 6
      if (n.directives) {
        path.each(function(childPath) {
          parts.push(print(childPath), semi, hardline);
          if (
            util.isNextLineEmpty(options.originalText, childPath.getValue())
          ) {
            parts.push(hardline);
          }
        }, "directives");
      }

      parts.push(
        path.call(function(bodyPath) {
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
    case "Noop":
    case "EmptyStatement":
      return "";
    case "ExpressionStatement":
      return concat([path.call(print, "expression"), semi]); // Babel extension.
    case "ParenthesizedExpression":
      return concat(["(", path.call(print, "expression"), ")"]);
    case "AssignmentExpression":
      return printAssignment(
        n.left,
        path.call(print, "left"),
        n.operator,
        n.right,
        path.call(print, "right"),
        options
      );
    case "BinaryExpression":
    case "LogicalExpression": {
      const parent = path.getParentNode();
      const isInsideParenthesis =
        n !== parent.body &&
        (parent.type === "IfStatement" ||
          parent.type === "WhileStatement" ||
          parent.type === "DoStatement");

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

      // Avoid indenting sub-expressions in assignment/return/etc statements.
      if (
        parent.type === "AssignmentExpression" ||
        parent.type === "VariableDeclarator" ||
        shouldInlineLogicalExpression(n) ||
        parent.type === "ReturnStatement" ||
        (n === parent.body && parent.type === "ArrowFunctionExpression") ||
        (n !== parent.body && parent.type === "ForStatement")
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
    case "MemberExpression": {
      const parent = path.getParentNode();
      let firstNonMemberParent;
      let i = 0;
      do {
        firstNonMemberParent = path.getParentNode(i);
        i++;
      } while (
        firstNonMemberParent &&
        firstNonMemberParent.type === "MemberExpression"
      );

      const shouldInline =
        firstNonMemberParent && (
          (firstNonMemberParent.type === "VariableDeclarator" &&
            firstNonMemberParent.id.type !== "Identifier") ||
          (firstNonMemberParent.type === "AssignmentExpression" &&
            firstNonMemberParent.left.type !== "Identifier")) ||
        n.computed ||
        (n.object.type === "Identifier" &&
          n.property.type === "Identifier" &&
          parent.type !== "MemberExpression");

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

      parts.push("::", path.call(print, "callee"));

      return concat(parts);
    case "Path":
      return join(".", n.body);
    case "Identifier":
      return concat([
        n.name,
        n.optional ? "?" : "",
        path.call(print, "typeAnnotation")
      ]);
    case "SpreadElement":
    case "SpreadElementPattern":
    // Babel 6 for ObjectPattern
    case "RestProperty":
    case "SpreadProperty":
    case "SpreadPropertyPattern":
    case "RestElement":
    case "ObjectTypeSpreadProperty":
      return concat([
        "...",
        path.call(print, "argument"),
        path.call(print, "typeAnnotation")
      ]);
    case "FunctionDeclaration":
    case "FunctionExpression":
      return printFunctionDeclaration(path, print, options);
    case "ArrowFunctionExpression": {
      if (n.async) parts.push("async ");

      if (n.typeParameters) {
        parts.push(path.call(print, "typeParameters"));
      }

      if (canPrintParamsWithoutParens(n)) {
        parts.push(path.call(print, "params", 0));
      } else {
        parts.push(
          group(
            concat([
              printFunctionParams(
                path,
                print,
                options,
                args && (args.expandLastArg || args.expandFirstArg)
              ),
              printReturnType(path, print)
            ])
          )
        );
      }

      parts.push(" =>");

      const body = path.call(print, "body");
      const collapsed = concat([concat(parts), " ", body]);

      // We want to always keep these types of nodes on the same line
      // as the arrow.
      if (
        n.body.type === "ArrayExpression" ||
        n.body.type === "ObjectExpression" ||
        n.body.type === "JSXElement" ||
        n.body.type === "BlockStatement" ||
        n.body.type === "TaggedTemplateExpression" ||
        n.body.type === "TemplateElement" ||
        n.body.type === "ClassExpression" ||
        n.body.type === "ArrowFunctionExpression"
      ) {
        return group(collapsed);
      }

      // if the arrow function is expanded as last argument, we are adding a
      // level of indentation and need to add a softline to align the closing )
      // with the opening (.
      const shouldAddSoftLine = args && args.expandLastArg;

      return group(
        concat([
          concat(parts),
          group(
            concat([
              indent(concat([line, body])),
              shouldAddSoftLine
                ? concat([
                    ifBreak(shouldPrintComma(options, "all") ? "," : ""),
                    softline
                  ])
                : ""
            ])
          )
        ])
      );
    }
    case "MethodDefinition":
      if (n.static) {
        parts.push("static ");
      }

      parts.push(printMethod(path, options, print));

      return concat(parts);
    case "YieldExpression":
      parts.push("yield");

      if (n.delegate) parts.push("*");

      if (n.argument) parts.push(" ", path.call(print, "argument"));

      return concat(parts);
    case "AwaitExpression":
      parts.push("await");

      if (n.all) parts.push("*");

      if (n.argument) parts.push(" ", path.call(print, "argument"));

      return concat(parts);
    case "ModuleDeclaration":
      parts.push("module", path.call(print, "id"));

      if (n.source) {
        assert.ok(!n.body);

        parts.push("from", path.call(print, "source"));
      } else {
        parts.push(path.call(print, "body"));
      }

      return join(" ", parts);
    case "ImportSpecifier":
      if (n.imported) {
        if (n.importKind) {
          parts.push(path.call(print, "importKind"), " ");
        }

        parts.push(path.call(print, "imported"));

        if (n.local && n.local.name !== n.imported.name) {
          parts.push(" as ", path.call(print, "local"));
        }
      } else if (n.id) {
        parts.push(path.call(print, "id"));

        if (n.name) {
          parts.push(" as ", path.call(print, "name"));
        }
      }

      return concat(parts);
    case "ExportSpecifier":
      if (n.local) {
        parts.push(path.call(print, "local"));

        if (n.exported && n.exported.name !== n.local.name) {
          parts.push(" as ", path.call(print, "exported"));
        }
      } else if (n.id) {
        parts.push(path.call(print, "id"));

        if (n.name) {
          parts.push(" as ", path.call(print, "name"));
        }
      }

      return concat(parts);
    case "ExportBatchSpecifier":
      return "*";
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
    case "ExportDeclaration":
    case "ExportDefaultDeclaration":
    case "ExportNamedDeclaration":
      return printExportDeclaration(path, options, print);
    case "ExportAllDeclaration":
      parts.push("export *");

      if (n.exported) {
        parts.push(" as ", path.call(print, "exported"));
      }

      parts.push(" from ", path.call(print, "source"), semi);

      return concat(parts);
    case "ExportNamespaceSpecifier":
    case "ExportDefaultSpecifier":
      return path.call(print, "exported");
    case "ImportDeclaration":
      parts.push("import ");

      const fromParts = [];

      if (n.importKind && n.importKind !== "value") {
        parts.push(n.importKind + " ");
      }

      var standalones = [];
      var grouped = [];
      if (n.specifiers && n.specifiers.length > 0) {
        path.each(function(specifierPath) {
          var value = specifierPath.getValue();
          if (
            namedTypes.ImportDefaultSpecifier.check(value) ||
            namedTypes.ImportNamespaceSpecifier.check(value)
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

        if (grouped.length > 0) {
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

        fromParts.push(grouped.length === 0 ? line : " ", "from ");
      } else if (n.importKind && n.importKind === "type") {
        parts.push("{} from ");
      }

      fromParts.push(path.call(print, "source"), semi);

      // If there's a very long import, break the following way:
      //
      //   import veryLong
      //     from 'verylong'
      //
      // In case there are grouped elements, they will already break the way
      // we want and this break would take precedence instead.
      if (grouped.length === 0) {
        return group(concat([concat(parts), indent(concat(fromParts))]));
      }

      return concat([concat(parts), concat(fromParts)]);

    case "Import": {
      return "import";
    }
    case "BlockStatement": {
      var naked = path.call(function(bodyPath) {
        return printStatementSequence(bodyPath, options, print);
      }, "body");

      const hasContent = n.body.find(node => node.type !== "EmptyStatement");
      const hasDirectives = n.directives && n.directives.length > 0;

      var parent = path.getParentNode();
      const parentParent = path.getParentNode(1);
      if (
        !hasContent &&
        !hasDirectives &&
        !n.comments &&
        (parent.type === "ArrowFunctionExpression" ||
          parent.type === "FunctionExpression" ||
          parent.type === "FunctionDeclaration" ||
          parent.type === "ObjectMethod" ||
          parent.type === "ClassMethod" ||
          (parent.type === "CatchClause" && !parentParent.finalizer))
      ) {
        return "{}";
      }

      parts.push("{");

      // Babel 6
      if (hasDirectives) {
        path.each(function(childPath) {
          parts.push(indent(concat([hardline, print(childPath), semi])));
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
              indent(concat([softline, path.call(print, "argument")])),
              line,
              ")"
            ])
          );
        } else if (
          n.argument.type === "LogicalExpression" ||
          n.argument.type === "BinaryExpression"
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

      const hasDanglingComments =
        n.comments &&
        n.comments.some(comment => !comment.leading && !comment.trailing);

      if (hasDanglingComments) {
        parts.push(
          " ",
          comments.printDanglingComments(path, options, /* sameIndent */ true)
        );
      }

      parts.push(semi);

      return concat(parts);
    case "CallExpression": {
      if (
        // We want to keep require calls as a unit
        (n.callee.type === "Identifier" && n.callee.name === "require") ||
        // Keep test declarations on a single line
        // e.g. `it('long name', () => {`
        (n.callee.type === "Identifier" &&
          (n.callee.name === "it" ||
            n.callee.name === "test" ||
            n.callee.name === "describe") &&
          n.arguments.length === 2 &&
          (n.arguments[0].type === "StringLiteral" ||
            n.arguments[0].type === "TemplateLiteral" ||
            (n.arguments[0].type === "Literal" &&
              typeof n.arguments[0].value === "string")) &&
          (n.arguments[1].type === "FunctionExpression" ||
            n.arguments[1].type === "ArrowFunctionExpression") &&
          n.arguments[1].params.length <= 1)
      ) {
        return concat([
          path.call(print, "callee"),
          path.call(print, "typeParameters"),
          concat(["(", join(", ", path.map(print, "arguments")), ")"])
        ]);
      }

      // We detect calls on member lookups and possibly print them in a
      // special chain format. See `printMemberChain` for more info.
      if (n.callee.type === "MemberExpression") {
        return printMemberChain(path, options, print);
      }

      return concat([
        path.call(print, "callee"),
        path.call(print, "typeParameters"),
        printArgumentsList(path, options, print)
      ]);
    }

    case "ObjectExpression":
    case "ObjectPattern":
    case "ObjectTypeAnnotation":
    case "TSTypeLiteral":
      var isTypeAnnotation = n.type === "ObjectTypeAnnotation";
      var isTypeScriptTypeAnnotaion = n.type === "TSTypeLiteral";
      // Leave this here because we *might* want to make this
      // configurable later -- flow accepts ";" for type separators,
      // typescript accepts ";" and newlines
      var separator = isTypeAnnotation ? "," : ",";
      var fields = [];
      var leftBrace = n.exact ? "{|" : "{";
      var rightBrace = n.exact ? "|}" : "}";
      var parent = path.getParentNode(0);
      var parentIsUnionTypeAnnotation = parent.type === "UnionTypeAnnotation";
      var propertiesField = isTypeScriptTypeAnnotaion
        ? "members"
        : "properties";

      if (isTypeAnnotation) {
        fields.push("indexers", "callProperties");
      }

      fields.push(propertiesField);

      var props = [];
      let separatorParts = [];

      fields.forEach(function(field) {
        path.each(function(childPath) {
          props.push(concat(separatorParts));
          props.push(group(print(childPath)));

          separatorParts = [separator, line];
          if (
            util.isNextLineEmpty(options.originalText, childPath.getValue())
          ) {
            separatorParts.push(hardline);
          }
        }, field);
      });

      const lastElem = util.getLast(n[propertiesField]);

      const canHaveTrailingComma = !(
        lastElem &&
        (lastElem.type === "RestProperty" || lastElem.type === "RestElement")
      );

      const shouldBreak =
        n.type !== "ObjectPattern" &&
        util.hasNewlineInRange(
          options.originalText,
          util.locStart(n),
          util.locEnd(n)
        );

      if (props.length === 0) {
        return group(
          concat([
            leftBrace,
            comments.printDanglingComments(path, options),
            softline,
            rightBrace
          ])
        );
      } else {
        return group(
          concat([
            leftBrace,
            indent(
              align(
                parentIsUnionTypeAnnotation ? 2 : 0,
                concat([
                  options.bracketSpacing ? line : softline,
                  concat(props)
                ])
              )
            ),
            ifBreak(
              canHaveTrailingComma && shouldPrintComma(options) ? "," : ""
            ),
            align(
              parentIsUnionTypeAnnotation ? 2 : 0,
              concat([options.bracketSpacing ? line : softline, rightBrace])
            ),
            path.call(print, "typeAnnotation")
          ]),
          { shouldBreak }
        );
      }

    case "PropertyPattern":
      return concat([
        path.call(print, "key"),
        ": ",
        path.call(print, "pattern")
      ]);
    // Babel 6
    case "ObjectProperty": // Non-standard AST node type.
    case "Property":
      if (n.method || n.kind === "get" || n.kind === "set") {
        return printMethod(path, options, print);
      }

      if (n.shorthand) {
        parts.push(path.call(print, "value"));
      } else {
        if (n.computed) {
          parts.push("[", path.call(print, "key"), "]");
        } else {
          parts.push(printPropertyKey(path, options, print));
        }
        parts.push(concat([": ", path.call(print, "value")]));
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
      return concat(["@", path.call(print, "expression")]);
    case "ArrayExpression":
    case "ArrayPattern":
      if (n.elements.length === 0) {
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
      } else {
        const lastElem = util.getLast(n.elements);
        const canHaveTrailingComma = !(lastElem &&
          lastElem.type === "RestElement");

        // JavaScript allows you to have empty elements in an array which
        // changes its length based on the number of commas. The algorithm
        // is that if the last argument is null, we need to force insert
        // a comma to ensure JavaScript recognizes it.
        //   [,].length === 1
        //   [1,].length === 1
        //   [1,,].length === 2
        //
        // Note that util.getLast returns null if the array is empty, but
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

      if (n.typeAnnotation) parts.push(path.call(print, "typeAnnotation"));

      return concat(parts);
    case "SequenceExpression":
      return join(", ", path.map(print, "expressions"));
    case "ThisExpression":
      return "this";
    case "Super":
      return "super";
    // Babel 6 Literal split
    case "NullLiteral":
      return "null";
    // Babel 6 Literal split
    case "RegExpLiteral":
      return printRegex(n);
    // Babel 6 Literal split
    case "NumericLiteral":
      return printNumber(n.extra.raw);
    // Babel 6 Literal split
    case "BooleanLiteral":
    // Babel 6 Literal split
    case "StringLiteral":
    case "Literal":
      if (typeof n.value === "number") return printNumber(n.raw);
      if (n.regex) return printRegex(n.regex);
      if (typeof n.value !== "string") return "" + n.value;

      return nodeStr(n, options); // Babel 6
    case "Directive":
      return path.call(print, "value"); // Babel 6
    case "DirectiveLiteral":
      return nodeStr(n, options);
    case "ModuleSpecifier":
      if (n.local) {
        throw new Error("The ESTree ModuleSpecifier type should be abstract");
      }

      // The Esprima ModuleSpecifier type is just a string-valued
      // Literal identifying the imported-from module.
      return nodeStr(n, options);
    case "UnaryExpression":
      parts.push(n.operator);

      if (/[a-z]$/.test(n.operator)) parts.push(" ");

      parts.push(path.call(print, "argument"));

      return concat(parts);
    case "UpdateExpression":
      parts.push(path.call(print, "argument"), n.operator);

      if (n.prefix) parts.reverse();

      return concat(parts);
    case "ConditionalExpression":
      return group(
        concat([
          path.call(print, "test"),
          indent(
            concat([
              line,
              "? ",
              align(2, path.call(print, "consequent")),
              line,
              ": ",
              align(2, path.call(print, "alternate"))
            ])
          )
        ])
      );
    case "NewExpression":
      parts.push("new ", path.call(print, "callee"));

      if (n.typeParameters) {
        parts.push(path.call(print, "typeParameters"));
      }

      var args = n.arguments;

      if (args) {
        parts.push(printArgumentsList(path, options, print));
      }

      return concat(parts);
    case "VariableDeclaration":
      var printed = path.map(function(childPath) {
        return print(childPath);
      }, "declarations");

      parts = [
        n.kind,
        " ",
        printed[0],
        indent(concat(printed.slice(1).map(p => concat([",", line, p]))))
      ];

      // We generally want to terminate all variable declarations with a
      // semicolon, except when they in the () part of for loops.
      var parentNode = path.getParentNode();

      var isParentForLoop =
        namedTypes.ForStatement.check(parentNode) ||
        namedTypes.ForInStatement.check(parentNode) ||
        (namedTypes.ForOfStatement &&
          namedTypes.ForOfStatement.check(parentNode)) ||
        (namedTypes.ForAwaitStatement &&
          namedTypes.ForAwaitStatement.check(parentNode));

      if (!(isParentForLoop && parentNode.body !== n)) {
        parts.push(semi);
      }

      return group(concat(parts));
    case "VariableDeclarator":
      return printAssignment(
        n.id,
        path.call(print, "id"),
        "=",
        n.init,
        n.init && path.call(print, "init"),
        options
      );
    case "WithStatement":
      return concat([
        "with (",
        path.call(print, "object"),
        ")",
        adjustClause(n.body, path.call(print, "body"))
      ]);
    case "IfStatement":
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
        if (n.consequent.type === "BlockStatement") {
          parts.push(" else");
        } else {
          parts.push(hardline, "else");
        }

        parts.push(
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
        return concat([printedComments, "for (;;)", body]);
      }

      return concat([
        printedComments,
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
      ]);
    }
    case "WhileStatement":
      return concat([
        "while (",
        group(
          concat([
            indent(concat([softline, path.call(print, "test")])),
            softline
          ])
        ),
        ")",
        adjustClause(n.body, path.call(print, "body"))
      ]);
    case "ForInStatement":
      // Note: esprima can't actually parse "for each (".
      return concat([
        n.each ? "for each (" : "for (",
        path.call(print, "left"),
        " in ",
        path.call(print, "right"),
        ")",
        adjustClause(n.body, path.call(print, "body"))
      ]);

    case "ForOfStatement":
    case "ForAwaitStatement":
      // Babylon 7 removed ForAwaitStatement in favor of ForOfStatement
      // with `"await": true`:
      // https://github.com/estree/estree/pull/138
      const isAwait = n.type === "ForAwaitStatement" || n.await;

      return concat([
        "for",
        isAwait ? " await" : "",
        " (",
        path.call(print, "left"),
        " of ",
        path.call(print, "right"),
        ")",
        adjustClause(n.body, path.call(print, "body"))
      ]);

    case "DoWhileStatement":
      var clause = adjustClause(n.body, path.call(print, "body"));
      var doBody = concat(["do", clause]);
      var parts = [doBody];

      if (n.body.type === "BlockStatement") {
        parts.push(" ");
      } else {
        parts.push(hardline);
      }
      parts.push("while");

      parts.push(" (", path.call(print, "test"), ")", semi);

      return concat(parts);
    case "DoExpression":
      return concat(["do ", path.call(print, "body")]);
    case "BreakStatement":
      parts.push("break");

      if (n.label) parts.push(" ", path.call(print, "label"));

      parts.push(semi);

      return concat(parts);
    case "ContinueStatement":
      parts.push("continue");

      if (n.label) parts.push(" ", path.call(print, "label"));

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
      parts.push("try ", path.call(print, "block"));

      if (n.handler) {
        parts.push(" ", path.call(print, "handler"));
      } else if (n.handlers) {
        path.each(function(handlerPath) {
          parts.push(" ", print(handlerPath));
        }, "handlers");
      }

      if (n.finalizer) {
        parts.push(" finally ", path.call(print, "finalizer"));
      }

      return concat(parts);
    case "CatchClause":
      parts.push("catch (", path.call(print, "param"));

      if (n.guard)
        // Note: esprima does not recognize conditional catch clauses.
        parts.push(" if ", path.call(print, "guard"));

      parts.push(") ", path.call(print, "body"));

      return concat(parts);
    case "ThrowStatement":
      return concat(["throw ", path.call(print, "argument"), semi]);
    // Note: ignoring n.lexical because it has no printing consequences.
    case "SwitchStatement":
      return concat([
        "switch (",
        path.call(print, "discriminant"),
        ") {",
        n.cases.length > 0
          ? indent(concat([hardline, join(hardline, path.map(print, "cases"))]))
          : "",
        hardline,
        "}"
      ]);
    case "SwitchCase":
      if (n.test) parts.push("case ", path.call(print, "test"), ":");
      else parts.push("default:");

      const isFirstCase = path.getNode() === path.getParentNode().cases[0];

      if (
        !isFirstCase &&
        util.isPreviousLineEmpty(options.originalText, path.getValue())
      ) {
        parts.unshift(hardline);
      }

      if (n.consequent.find(node => node.type !== "EmptyStatement")) {
        const cons = path.call(consequentPath => {
          return join(
            hardline,
            consequentPath
              .map((p, i) => {
                if (n.consequent[i].type === "EmptyStatement") {
                  return null;
                }
                const shouldAddLine =
                  i !== n.consequent.length - 1 &&
                  util.isNextLineEmpty(options.originalText, p.getValue());
                return concat([print(p), shouldAddLine ? hardline : ""]);
              })
              .filter(e => e !== null)
          );
        }, "consequent");
        parts.push(
          n.consequent.length === 1 && n.consequent[0].type === "BlockStatement"
            ? concat([" ", cons])
            : indent(concat([hardline, cons]))
        );
      }

      return concat(parts);
    // JSX extensions below.
    case "DebuggerStatement":
      return concat(["debugger", semi]);
    case "JSXAttribute":
      parts.push(path.call(print, "name"));

      if (n.value) {
        let res;
        if (
          (n.value.type === "StringLiteral" || n.value.type === "Literal") &&
          typeof n.value.value === "string"
        ) {
          const value = n.value.extra ? n.value.extra.raw : n.value.raw;
          res =
            '"' +
            value.slice(1, value.length - 1).replace(/"/g, "&quot;") +
            '"';
        } else {
          res = path.call(print, "value");
        }
        parts.push("=", res);
      }

      return concat(parts);
    case "JSXIdentifier":
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
    case "JSXSpreadAttribute":
      return concat(["{...", path.call(print, "argument"), "}"]);
    case "JSXExpressionContainer": {
      const parent = path.getParentNode(0);

      const shouldInline =
        n.expression.type === "ArrayExpression" ||
        n.expression.type === "ObjectExpression" ||
        n.expression.type === "ArrowFunctionExpression" ||
        n.expression.type === "CallExpression" ||
        n.expression.type === "FunctionExpression" ||
        n.expression.type === "JSXEmptyExpression" ||
        n.expression.type === "TemplateLiteral" ||
        n.expression.type === "TaggedTemplateExpression" ||
        (parent.type === "JSXElement" &&
          (n.expression.type === "ConditionalExpression" ||
            isBinaryish(n.expression)));

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
    case "JSXElement": {
      const elem = printJSXElement(path, options, print);
      return maybeWrapJSXElementInParens(path, elem, options);
    }
    case "JSXOpeningElement": {
      const n = path.getValue();

      // don't break up opening elements with a single long text attribute
      if (
        n.attributes.length === 1 &&
        n.attributes[0].value &&
        (n.attributes[0].value.type === "Literal" ||
          n.attributes[0].value.type === "StringLiteral") &&
        typeof n.attributes[0].value.value === "string"
      ) {
        return group(
          concat([
            "<",
            path.call(print, "name"),
            " ",
            concat(path.map(print, "attributes")),
            n.selfClosing ? " />" : ">"
          ])
        );
      }

      return group(
        concat([
          "<",
          path.call(print, "name"),
          concat([
            indent(
              concat(
                path.map(attr => concat([line, print(attr)]), "attributes")
              )
            ),
            n.selfClosing ? line : options.jsxBracketSameLine ? ">" : softline
          ]),
          n.selfClosing ? "/>" : options.jsxBracketSameLine ? "" : ">"
        ])
      );
    }
    case "JSXClosingElement":
      return concat(["</", path.call(print, "name"), ">"]);
    case "JSXText":
      throw new Error("JSXTest should be handled by JSXElement");
    case "JSXEmptyExpression":
      const requiresHardline = n.comments && n.comments.some(
        comment => comment.type === "Line" || comment.type === "CommentLine"
      );

      return concat([
        comments.printDanglingComments(
          path,
          options,
          /* sameIndent */ !requiresHardline
        ),
        requiresHardline ? hardline : ""
      ]);
    case "TypeAnnotatedIdentifier":
      return concat([
        path.call(print, "annotation"),
        " ",
        path.call(print, "identifier")
      ]);
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
                path.call(function(bodyPath) {
                  return printStatementSequence(bodyPath, options, print);
                }, "body")
              ])
            )
          : comments.printDanglingComments(path, options),
        hardline,
        "}"
      ]);
    case "ClassPropertyDefinition":
      parts.push("static ", path.call(print, "definition"));

      if (!namedTypes.MethodDefinition.check(n.definition)) parts.push(semi);

      return concat(parts);
    case "ClassProperty":
      if (n.static) parts.push("static ");

      var key;

      if (n.computed) {
        key = concat(["[", path.call(print, "key"), "]"]);
      } else {
        key = printPropertyKey(path, options, print);

        var variance = getFlowVariance(n, options);

        if (variance) {
          key = concat([variance, key]);
        } else if (n.accessibility === "public") {
          key = concat(["public ", key]);
        } else if (n.accessibility === "protected") {
          key = concat(["protected ", key]);
        } else if (n.accessibility === "private") {
          key = concat(["private ", key]);
        }
      }

      parts.push(key);

      if (n.typeAnnotation) parts.push(path.call(print, "typeAnnotation"));

      if (n.value) parts.push(" = ", path.call(print, "value"));

      parts.push(semi);

      return concat(parts);
    case "ClassDeclaration":
    case "ClassExpression":
      return concat(printClass(path, options, print));
    case "TemplateElement":
      return join(literalline, n.value.raw.split("\n"));
    case "TemplateLiteral":
      var expressions = path.map(print, "expressions");

      parts.push("`");

      path.each(function(childPath) {
        var i = childPath.getName();

        parts.push(print(childPath));

        if (i < expressions.length) {
          parts.push(
            "${",
            removeLines(expressions[i]),
            lineSuffixBoundary,
            "}"
          );
        }
      }, "quasis");

      parts.push("`");

      return concat(parts);
    // These types are unprintable because they serve as abstract
    // supertypes for other (printable) types.
    case "TaggedTemplateExpression":
      return concat([path.call(print, "tag"), path.call(print, "quasi")]);
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
    // Supertype of Block and Line.
    case "Comment":
    // Flow
    case "MemberTypeAnnotation": // Flow
    case "Type":
      throw new Error("unprintable type: " + JSON.stringify(n.type));
    // Type Annotations for Facebook Flow, typically stripped out or
    // transformed away before printing.
    case "TypeAnnotation":
      if (n.typeAnnotation) {
        if (
          n.typeAnnotation.type !== "FunctionTypeAnnotation" &&
          !shouldTypeScriptTypeAvoidColon(path) &&
          // TypeScript should not have a colon before type parameter constraints
          !(path.getParentNode().type === "TypeParameter" &&
            path.getParentNode().constraint) &&
          // TypeScript should not have a colon in TSFirstTypeNode nodes
          // `a is number`
          !(path.getParentNode().type === "TypeAnnotation" &&
           path.getParentNode().typeAnnotation.type === 'TSFirstTypeNode')
        ) {
          parts.push(": ");
        }

        parts.push(path.call(print, "typeAnnotation"));

        return concat(parts);
      }

      return "";
    case "TSTupleType":
    case "TupleTypeAnnotation":
      let typesField = n.type === "TSTupleType" ? "elementTypes" : "types";
      return group(
        concat([
          "[",
          indent(
            concat([
              softline,
              printArrayItems(path, options, typesField, print)
            ])
          ),
          ifBreak(shouldPrintComma(options) ? "," : ""),
          comments.printDanglingComments(path, options, /* sameIndent */ true),
          softline,
          "]"
        ])
      );

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
          printFunctionDeclaration(path, print, options)
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
        path.call(print, "typeAnnotation"),
        semi
      ]);
    case "DeclareVariable":
      return printFlowDeclaration(path, ["var ", path.call(print, "id"), semi]);
    case "DeclareExportAllDeclaration":
      return concat(["declare export * from ", path.call(print, "source")]);
    case "DeclareExportDeclaration":
      return concat(["declare ", printExportDeclaration(path, options, print)]);
    case "FunctionTypeAnnotation":
    case "TSFunctionType":
      // FunctionTypeAnnotation is ambiguous:
      // declare function foo(a: B): void; OR
      // var A: (a: B) => void;
      var parent = path.getParentNode(0);
      var parentParent = path.getParentNode(1);
      var isArrowFunctionTypeAnnotation =
        n.type === "TSFunctionType" ||
        !((!getFlowVariance(parent, options) &&
          !parent.optional &&
          namedTypes.ObjectTypeProperty.check(parent)) ||
          namedTypes.ObjectTypeCallProperty.check(parent) ||
          namedTypes.DeclareFunction.check(path.getParentNode(2)));

      var needsColon =
        isArrowFunctionTypeAnnotation &&
        namedTypes.TypeAnnotation.check(parent);

      // Sadly we can't put it inside of FastPath::needsColon because we are
      // printing ":" as part of the expression and it would put parenthesis
      // around :(
      const needsParens =
        needsColon &&
        isArrowFunctionTypeAnnotation &&
        parent.type === "TypeAnnotation" &&
        parentParent.type === "ArrowFunctionExpression";

      if (isObjectTypePropertyAFunction(parent)) {
        isArrowFunctionTypeAnnotation = true;
        needsColon = true;
      }

      if (needsColon) {
        parts.push(": ");
      }
      if (needsParens) {
        parts.push("(");
      }

      parts.push(path.call(print, "typeParameters"));

      parts.push(printFunctionParams(path, print, options));

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
    case "FunctionTypeParam":
      return concat([
        path.call(print, "name"),
        n.optional ? "?" : "",
        n.name ? ": " : "",
        path.call(print, "typeAnnotation")
      ]);
    case "GenericTypeAnnotation":
      return concat([
        path.call(print, "id"),
        path.call(print, "typeParameters")
      ]);
    case "DeclareInterface":
    case "InterfaceDeclaration": {
      if (
        n.type === "DeclareInterface" ||
        isFlowNodeStartingWithDeclare(n, options)
      ) {
        parts.push("declare ");
      }

      parts.push(
        "interface ",
        path.call(print, "id"),
        path.call(print, "typeParameters")
      );

      if (n["extends"].length > 0) {
        parts.push(
          group(
            indent(
              concat([line, "extends ", join(", ", path.map(print, "extends"))])
            )
          )
        );
      }

      parts.push(" ");
      parts.push(path.call(print, "body"));

      return group(concat(parts));
    }
    case "ClassImplements":
    case "InterfaceExtends":
      return concat([
        path.call(print, "id"),
        path.call(print, "typeParameters")
      ]);
    case "IntersectionTypeAnnotation": {
      const types = path.map(print, "types");
      const result = [];
      for (let i = 0; i < types.length; ++i) {
        if (i === 0) {
          result.push(types[i]);
        } else if (
          n.types[i - 1].type !== "ObjectTypeAnnotation" &&
          n.types[i].type !== "ObjectTypeAnnotation"
        ) {
          // If no object is involved, go to the next line if it breaks
          result.push(indent(concat([" &", line, types[i]])));
        } else {
          // If you go from object to non-object or vis-versa, then inline it
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
      // If there's a leading comment, the parent is doing the indentation
      const shouldIndent = !(parent.type === "TypeAlias" &&
        hasLeadingOwnLineComment(options.originalText, n));

      //const token = isIntersection ? "&" : "|";
      const code = concat([
        ifBreak(concat([shouldIndent ? line : "", "| "])),
        join(concat([line, "| "]), path.map(print, "types"))
      ]);

      return group(shouldIndent ? indent(code) : code);
    }
    case "NullableTypeAnnotation":
      return concat(["?", path.call(print, "typeAnnotation")]);
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
    case "ObjectTypeIndexer":
      var variance = getFlowVariance(n, options);
      return concat([
        variance || "",
        "[",
        path.call(print, "id"),
        n.id ? ": " : "",
        path.call(print, "key"),
        "]: ",
        path.call(print, "value")
      ]);
    case "ObjectTypeProperty":
      var variance = getFlowVariance(n, options);
      // TODO: This is a bad hack and we need a better way to know
      // when to emit an arrow function or not.
      var isFunction =
        !variance && !n.optional && n.value.type === "FunctionTypeAnnotation";

      if (isObjectTypePropertyAFunction(n)) {
        isFunction = true;
      }

      return concat([
        n.static ? "static " : "",
        variance || "",
        path.call(print, "key"),
        n.optional ? "?" : "",
        isFunction ? "" : ": ",
        path.call(print, "value")
      ]);
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
      } else {
        return printNumber(n.raw);
      }
    case "StringTypeAnnotation":
      return "string";
    case "DeclareTypeAlias":
    case "TypeAlias": {
      if (
        n.type === "DeclareTypeAlias" ||
        isFlowNodeStartingWithDeclare(n, options)
      ) {
        parts.push("declare ");
      }

      parts.push(
        "type ",
        path.call(print, "id"),
        path.call(print, "typeParameters"),
        " =",
        hasLeadingOwnLineComment(options.originalText, n.right)
          ? indent(concat([hardline, path.call(print, "right")]))
          : concat([" ", path.call(print, "right")]),
        semi
      );

      return concat(parts);
    }
    case "TypeCastExpression":
      return concat([
        "(",
        path.call(print, "expression"),
        path.call(print, "typeAnnotation"),
        ")"
      ]);
    case "TypeParameterDeclaration":
    case "TypeParameterInstantiation": {
      const shouldInline =
        n.params.length === 1 && n.params[0].type === "ObjectTypeAnnotation";

      if (shouldInline) {
        return concat(["<", join(", ", path.map(print, "params")), ">"]);
      }

      return group(
        concat([
          "<",
          indent(
            concat([
              softline,
              join(concat([",", line]), path.map(print, "params"))
            ])
          ),
          softline,
          ">"
        ])
      );
    }
    case "TypeParameter":
      var variance = getFlowVariance(n, options);

      if (variance) {
        parts.push(variance);
      }

      parts.push(path.call(print, "name"));

      if (n.bound) {
        parts.push(path.call(print, "bound"));
      }

      if (n.constraint) {
        parts.push(" extends ", path.call(print, "constraint"));
      }

      if (n["default"]) {
        parts.push("=", path.call(print, "default"));
      }

      return concat(parts);
    case "TypeofTypeAnnotation":
      return concat(["typeof ", path.call(print, "argument")]);
    case "VoidTypeAnnotation":
      return "void";
    case "NullTypeAnnotation":
      return "null";
    case "InferredPredicate":
      return "%checks";
    // Unhandled types below. If encountered, nodes of these types should
    // be either left alone or desugared into AST types that are fully
    // supported by the pretty-printer.
    case "DeclaredPredicate":
      return concat(["%checks(", path.call(print, "value"), ")"]);
    case "TSAnyKeyword":
      return "any";
    case "TSBooleanKeyword":
      return "boolean";
    case "TSNumberKeyword":
      return "number";
    case "TSObjectKeyword":
      return "object";
    case "TSStringKeyword":
      return "string";
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
    case "TSPropertySignature":
      parts.push(path.call(print, "name"));
      parts.push(path.call(print, "typeAnnotation"));

      return concat(parts);
    case "TSTypeReference":
      return concat([path.call(print, "typeName")]);
    case "TSCallSignature":
      return concat([
        "(",
        join(", ", path.map(print, "parameters")),
        "): ",
        path.call(print, "typeAnnotation")
      ]);
    case "TSConstructSignature":
      return concat([
        "new (",
        join(", ", path.map(print, "parameters")),
        "): ",
        path.call(print, "typeAnnotation")
      ]);
    case "TSTypeQuery":
      return concat(["typeof ", path.call(print, "exprName")]);
    case "TSParenthesizedType":
      return concat(["(", path.call(print, "typeAnnotation"), ")"]);
    case "TSIndexSignature":
      return concat([
        "[",
        // This should only contain a single element, however TypeScript parses
        // it using parseDelimitedList that uses commas as delimiter.
        join(", ", path.map(print, "parameters")),
        "]: ",
        path.call(print, "typeAnnotation")
      ]);
    case "TSFirstTypeNode":
      return concat([n.parameterName.name, " is ", path.call(print, "typeAnnotation")])
    // TODO
    case "ClassHeritage":
    // TODO
    case "ComprehensionBlock":
    // TODO
    case "ComprehensionExpression":
    // TODO
    case "Glob":
    // TODO
    case "GeneratorExpression":
    // TODO
    case "LetStatement":
    // TODO
    case "LetExpression":
    // TODO
    case "GraphExpression":
    // TODO
    // XML types that nobody cares about or needs to print.
    case "GraphIndexExpression":
    case "XMLDefaultDeclaration":
    case "XMLAnyName":
    case "XMLQualifiedIdentifier":
    case "XMLFunctionQualifiedIdentifier":
    case "XMLAttributeSelector":
    case "XMLFilterExpression":
    case "XML":
    case "XMLElement":
    case "XMLList":
    case "XMLEscape":
    case "XMLText":
    case "XMLStartTag":
    case "XMLEndTag":
    case "XMLPointTag":
    case "XMLName":
    case "XMLAttribute":
    case "XMLCdata":
    case "XMLComment":
    case "XMLProcessingInstruction":
    default:
      debugger;
      throw new Error("unknown type: " + JSON.stringify(n.type));
  }
}

function printStatementSequence(path, options, print) {
  let printed = [];

  const bodyNode = path.getNode();
  const isClass = bodyNode.type === "ClassBody";

  path.map((stmtPath, i) => {
    var stmt = stmtPath.getValue();

    // Just in case the AST has been modified to contain falsy
    // "statements," it's safer simply to skip them.
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
    if (!options.semi && !isClass && stmtNeedsASIProtection(stmtPath)) {
      if (
        stmt.comments &&
        stmt.comments.some(comment => comment.leading)
      ) {
        // Note: stmtNeedsASIProtection requires stmtPath to already be printed
        // as it reads needsParens which is mutated on the instance
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

    if (util.isNextLineEmpty(text, stmt) && !isLastStatement(stmtPath)) {
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
    (key.type === "StringLiteral" ||
      (key.type === "Literal" && typeof key.value === "string")) &&
    isIdentifierName(key.value) &&
    !node.computed &&
    // There's a bug in the flow parser where it throws if there are
    // unquoted unicode literals as keys. Let's quote them for now.
    (options.parser !== "flow" || key.value.match(/[a-zA-Z0-9$_]/))
  ) {
    // 'a' -> a
    return path.call(
      keyPath => comments.printComments(keyPath, p => key.value, options),
      "key"
    );
  }
  return path.call(print, "key");
}

function printMethod(path, options, print) {
  var node = path.getNode();
  var kind = node.kind;
  var parts = [];

  if (node.type === "ObjectMethod" || node.type === "ClassMethod") {
    node.value = node;
  } else {
    namedTypes.FunctionExpression.assert(node.value);
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

  var key = printPropertyKey(path, options, print);

  if (node.computed) {
    key = concat(["[", key, "]"]);
  }

  parts.push(
    key,
    path.call(print, "value", "typeParameters"),
    group(
      concat([
        path.call(function(valuePath) {
          return printFunctionParams(valuePath, print, options);
        }, "value"),
        path.call(p => printReturnType(p, print), "value")
      ])
    ),
    " ",
    path.call(print, "value", "body")
  );

  return concat(parts);
}

function couldGroupArg(arg) {
  return (
    (arg.type === "ObjectExpression" && arg.properties.length > 0) ||
    (arg.type === "ArrayExpression" && arg.elements.length > 0) ||
    arg.type === "FunctionExpression" ||
    (arg.type === "ArrowFunctionExpression" &&
      (arg.body.type === "BlockStatement" ||
        arg.body.type === "ArrowFunctionExpression" ||
        arg.body.type === "ObjectExpression" ||
        arg.body.type === "ArrayExpression" ||
        arg.body.type === "CallExpression" ||
        arg.body.type === "JSXElement"))
  );
}

function shouldGroupLastArg(args) {
  const lastArg = util.getLast(args);
  const penultimateArg = util.getPenultimate(args);
  return (
    (!lastArg.comments || !lastArg.comments.length) &&
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
    !couldGroupArg(secondArg)
  );
}

function printArgumentsList(path, options, print) {
  var printed = path.map(print, "arguments");

  if (printed.length === 0) {
    return concat([
      "(",
      comments.printDanglingComments(path, options, /* sameIndent */ true),
      ")"
    ]);
  }

  const args = path.getValue().arguments;
  // This is just an optimization; I think we could return the
  // conditional group for all function calls, but it's more expensive
  // so only do it for specific forms.
  const shouldGroupFirst = shouldGroupFirstArg(args);
  const shouldGroupLast = shouldGroupLastArg(args);
  if (shouldGroupFirst || shouldGroupLast) {
    const shouldBreak = shouldGroupFirst
      ? printed.slice(1).some(willBreak)
      : printed.slice(0, -1).some(willBreak);

    // We want to print the last argument with a special flag
    let printedExpanded;
    let i = 0;
    path.each(function(argPath) {
      if (shouldGroupFirst && i === 0) {
        printedExpanded =
          [argPath.call(p => print(p, { expandFirstArg: true }))]
            .concat(printed.slice(1));
      }
      if (shouldGroupLast && i === args.length - 1) {
        printedExpanded = printed
          .slice(0, -1)
          .concat(argPath.call(p => print(p, { expandLastArg: true })));
      }
      i++;
    }, "arguments");

    return concat([
      printed.some(willBreak) ? breakParent : "",
      conditionalGroup(
        [
          concat(["(", join(concat([", "]), printedExpanded), ")"]),
          shouldGroupFirst
            ? concat([
                "(",
                group(printedExpanded[0], { shouldBreak: true }),
                printed.length > 1 ? ", " : "",
                join(concat([",", line]), printed.slice(1)),
                ")"
              ])
            : concat([
                "(",
                join(concat([",", line]), printed.slice(0, -1)),
                printed.length > 1 ? ", " : "",
                group(util.getLast(printedExpanded), {
                  shouldBreak: true
                }),
                ")"
              ]),
          group(
            concat([
              "(",
              indent(concat([line, join(concat([",", line]), printed)])),
              shouldPrintComma(options, "all") ? "," : "",
              line,
              ")"
            ]),
            { shouldBreak: true }
          )
        ],
        { shouldBreak }
      )
    ]);
  }

  return group(
    concat([
      "(",
      indent(concat([softline, join(concat([",", line]), printed)])),
      ifBreak(shouldPrintComma(options, "all") ? "," : ""),
      softline,
      ")"
    ]),
    { shouldBreak: printed.some(willBreak) }
  );
}

function printFunctionParams(path, print, options, expandArg) {
  var fun = path.getValue();
  // namedTypes.Function.assert(fun);
  var paramsField = fun.type === "TSFunctionType" ? "parameters" : "params";
  var printed = path.map(print, paramsField);

  if (fun.defaults) {
    path.each(function(defExprPath) {
      var i = defExprPath.getName();
      var p = printed[i];

      if (p && defExprPath.getValue()) {
        printed[i] = concat([p, " = ", print(defExprPath)]);
      }
    }, "defaults");
  }

  if (fun.rest) {
    printed.push(concat(["...", path.call(print, "rest")]));
  }

  if (printed.length === 0) {
    return concat([
      "(",
      comments.printDanglingComments(path, options, /* sameIndent */ true),
      ")"
    ]);
  }

  const lastParam = util.getLast(fun[paramsField]);
  const canHaveTrailingComma =
    !(lastParam && lastParam.type === "RestElement") && !fun.rest;

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
  if (expandArg) {
    return group(concat(["(", join(", ", printed.map(removeLines)), ")"]));
  }

  // Single object destructuring should hug
  //
  // function({
  //   a,
  //   b,
  //   c
  // }) {}
  if (
    fun.params &&
    fun.params.length === 1 &&
    !fun.params[0].comments &&
    (fun.params[0].type === "ObjectPattern" ||
      (fun.params[0].type === "FunctionTypeParam" &&
        fun.params[0].typeAnnotation.type === "ObjectTypeAnnotation")) &&
    !fun.rest
  ) {
    return concat(["(", join(", ", printed), ")"]);
  }

  const parent = path.getParentNode();

  const flowTypeAnnotations = [
    "AnyTypeAnnotation",
    "NullLiteralTypeAnnotation",
    "NullableTypeAnnotation",
    "GenericTypeAnnotation",
    "ThisTypeAnnotation",
    "NumberTypeAnnotation",
    "VoidTypeAnnotation",
    "NullTypeAnnotation",
    "EmptyTypeAnnotation",
    "MixedTypeAnnotation",
    "BooleanTypeAnnotation",
    "BooleanLiteralTypeAnnotation",
    "StringLiteralTypeAnnotation",
    "StringTypeAnnotation"
  ];

  const isFlowShorthandWithOneArg =
    (isObjectTypePropertyAFunction(parent) ||
      isTypeAnnotationAFunction(parent) ||
      parent.type === "TypeAlias") &&
    fun[paramsField].length === 1 &&
    fun[paramsField][0].name === null &&
    fun[paramsField][0].typeAnnotation &&
    flowTypeAnnotations.indexOf(fun[paramsField][0].typeAnnotation.type) !== -1 &&
    !fun.rest;

  return concat([
    isFlowShorthandWithOneArg ? "" : "(",
    indent(concat([softline, join(concat([",", line]), printed)])),
    ifBreak(
      canHaveTrailingComma && shouldPrintComma(options, "all") ? "," : ""
    ),
    softline,
    isFlowShorthandWithOneArg ? "" : ")"
  ]);
}

function canPrintParamsWithoutParens(node) {
  return (
    node.params.length === 1 &&
    !node.rest &&
    node.params[0].type === "Identifier" &&
    !node.params[0].typeAnnotation &&
    !node.params[0].comments &&
    !node.params[0].optional &&
    !node.predicate &&
    !node.returnType
  );
}

function printFunctionDeclaration(path, print, options) {
  var n = path.getValue();
  var parts = [];

  if (n.async) parts.push("async ");

  parts.push("function");

  if (n.generator) parts.push("*");

  if (n.id) {
    parts.push(" ", path.call(print, "id"));
  }

  parts.push(
    path.call(print, "typeParameters"),
    group(
      concat([
        printFunctionParams(path, print, options),
        printReturnType(path, print)
      ])
    ),
    " ",
    path.call(print, "body")
  );

  return concat(parts);
}

function printObjectMethod(path, options, print) {
  var objMethod = path.getValue();
  var parts = [];

  if (objMethod.async) parts.push("async ");

  if (objMethod.generator) parts.push("*");

  if (
    objMethod.method || objMethod.kind === "get" || objMethod.kind === "set"
  ) {
    return printMethod(path, options, print);
  }

  var key = printPropertyKey(path, options, print);

  if (objMethod.computed) {
    parts.push("[", key, "]");
  } else {
    parts.push(key);
  }

  if (objMethod.typeParameters) {
    parts.push(path.call(print, "typeParameters"));
  }

  parts.push(
    group(
      concat([
        printFunctionParams(path, print, options),
        printReturnType(path, print)
      ])
    ),
    " ",
    path.call(print, "body")
  );

  return concat(parts);
}

function printReturnType(path, print) {
  const n = path.getValue();
  const parts = [path.call(print, "returnType")];

  if (n.predicate) {
    // The return type will already add the colon, but otherwise we
    // need to do it ourselves
    parts.push(n.returnType ? " " : ": ", path.call(print, "predicate"));
  }

  return concat(parts);
}

function typeIsFunction(type) {
  return (
    type === "FunctionExpression" ||
    type === "ArrowFunctionExpression" ||
    type === "NewExpression"
  );
}

function printExportDeclaration(path, options, print) {
  const decl = path.getValue();
  const semi = options.semi ? ";" : "";
  let parts = ["export "];

  namedTypes.Declaration.assert(decl);

  if (decl["default"] || decl.type === "ExportDefaultDeclaration") {
    parts.push("default ");
  }

  parts.push(
    comments.printDanglingComments(path, options, /* sameIndent */ true)
  );

  if (decl.declaration) {
    parts.push(path.call(print, "declaration"));

    if (
      decl.type === "ExportDefaultDeclaration" &&
      (decl.declaration.type !== "ClassDeclaration" &&
        decl.declaration.type !== "FunctionDeclaration")
    ) {
      parts.push(semi);
    }
  } else {
    if (decl.specifiers && decl.specifiers.length > 0) {
      if (
        decl.specifiers.length === 1 &&
        decl.specifiers[0].type === "ExportBatchSpecifier"
      ) {
        parts.push("*");
      } else {
        let specifiers = [];
        let defaultSpecifiers = [];
        let namespaceSpecifiers = [];

        path.map(specifierPath => {
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
          namespaceSpecifiers.length !== 0 &&
          (specifiers.length !== 0 || defaultSpecifiers.length !== 0);
        const isDefaultFollowed =
          defaultSpecifiers.length !== 0 && specifiers.length !== 0;

        parts.push(
          decl.exportKind === "type" ? "type " : "",
          concat(namespaceSpecifiers),
          concat([isNamespaceFollowed ? ", " : ""]),
          concat(defaultSpecifiers),
          concat([isDefaultFollowed ? ", " : ""]),
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
      }
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
  var parentExportDecl = util.getParentExportDeclaration(path);

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

function getFlowVariance(path, options) {
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
      return variance;
  }
}

function printClass(path, options, print) {
  const n = path.getValue();
  const parts = ["class"];

  if (n.id) {
    parts.push(" ", path.call(print, "id"), path.call(print, "typeParameters"));
  }

  const partsGroup = [];
  if (n.superClass) {
    partsGroup.push(
      line,
      "extends ",
      path.call(print, "superClass"),
      path.call(print, "superTypeParameters")
    );
  } else if (n.extends && n.extends.length > 0) {
    partsGroup.push(line, "extends ", join(", ", path.map(print, "extends")));
  }

  if (n["implements"] && n["implements"].length > 0) {
    partsGroup.push(
      line,
      "implements ",
      join(", ", path.map(print, "implements"))
    );
  }

  if (partsGroup.length > 0) {
    parts.push(group(indent(concat(partsGroup))));
  }

  parts.push(" ", path.call(print, "body"));

  return parts;
}

function printMemberLookup(path, options, print) {
  const property = path.call(print, "property");
  const n = path.getValue();

  return concat(
    n.computed
      ? [
          "[",
          group(concat([indent(concat([softline, property])), softline])),
          "]"
        ]
      : [".", property]
  );
}

// We detect calls on member expressions specially to format a
// comman pattern better. The pattern we are looking for is this:
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

  function rec(path) {
    const node = path.getValue();
    if (node.type === "CallExpression") {
      printedNodes.unshift({
        node: node,
        printed: comments.printComments(
          path,
          p => printArgumentsList(path, options, print),
          options
        )
      });
      path.call(callee => rec(callee), "callee");
    } else if (node.type === "MemberExpression") {
      printedNodes.unshift({
        node: node,
        printed: comments.printComments(
          path,
          p => printMemberLookup(path, options, print),
          options
        )
      });
      path.call(object => rec(object), "object");
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
  printedNodes.unshift({
    node: path.getValue(),
    printed: printArgumentsList(path, options, print)
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
  //   - then, as many MemberExpression as possible but the last one
  //       < this.items >.something()
  var groups = [];
  var currentGroup = [printedNodes[0]];
  var i = 1;
  for (; i < printedNodes.length; ++i) {
    if (printedNodes[i].node.type === "CallExpression") {
      currentGroup.push(printedNodes[i]);
    } else {
      break;
    }
  }
  for (; i + 1 < printedNodes.length; ++i) {
    if (
      printedNodes[i].node.type === "MemberExpression" &&
      printedNodes[i + 1].node.type === "MemberExpression"
    ) {
      currentGroup.push(printedNodes[i]);
    } else {
      break;
    }
  }
  groups.push(currentGroup);
  currentGroup = [];

  // Then, each following group is a sequence of MemberExpression followed by
  // a sequence of CallExpression. To compute it, we keep adding things to the
  // group until we has seen a CallExpression in the past and reach a
  // MemberExpression
  var hasSeenCallExpression = false;
  for (; i < printedNodes.length; ++i) {
    if (
      hasSeenCallExpression && printedNodes[i].node.type === "MemberExpression"
    ) {
      // [0] should be appended at the end of the group instead of the
      // beginning of the next one
      if (printedNodes[i].node.computed) {
        currentGroup.push(printedNodes[i]);
        continue;
      }

      groups.push(currentGroup);
      currentGroup = [];
      hasSeenCallExpression = false;
    }

    if (printedNodes[i].node.type === "CallExpression") {
      hasSeenCallExpression = true;
    }
    currentGroup.push(printedNodes[i]);
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
  // node is just an identifier with the name starting with a capital
  // letter, just a sequence of _$ or this. The rationale is that they are
  // likely to be factories.
  const shouldMerge =
    groups.length >= 2 &&
    !groups[1][0].node.comments &&
    groups[0].length === 1 &&
    (groups[0][0].node.type === "ThisExpression" ||
      (groups[0][0].node.type === "Identifier" &&
        groups[0][0].node.name.match(/(^[A-Z])|^[_$]+$/)));

  function printGroup(printedGroup) {
    return concat(printedGroup.map(tuple => tuple.printed));
  }

  function printIndentedGroup(groups) {
    return indent(
      group(concat([hardline, join(hardline, groups.map(printGroup))]))
    );
  }

  const printedGroups = groups.map(printGroup);
  const oneLine = concat(printedGroups);
  const hasComment =
    (groups.length >= 2 && groups[1][0].node.comments) ||
    (groups.length >= 3 && groups[2][0].node.comments);

  // If we only have a single `.`, we shouldn't do anything fancy and just
  // render everything concatenated together.
  if (
    groups.length <= (shouldMerge ? 3 : 2) &&
    !hasComment &&
    // (a || b).map() should be break before .map() instead of ||
    groups[0][0].node.type !== "LogicalExpression"
  ) {
    return group(oneLine);
  }

  const expanded = concat([
    printGroup(groups[0]),
    shouldMerge ? concat(groups.slice(1, 2).map(printGroup)) : "",
    printIndentedGroup(groups.slice(shouldMerge ? 2 : 1))
  ]);

  // If there's a comment, we don't want to print in one line.
  if (hasComment) {
    return group(expanded);
  }

  // If any group but the last one has a hard line, we want to force expand
  // it. If the last group is a function it's okay to inline if it fits.
  if (printedGroups.slice(0, -1).some(willBreak)) {
    return group(expanded);
  }

  return concat([
    // We only need to check `oneLine` because if `expanded` is chosen
    // that means that the parent group has already been broken
    // naturally
    willBreak(oneLine) ? breakParent : "",
    conditionalGroup([oneLine, expanded])
  ]);
}

function isEmptyJSXElement(node) {
  if (node.children.length === 0) return true;
  if (node.children.length > 1) return false;

  // if there is one child but it's just a newline, treat as empty
  const value = node.children[0].value;
  if (!/\S/.test(value) && /\n/.test(value)) {
    return true;
  } else {
    return false;
  }
}

// JSX Children are strange, mostly for two reasons:
// 1. JSX reads newlines into string values, instead of skipping them like JS
// 2. up to one whitespace between elements within a line is significant,
//    but not between lines.
//
// So for one thing, '\n' needs to be parsed out of string literals
// and turned into hardlines (with string boundaries otherwise using softline)
//
// For another, leading, trailing, and lone whitespace all need to
// turn themselves into the rather ugly `{' '}` when breaking.
function printJSXChildren(path, options, print, jsxWhitespace) {
  const n = path.getValue();
  const children = [];

  // using `map` instead of `each` because it provides `i`
  path.map(function(childPath, i) {
    const child = childPath.getValue();
    const isLiteral = namedTypes.Literal.check(child);

    if (isLiteral && typeof child.value === "string") {
      // There's a bug in the flow parser where it doesn't unescape the
      // value field. To workaround this, we can use rawValue which is
      // correctly escaped (since it parsed).
      // We really want to use value and re-escape it ourself when possible
      // though.
      const partiallyEscapedValue = options.parser === "flow"
        ? child.raw
        : util.htmlEscapeInsideAngleBracket(child.value);
      const value = partiallyEscapedValue.replace(/\u00a0/g, "&nbsp;");

      if (/\S/.test(value)) {
        // treat each line of text as its own entity
        value.split(/(\r?\n\s*)/).forEach(line => {
          const newlines = line.match(/\n/g);
          if (newlines) {
            children.push(hardline);

            // allow one extra newline
            if (newlines.length > 1) {
              children.push(hardline);
            }
            return;
          }

          const beginSpace = /^\s+/.test(line);
          if (beginSpace) {
            children.push(jsxWhitespace);
            children.push(softline);
          }

          const stripped = line.replace(/^\s+|\s+$/g, "");
          if (stripped) {
            children.push(stripped);
          }

          const endSpace = /\s+$/.test(line);
          if (endSpace) {
            children.push(softline);
            children.push(jsxWhitespace);
          }
        });

        if (!isLineNext(util.getLast(children))) {
          children.push(softline);
        }
      } else if (/\n/.test(value)) {
        children.push(hardline);

        // allow one extra newline
        if (value.match(/\n/g).length > 1) {
          children.push(hardline);
        }
      } else if (/\s/.test(value)) {
        // whitespace-only without newlines,
        // eg; a single space separating two elements
        children.push(jsxWhitespace);
        children.push(softline);
      }
    } else {
      children.push(print(childPath));

      // add a line unless it's followed by a JSX newline
      let next = n.children[i + 1];
      if (!(next && /^\s*\n/.test(next.value))) {
        children.push(softline);
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
  if (isEmptyJSXElement(n)) {
    n.openingElement.selfClosing = true;
    delete n.closingElement;
  }

  const openingLines = path.call(print, "openingElement");
  const closingLines = path.call(print, "closingElement");

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

  // If no children, just print the opening element
  if (n.openingElement.selfClosing) {
    assert.ok(!n.closingElement);
    return openingLines;
  }
  // Record any breaks. Should never go from true to false, only false to true.
  let forcedBreak = willBreak(openingLines);

  const jsxWhitespace = options.singleQuote
    ? ifBreak("{' '}", " ")
    : ifBreak('{" "}', " ");
  const children = printJSXChildren(path, options, print, jsxWhitespace);

  // Trim trailing lines, recording if there was a hardline
  let numTrailingHard = 0;
  while (children.length && isLineNext(util.getLast(children))) {
    if (willBreak(util.getLast(children))) {
      ++numTrailingHard;
      forcedBreak = true;
    }
    children.pop();
  }
  // allow one extra newline
  if (numTrailingHard > 1) {
    children.push(hardline);
  }

  // Trim leading lines, recording if there was a hardline
  let numLeadingHard = 0;
  while (children.length && isLineNext(children[0])) {
    if (willBreak(children[0])) {
      ++numLeadingHard;
      forcedBreak = true;
    }
    children.shift();
  }
  // allow one extra newline
  if (numLeadingHard > 1) {
    children.unshift(hardline);
  }

  // Group by line, recording if there was a hardline.
  let groups = [[]]; // Initialize the first line's group
  children.forEach((child, i) => {
    // leading and trailing JSX whitespace don't go into a group
    if (child === jsxWhitespace) {
      if (i === 0) {
        groups.unshift(child);
        return;
      } else if (i === children.length - 1) {
        groups.push(child);
        return;
      }
    }

    let prev = children[i - 1];
    if (prev && willBreak(prev)) {
      forcedBreak = true;

      // On a new line, so create a new group and put this element in it.
      groups.push([child]);
    } else {
      // Not on a newline, so add this element to the current group.
      util.getLast(groups).push(child);
    }

    // Ensure we record hardline of last element.
    if (!forcedBreak && i === children.length - 1) {
      if (willBreak(child)) forcedBreak = true;
    }
  });

  const childrenGroupedByLine = [
    hardline,
    // Conditional groups suppress break propagation; we want to output
    // hard lines without breaking up the entire jsx element.
    // Note that leading and trailing JSX Whitespace don't go into a group.
    concat(
      groups.map(
        contents =>
          (Array.isArray(contents)
            ? conditionalGroup([concat(contents)])
            : contents)
      )
    )
  ];

  const multiLineElem = group(
    concat([
      openingLines,
      indent(group(concat(childrenGroupedByLine), { shouldBreak: true })),
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

function maybeWrapJSXElementInParens(path, elem, options) {
  const parent = path.getParentNode();
  if (!parent) return elem;

  const NO_WRAP_PARENTS = {
    ArrayExpression: true,
    JSXElement: true,
    JSXExpressionContainer: true,
    ExpressionStatement: true,
    CallExpression: true,
    ConditionalExpression: true,
    LogicalExpression: true
  };
  if (NO_WRAP_PARENTS[parent.type]) {
    return elem;
  }

  return group(
    concat([
      ifBreak("("),
      indent(concat([softline, elem])),
      softline,
      ifBreak(")")
    ])
  );
}

function isBinaryish(node) {
  return node.type === "BinaryExpression" || node.type === "LogicalExpression";
}

function shouldInlineLogicalExpression(node) {
  return (
    node.type === "LogicalExpression" &&
    (node.right.type === "ObjectExpression" ||
      node.right.type === "ArrayExpression")
  );
}

// For binary expressions to be consistent, we need to group
// subsequent operators with the same precedence level under a single
// group. Otherwise they will be nested such that some of them break
// onto new lines but not all. Operators with the same precedence
// level should either all break or not. Because we group them by
// precedence level and the AST is structured based on precedence
// level, things are naturally broken up correctly, i.e. `&&` is
// broken before `+`.
function printBinaryishExpressions(path, print, options, isNested, isInsideParenthesis) {
  let parts = [];
  let node = path.getValue();

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
    if (
      util.getPrecedence(node.left.operator) ===
        util.getPrecedence(node.operator) && node.operator !== "**"
    ) {
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

    const right = concat([
      node.operator,
      shouldInlineLogicalExpression(node) ? " " : line,
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
      parts = comments.printComments(path, p => concat(parts), options);
    }
  } else {
    // Our stopping case. Simply print the node normally.
    parts.push(path.call(print));
  }

  return parts;
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

  let printed;
  if (hasLeadingOwnLineComment(options.originalText, rightNode)) {
    printed = indent(concat([hardline, printedRight]));
  } else if (
    (isBinaryish(rightNode) && !shouldInlineLogicalExpression(rightNode)) ||
    (leftNode.type === "Identifier" || leftNode.type === "MemberExpression") &&
      (rightNode.type === "StringLiteral" ||
        (rightNode.type === "Literal" && typeof rightNode.value === "string") ||
        isMemberExpressionChain(rightNode))
  ) {
    printed = indent(concat([line, printedRight]));
  } else {
    printed = concat([" ", printedRight]);
  }

  return group(concat([printedLeft, " ", operator, printed]));
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

function shouldTypeScriptTypeAvoidColon(path) {
  // As the special TS nodes isn't returned by the node helpers,
  // we use the stack directly to get the parent node.
  const parent = path.stack[path.stack.length - 3];

  switch (parent.type) {
    case "TSFunctionType":
    case "TSIndexSignature":
    case "TSParenthesizedType":
    case "TSCallSignature":
    case "TSConstructSignature":
    case "TSAsExpression":
      return true;
    default:
      return false;
  }
}

function nodeStr(node, options) {
  const str = node.value;
  isString.assert(str);

  // Workaround a bug in the Javascript version of the flow parser where
  // astral unicode characters like \uD801\uDC28 are incorrectly parsed as
  // a sequence of \uFFFD.
  if (options.parser === "flow" && str.indexOf("\ufffd") !== -1) {
    return node.raw;
  }

  const raw = node.extra ? node.extra.raw : node.raw;
  // `rawContent` is the string exactly like it appeared in the input source
  // code, with its enclosing quote.
  const rawContent = raw.slice(1, -1);

  const double = { quote: '"', regex: /"/g };
  const single = { quote: "'", regex: /'/g };

  const preferred = options.singleQuote ? single : double;
  const alternate = preferred === single ? double : single;

  let shouldUseAlternateQuote = false;

  // If `rawContent` contains at least one of the quote preferred for enclosing
  // the string, we might want to enclose with the alternate quote instead, to
  // minimize the number of escaped quotes.
  if (rawContent.includes(preferred.quote)) {
    const numPreferredQuotes = (rawContent.match(preferred.regex) || []).length;
    const numAlternateQuotes = (rawContent.match(alternate.regex) || []).length;

    shouldUseAlternateQuote = numPreferredQuotes > numAlternateQuotes;
  }

  const enclosingQuote = shouldUseAlternateQuote
    ? alternate.quote
    : preferred.quote;

  // It might sound unnecessary to use `makeString` even if `node.raw` already
  // is enclosed with `enclosingQuote`, but it isn't. `node.raw` could contain
  // unnecessary escapes (such as in `"\'"`). Always using `makeString` makes
  // sure that we consistently output the minimum amount of escaped quotes.
  return makeString(rawContent, enclosingQuote);
}

function makeString(rawContent, enclosingQuote) {
  const otherQuote = enclosingQuote === '"' ? "'" : '"';

  // Matches _any_ escape and unescaped quotes (both single and double).
  const regex = /\\([\s\S])|(['"])/g;

  // Escape and unescape single and double quotes as needed to be able to
  // enclose `rawContent` with `enclosingQuote`.
  const newContent = rawContent.replace(regex, (match, escaped, quote) => {
    // If we matched an escape, and the escaped character is a quote of the
    // other type than we intend to enclose the string with, there's no need for
    // it to be escaped, so return it _without_ the backslash.
    if (escaped === otherQuote) {
      return escaped;
    }

    // If we matched an unescaped quote and it is of the _same_ type as we
    // intend to enclose the string with, it must be escaped, so return it with
    // a backslash.
    if (quote === enclosingQuote) {
      return "\\" + quote;
    }

    // Otherwise return the escape or unescaped quote as-is.
    return match;
  });

  return enclosingQuote + newContent + enclosingQuote;
}

function printRegex(node) {
  const flags = node.flags.split('').sort().join('');
  return `/${node.pattern}/${flags}`;
}

function printNumber(rawNumber) {
  return (
    rawNumber
      .toLowerCase()
      // Remove unnecessary plus and zeroes from scientific notation.
      .replace(/^([\d.]+e)(?:\+|(-))?0*(\d)/, "$1$2$3")
      // Remove unnecessary scientific notation (1e0).
      .replace(/^([\d.]+)e[+-]?0+$/, "$1")
      // Make sure numbers always start with a digit.
      .replace(/^\./, "0.")
      // Remove trailing dot.
      .replace(/\.(?=e|$)/, "")
  );
}

function isFirstStatement(path) {
  const parent = path.getParentNode();
  const node = path.getValue();
  const body = parent.body;
  return body && body[0] === node;
}

function isLastStatement(path) {
  const parent = path.getParentNode();
  const node = path.getValue();
  const body = parent.body;
  return body && body[body.length - 1] === node;
}

function hasLeadingOwnLineComment(text, node) {
  const res =
    node.comments &&
    node.comments.some(
      comment => comment.leading && util.hasNewline(text, util.locEnd(comment))
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
    node.type === "MemberExpression" ||
    node.type === "SequenceExpression" ||
    node.type === "TaggedTemplateExpression"
  );
}

function getLeftSide(node) {
  if (node.expressions) {
    return node.expressions[0];
  }
  return node.left || node.test || node.callee || node.object || node.tag;
}

function exprNeedsASIProtection(node) {
  // HACK: node.needsParens is added in `genericPrint()` for the sole purpose
  // of being used here. It'd be preferable to find a cleaner way to do this.
  const maybeASIProblem =
    node.needsParens ||
    node.type === "ParenthesizedExpression" ||
    node.type === "TypeCastExpression" ||
    (node.type === "ArrowFunctionExpression" &&
      !canPrintParamsWithoutParens(node)) ||
    node.type === "ArrayExpression" ||
    node.type === "ArrayPattern" ||
    (node.type === "UnaryExpression" &&
      node.prefix &&
      (node.operator === "+" || node.operator === "-")) ||
    node.type === "TemplateLiteral" ||
    node.type === "TemplateElement" ||
    node.type === "JSXElement" ||
    node.type === "RegExpLiteral" ||
    (node.type === "Literal" && node.pattern) ||
    (node.type === "Literal" && node.regex);

  if (maybeASIProblem) {
    return true;
  }

  if (!hasNakedLeftSide(node)) {
    return false;
  }

  return exprNeedsASIProtection(getLeftSide(node));
}

function stmtNeedsASIProtection(path) {
  if (!path) return false;
  const node = path.getNode();

  if (node.type !== "ExpressionStatement") {
    return false;
  }

  return exprNeedsASIProtection(node.expression);
}

function classPropMayCauseASIProblems(path) {
  const node = path.getNode();

  if (node.type !== "ClassProperty") {
    return false;
  }

  const name = node.key && node.key.name;
  if (!name) {
    return false;
  }

  // this isn't actually possible yet with most parsers available today
  // so isn't properly tested yet.
  if (name === "static" || name === "get" || name === "set") {
    return true;
  }
}

function classChildNeedsASIProtection(node) {
  if (!node) return;

  let isAsync, isGenerator;
  switch (node.type) {
    case "ClassProperty":
      return node.computed;
    // flow
    case "MethodDefinition":
    // babylon
    case "ClassMethod": {
      const isAsync = node.value ? node.value.async : node.async;
      const isGenerator = node.value ? node.value.generator : node.generator;
      if (
        isAsync || node.static || node.kind === "get" || node.kind === "set"
      ) {
        return false;
      }
      if (node.computed || isGenerator) {
        return true;
      }
    }

    default:
      return false;
  }
}

// This recurses the return argument, looking for the first token
// (the leftmost leaf node) and, if it (or its parents) has any
// leadingComments, returns true (so it can be wrapped in parens).
function returnArgumentHasLeadingComment(options, argument) {
  if (hasLeadingOwnLineComment(options.originalText, argument)) {
    return true;
  }

  if (hasNakedLeftSide(argument)) {
    let leftMost = argument;
    let newLeftMost;
    while ((newLeftMost = getLeftSide(leftMost))) {
      leftMost = newLeftMost;

      if (hasLeadingOwnLineComment(options.originalText, leftMost)) {
        return true;
      }
    }
  }

  return false;
}

function isMemberExpressionChain(node) {
  if (node.type !== "MemberExpression") {
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
function isObjectTypePropertyAFunction(node) {
  return (
    node.type === "ObjectTypeProperty" &&
    node.value.type === "FunctionTypeAnnotation" &&
    !node.static &&
    util.locStart(node.key) !== util.locStart(node.value)
  );
}

// Hack to differentiate between the following two which have the same ast
// declare function f(a): void;
// var f: (a) => void;
function isTypeAnnotationAFunction(node) {
  return (
    node.type === "TypeAnnotation" &&
    node.typeAnnotation.type === "FunctionTypeAnnotation" &&
    !node.static &&
    util.locStart(node) !== util.locStart(node.typeAnnotation)
  );
}

function isFlowNodeStartingWithDeclare(node, options) {
  if (options.parser !== "flow") {
    return false;
  }

  return options.originalText
    .slice(0, util.locStart(node))
    .match(/declare\s*$/);
}

function printArrayItems(path, options, printPath, print) {
  const printedElements = [];
  let separatorParts = [];

  path.each(function(childPath) {
    printedElements.push(concat(separatorParts));
    printedElements.push(group(print(childPath)));

    separatorParts = [",", line];
    if (
      childPath.getValue() &&
      util.isNextLineEmpty(options.originalText, childPath.getValue())
    ) {
      separatorParts.push(softline);
    }
  }, printPath);

  return concat(printedElements);
}

function removeLines(doc) {
  // Force this doc into flat mode by statically converting all
  // lines into spaces (or soft lines into nothing). Hard lines
  // should still output because there's too great of a chance
  // of breaking existing assumptions otherwise.
  return docUtils.mapDoc(doc, d => {
    if (d.type === "line" && !d.hard) {
      return d.soft ? "" : " ";
    } else if (d.type === "if-break") {
      return d.flatContents || "";
    }
    return d;
  });
}

function printAstToDoc(ast, options) {
  function printGenerically(path, args) {
    return comments.printComments(
      path,
      p => genericPrint(p, options, printGenerically, args),
      options,
      args && args.needsSemi
    );
  }

  const doc = printGenerically(FastPath.from(ast));
  docUtils.propagateBreaks(doc);
  return doc;
}

module.exports = { printAstToDoc };
