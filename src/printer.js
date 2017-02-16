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
var conditionalGroup = docBuilders.conditionalGroup;
var ifBreak = docBuilders.ifBreak;
var breakParent = docBuilders.breakParent;

var docUtils = require("./doc-utils");
var willBreak = docUtils.willBreak;
var isLineNext = docUtils.isLineNext;
var getFirstString = docUtils.getFirstString;
var isEmpty = docUtils.isEmpty;

var types = require("ast-types");
var namedTypes = types.namedTypes;
var isString = types.builtInTypes.string;
var isObject = types.builtInTypes.object;

function maybeAddParens(path, lines) {
  return path.needsParens() ? concat(["(", lines, ")"]) : lines;
}

function genericPrint(path, options, printPath) {
  assert.ok(path instanceof FastPath);

  var node = path.getValue();
  var parts = [];
  var needsParens = false;
  var linesWithoutParens = genericPrintNoParens(path, options, printPath);

  if (!node || isEmpty(linesWithoutParens)) {
    return linesWithoutParens;
  }

  // Escape hatch
  if (
    node.comments &&
    node.comments.length > 0 &&
    node.comments[0].value.trim() === "prettier-ignore"
  ) {
    return options.originalText.slice(util.locStart(node), util.locEnd(node));
  }

  if (
    node.decorators &&
    node.decorators.length > 0 &&
    // If the parent node is an export declaration, it will be
    // responsible for printing node.decorators.
    !util.getParentExportDeclaration(path)
  ) {
    const separator = node.decorators.length === 1 &&
      node.decorators[0].expression.type === "Identifier"
      ? " "
      : hardline;
    path.each(
      function(decoratorPath) {
        parts.push(printPath(decoratorPath), separator);
      },
      "decorators"
    );
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

  if (needsParens) {
    parts.unshift("(");
  }

  parts.push(linesWithoutParens);

  if (needsParens) {
    parts.push(")");
  }

  return concat(parts);
}

function genericPrintNoParens(path, options, print) {
  var n = path.getValue();

  if (!n) {
    return "";
  }

  if (typeof n === "string") {
    return n;
  }

  // TODO: For some reason NumericLiteralTypeAnnotation is not
  // printable so this throws, but I think that's a bug in ast-types.
  // This assert isn't very useful though.
  // namedTypes.Printable.assert(n);
  var parts = [];
  switch (n.type) {
    case "File":
      return path.call(print, "program");
    case "Program":
      // Babel 6
      if (n.directives) {
        path.each(
          function(childPath) {
            parts.push(print(childPath), ";", hardline);
            if (
              util.isNextLineEmpty(options.originalText, childPath.getValue())
            ) {
              parts.push(hardline);
            }
          },
          "directives"
        );
      }

      parts.push(
        path.call(
          function(bodyPath) {
            return printStatementSequence(bodyPath, options, print);
          },
          "body"
        )
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
      return concat([path.call(print, "expression"), ";"]); // Babel extension.
    case "ParenthesizedExpression":
      return concat(["(", path.call(print, "expression"), ")"]);
    case "AssignmentExpression":
      return group(
        concat([
          path.call(print, "left"),
          " ",
          n.operator,
          " ",
          path.call(print, "right")
        ])
      );
    case "BinaryExpression":
    case "LogicalExpression": {
      const parts = [];
      printBinaryishExpressions(path, parts, print, options);
      const parent = path.getParentNode();

      // Avoid indenting sub-expressions in if/etc statements.
      if (
        shouldInlineLogicalExpression(n) ||
        n !== parent.body &&
        (parent.type === "IfStatement" ||
          parent.type === "WhileStatement" ||
          parent.type === "DoStatement" ||
          parent.type === "ForStatement") ||
        n === parent.body && parent.type === "ArrowFunctionExpression"
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
          indent(options.tabWidth, rest)
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
      return concat([
        path.call(print, "object"),
        printMemberLookup(path, options, print)
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
      return concat([
        "...",
        path.call(print, "argument"),
        path.call(print, "typeAnnotation")
      ]);
    case "FunctionDeclaration":
    case "FunctionExpression":
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
    case "ArrowFunctionExpression":
      if (n.async) parts.push("async ");

      if (n.typeParameters) {
        parts.push(path.call(print, "typeParameters"));
      }

      if (
        n.params.length === 1 &&
        !n.rest &&
        n.params[0].type === "Identifier" &&
        !n.params[0].typeAnnotation &&
        !n.params[0].leadingComments &&
        !n.params[0].trailingComments &&
        !n.predicate &&
        !n.returnType
      ) {
        parts.push(path.call(print, "params", 0));
      } else {
        parts.push(
          group(
            concat([
              printFunctionParams(path, print, options),
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
        n.body.type === "BlockStatement"
      ) {
        return group(collapsed);
      }

      // These nested groups are a little wonky, but because
      // `conditionalGroup` suppresses break propagation, we want to
      // re-propagate it. We still want to allow the printer to choose
      // the more collapsed version, but still break parents if there
      // are any hard breaks in the content.
      return group(
        conditionalGroup([
          collapsed,
          concat([
            concat(parts),
            indent(options.tabWidth, concat([line, body]))
          ])
        ]),
        { shouldBreak: willBreak(body) }
      );
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

      parts.push(" from ", path.call(print, "source"), ";");

      return concat(parts);
    case "ExportNamespaceSpecifier":
      return concat(["* as ", path.call(print, "exported")]);
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
        path.each(
          function(specifierPath) {
            var value = specifierPath.getValue();
            if (
              namedTypes.ImportDefaultSpecifier.check(value) ||
              namedTypes.ImportNamespaceSpecifier.check(value)
            ) {
              standalones.push(print(specifierPath));
            } else {
              grouped.push(print(specifierPath));
            }
          },
          "specifiers"
        );

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
                  options.tabWidth,
                  concat([
                    options.bracketSpacing ? line : softline,
                    join(concat([",", line]), grouped)
                  ])
                ),
                ifBreak(options.trailingComma ? "," : ""),
                options.bracketSpacing ? line : softline,
                "}"
              ])
            )
          );
        }

        fromParts.push(grouped.length === 0 ? line : " ", "from ");
      }

      fromParts.push(path.call(print, "source"), ";");

      // If there's a very long import, break the following way:
      //
      //   import veryLong
      //     from 'verylong'
      //
      // In case there are grouped elements, they will already break the way
      // we want and this break would take precedence instead.
      if (grouped.length === 0) {
        return group(
          concat([concat(parts), indent(options.tabWidth, concat(fromParts))])
        );
      }

      return concat([concat(parts), concat(fromParts)]);

    case "Import": {
      return "import";
    }
    case "BlockStatement": {
      var naked = path.call(
        function(bodyPath) {
          return printStatementSequence(bodyPath, options, print);
        },
        "body"
      );

      const hasContent = getFirstString(naked);
      const hasDirectives = n.directives && n.directives.length > 0;

      var parent = path.getParentNode();
      if (
        !hasContent &&
        !hasDirectives &&
        !n.comments &&
        (parent.type === "ArrowFunctionExpression" ||
          parent.type === "FunctionExpression" ||
          parent.type === "FunctionDeclaration" ||
          parent.type === "ObjectMethod" ||
          parent.type === "ClassMethod")
      ) {
        return "{}";
      }

      parts.push("{");

      // Babel 6
      if (hasDirectives) {
        path.each(
          function(childPath) {
            parts.push(
              indent(
                options.tabWidth,
                concat([hardline, print(childPath), ";"])
              )
            );
          },
          "directives"
        );
      }

      if (hasContent) {
        parts.push(indent(options.tabWidth, concat([hardline, naked])));
      }

      parts.push(comments.printDanglingComments(path, options));
      parts.push(hardline, "}");

      return concat(parts);
    }
    case "ReturnStatement":
      parts.push("return");

      if (
        n.argument &&
        n.argument.comments &&
        n.argument.comments.some(comment => comment.leading)
      ) {
        parts.push(
          concat([
            " (",
            indent(
              options.tabWidth,
              concat([softline, path.call(print, "argument")])
            ),
            line,
            ")"
          ])
        );
      } else if (n.argument) {
        parts.push(" ", path.call(print, "argument"));
      }

      parts.push(";");

      return concat(parts);
    case "CallExpression": {
      const parent = path.getParentNode();
      // We detect calls on member lookups and possibly print them in a
      // special chain format. See `printMemberChain` for more info.
      if (n.callee.type === "MemberExpression") {
        return printMemberChain(path, options, print);
      }

      return concat([
        path.call(print, "callee"),
        printArgumentsList(path, options, print)
      ]);
    }

    case "ObjectExpression":
    case "ObjectPattern":
    case "ObjectTypeAnnotation":
      var allowBreak = false;
      var isTypeAnnotation = n.type === "ObjectTypeAnnotation";
      // Leave this here because we *might* want to make this
      // configurable later -- flow accepts ";" for type separators
      var separator = isTypeAnnotation ? "," : ",";
      var fields = [];
      var leftBrace = n.exact ? "{|" : "{";
      var rightBrace = n.exact ? "|}" : "}";
      var parent = path.getParentNode(0);
      var parentIsUnionTypeAnnotation = parent.type === "UnionTypeAnnotation";

      if (isTypeAnnotation) {
        fields.push("indexers", "callProperties");
      }

      fields.push("properties");

      var props = [];
      let separatorParts = [];

      fields.forEach(function(field) {
        path.each(
          function(childPath) {
            props.push(concat(separatorParts));
            props.push(group(print(childPath)));

            separatorParts = [separator, line];
            if (
              util.isNextLineEmpty(options.originalText, childPath.getValue())
            ) {
              separatorParts.push(hardline);
            }
          },
          field
        );
      });

      const lastElem = util.getLast(n.properties);
      const canHaveTrailingComma = !(lastElem &&
        lastElem.type === "RestProperty");

      const shouldBreak = util.hasNewlineInRange(
        options.originalText,
        util.locStart(n),
        util.locEnd(n)
      );

      if (props.length === 0) {
        return group(
          concat([
            "{",
            comments.printDanglingComments(path, options),
            softline,
            "}"
          ])
        );
      } else {
        return group(
          concat([
            leftBrace,
            indent(
              options.tabWidth + (parentIsUnionTypeAnnotation ? 2 : 0),
              concat([options.bracketSpacing ? line : softline, concat(props)])
            ),
            ifBreak(canHaveTrailingComma && options.trailingComma ? "," : ""),
            indent(
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
        const needsForcedTrailingComma = canHaveTrailingComma &&
          lastElem === null;

        var printedElements = [];
        let separatorParts = [];
        path.each(
          function(childPath) {
            printedElements.push(concat(separatorParts));
            printedElements.push(group(print(childPath)));

            separatorParts = [",", line];
            if (
              childPath.getValue() &&
              util.isNextLineEmpty(options.originalText, childPath.getValue())
            ) {
              separatorParts.push(softline);
            }
          },
          "elements"
        );

        parts.push(
          group(
            concat([
              "[",
              indent(
                options.tabWidth,
                concat([softline, concat(printedElements)])
              ),
              needsForcedTrailingComma ? "," : "",
              ifBreak(
                canHaveTrailingComma &&
                  !needsForcedTrailingComma &&
                  options.trailingComma
                  ? ","
                  : ""
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
      return "super"; // Babel 6 Literal split
    case "NullLiteral":
      return "null"; // Babel 6 Literal split
    case "RegExpLiteral":
      return n.extra.raw;
    // Babel 6 Literal split
    case "NumericLiteral":
      return printNumber(n.extra.raw);
    // Babel 6 Literal split
    case "BooleanLiteral":
    // Babel 6 Literal split
    case "StringLiteral":
    case "Literal":
      if (typeof n.value === "number") return printNumber(n.raw);
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
            options.tabWidth,
            concat([
              line,
              "? ",
              indent(2, path.call(print, "consequent")),
              line,
              ": ",
              indent(2, path.call(print, "alternate"))
            ])
          )
        ])
      );
    case "NewExpression":
      parts.push("new ", path.call(print, "callee"));

      var args = n.arguments;

      if (args) {
        parts.push(printArgumentsList(path, options, print));
      }

      return concat(parts);
    case "VariableDeclaration":
      var printed = path.map(
        function(childPath) {
          return print(childPath);
        },
        "declarations"
      );

      parts = [
        n.kind,
        " ",
        printed[0],
        indent(
          options.tabWidth,
          concat(printed.slice(1).map(p => concat([",", line, p])))
        )
      ];

      // We generally want to terminate all variable declarations with a
      // semicolon, except when they in the () part of for loops.
      var parentNode = path.getParentNode();

      var isParentForLoop = namedTypes.ForStatement.check(parentNode) ||
        namedTypes.ForInStatement.check(parentNode) ||
        namedTypes.ForOfStatement &&
          namedTypes.ForOfStatement.check(parentNode) ||
        namedTypes.ForAwaitStatement &&
          namedTypes.ForAwaitStatement.check(parentNode);

      if (!(isParentForLoop && parentNode.body !== n)) {
        parts.push(";");
      }

      return group(concat(parts));
    case "VariableDeclarator":
      return n.init
        ? concat([path.call(print, "id"), " = ", path.call(print, "init")])
        : path.call(print, "id");
    case "WithStatement":
      return concat([
        "with (",
        path.call(print, "object"),
        ")",
        adjustClause(path.call(print, "body"), options)
      ]);
    case "IfStatement":
      const con = adjustClause(path.call(print, "consequent"), options);

      parts = [
        "if (",
        group(
          concat([
            indent(
              options.tabWidth,
              concat([softline, path.call(print, "test")])
            ),
            softline
          ])
        ),
        ")",
        con
      ];

      if (n.alternate) {
        const hasBraces = isCurlyBracket(con);
        const isEmpty = isEmptyBlock(con);

        if (hasBraces && !isEmpty) {
          parts.push(" else");
        } else {
          // We use `conditionalGroup` to suppress break propagation.
          // This allows us to provide a hardline without forcing the
          // entire `if` clause to break up.
          parts.push(conditionalGroup([concat([hardline, "else"])]));
        }

        parts.push(
          adjustClause(
            path.call(print, "alternate"),
            options,
            n.alternate.type === "IfStatement"
          )
        );
      }

      return group(concat(parts));
    case "ForStatement": {
      const body = adjustClause(path.call(print, "body"), options);

      if (!n.init && !n.test && !n.update) {
        return concat(["for (;;)", body]);
      }

      return concat([
        "for (",
        group(
          concat([
            indent(
              options.tabWidth,
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
            indent(
              options.tabWidth,
              concat([softline, path.call(print, "test")])
            ),
            softline
          ])
        ),
        ")",
        adjustClause(path.call(print, "body"), options)
      ]);
    case "ForInStatement":
      // Note: esprima can't actually parse "for each (".
      return concat([
        n.each ? "for each (" : "for (",
        path.call(print, "left"),
        " in ",
        path.call(print, "right"),
        ")",
        adjustClause(path.call(print, "body"), options)
      ]);
    case "ForOfStatement":
      return concat([
        "for (",
        path.call(print, "left"),
        " of ",
        path.call(print, "right"),
        ")",
        adjustClause(path.call(print, "body"), options)
      ]);
    case "ForAwaitStatement":
      return concat([
        "for await (",
        path.call(print, "left"),
        " of ",
        path.call(print, "right"),
        ")",
        adjustClause(path.call(print, "body"), options)
      ]);
    case "DoWhileStatement":
      var clause = adjustClause(path.call(print, "body"), options);
      var doBody = concat(["do", clause]);
      var parts = [doBody];
      const hasBraces = isCurlyBracket(clause);

      if (hasBraces) parts.push(" while");
      else parts.push(concat([line, "while"]));

      parts.push(" (", path.call(print, "test"), ");");

      return concat(parts);
    case "DoExpression":
      var statements = path.call(
        function(bodyPath) {
          return printStatementSequence(bodyPath, options, print);
        },
        "body"
      );
      return concat(["do {\n", statements.indent(options.tabWidth), "\n}"]);
    case "BreakStatement":
      parts.push("break");

      if (n.label) parts.push(" ", path.call(print, "label"));

      parts.push(";");

      return concat(parts);
    case "ContinueStatement":
      parts.push("continue");

      if (n.label) parts.push(" ", path.call(print, "label"));

      parts.push(";");

      return concat(parts);
    case "LabeledStatement":
      if (n.body.type === "EmptyStatement") {
        return concat([path.call(print, "label"), ":;"]);
      }

      return concat([
        path.call(print, "label"),
        ":",
        hardline,
        path.call(print, "body")
      ]);
    case "TryStatement":
      parts.push("try ", path.call(print, "block"));

      if (n.handler) {
        parts.push(" ", path.call(print, "handler"));
      } else if (n.handlers) {
        path.each(
          function(handlerPath) {
            parts.push(" ", print(handlerPath));
          },
          "handlers"
        );
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
      return concat(["throw ", path.call(print, "argument"), ";"]);
    // Note: ignoring n.lexical because it has no printing consequences.
    case "SwitchStatement":
      return concat([
        "switch (",
        path.call(print, "discriminant"),
        ") {",
        n.cases.length > 0
          ? indent(
              options.tabWidth,
              concat([hardline, join(hardline, path.map(print, "cases"))])
            )
          : "",
        hardline,
        "}"
      ]);
    case "SwitchCase":
      if (n.test) parts.push("case ", path.call(print, "test"), ":");
      else parts.push("default:");

      if (n.consequent.find(node => node.type !== "EmptyStatement")) {
        const cons = path.call(
          function(consequentPath) {
            return printStatementSequence(consequentPath, options, print);
          },
          "consequent"
        );

        parts.push(
          isCurlyBracket(cons)
            ? concat([" ", cons])
            : indent(options.tabWidth, concat([hardline, cons]))
        );
      }

      return concat(parts);
    // JSX extensions below.
    case "DebuggerStatement":
      return "debugger;";
    case "JSXAttribute":
      parts.push(path.call(print, "name"));

      if (n.value) {
        let res;
        if (
          (n.value.type === "StringLiteral" || n.value.type === "Literal") &&
          typeof n.value.value === "string"
        ) {
          res = '"' + util.htmlEscapeInsideDoubleQuote(n.value.value) + '"';
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

      const shouldInline = n.expression.type === "ArrayExpression" ||
        n.expression.type === "ObjectExpression" ||
        n.expression.type === "ArrowFunctionExpression" ||
        n.expression.type === "CallExpression" ||
        n.expression.type === "FunctionExpression" ||
        n.expression.type === "JSXEmptyExpression" ||
        parent.type === "JSXElement" &&
          (n.expression.type === "ConditionalExpression" ||
            n.expression.type === "LogicalExpression");

      if (shouldInline) {
        return group(concat(["{", path.call(print, "expression"), "}"]));
      }

      return group(
        concat([
          "{",
          indent(
            options.tabWidth,
            concat([softline, path.call(print, "expression")])
          ),
          softline,
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
        n.attributes[0].value.type === "Literal" &&
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
              options.tabWidth,
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
      return concat([
        comments.printDanglingComments(path, options, /* sameIndent */ true),
        softline
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
              options.tabWidth,
              concat([
                hardline,
                path.call(
                  function(bodyPath) {
                    return printStatementSequence(bodyPath, options, print);
                  },
                  "body"
                )
              ])
            )
          : comments.printDanglingComments(path, options),
        hardline,
        "}"
      ]);
    case "ClassPropertyDefinition":
      parts.push("static ", path.call(print, "definition"));

      if (!namedTypes.MethodDefinition.check(n.definition)) parts.push(";");

      return concat(parts);
    case "ClassProperty":
      if (n.static) parts.push("static ");

      var key;

      if (n.computed) {
        key = concat(["[", path.call(print, "key"), "]"]);
      } else {
        key = printPropertyKey(path, options, print);
        if (n.variance === "plus") {
          key = concat(["+", key]);
        } else if (n.variance === "minus") {
          key = concat(["-", key]);
        }
      }

      parts.push(key);

      if (n.typeAnnotation) parts.push(path.call(print, "typeAnnotation"));

      if (n.value) parts.push(" = ", path.call(print, "value"));

      parts.push(";");

      return concat(parts);
    case "ClassDeclaration":
    case "ClassExpression":
      return concat(printClass(path, options, print));
    case "TemplateElement":
      return join(literalline, n.value.raw.split("\n"));
    case "TemplateLiteral":
      var expressions = path.map(print, "expressions");

      parts.push("`");

      path.each(
        function(childPath) {
          var i = childPath.getName();

          parts.push(print(childPath));

          if (i < expressions.length) {
            parts.push("${", expressions[i], "}");
          }
        },
        "quasis"
      );

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
        if (n.typeAnnotation.type !== "FunctionTypeAnnotation") {
          parts.push(": ");
        }

        parts.push(path.call(print, "typeAnnotation"));

        return concat(parts);
      }

      return "";
    case "TupleTypeAnnotation":
      return concat(["[", join(", ", path.map(print, "types")), "]"]);
    case "ExistentialTypeParam":
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
    case "NumericLiteralTypeAnnotation":
    case "BooleanLiteralTypeAnnotation":
      return "" + n.value;
    case "DeclareClass":
      return printFlowDeclaration(path, printClass(path, options, print));
    case "DeclareFunction":
      return printFlowDeclaration(path, [
        "function ",
        path.call(print, "id"),
        n.predicate ? " " : "",
        path.call(print, "predicate"),
        ";"
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
        ";"
      ]);
    case "DeclareVariable":
      return printFlowDeclaration(path, ["var ", path.call(print, "id"), ";"]);
    case "DeclareExportAllDeclaration":
      return concat(["declare export * from ", path.call(print, "source")]);
    case "DeclareExportDeclaration":
      return concat(["declare ", printExportDeclaration(path, options, print)]);
    case "FunctionTypeAnnotation":
      // FunctionTypeAnnotation is ambiguous:
      // declare function foo(a: B): void; OR
      // var A: (a: B) => void;
      var parent = path.getParentNode(0);
      var isArrowFunctionTypeAnnotation = !(!parent.variance &&
        !parent.optional &&
        namedTypes.ObjectTypeProperty.check(parent) ||
        namedTypes.ObjectTypeCallProperty.check(parent) ||
        namedTypes.DeclareFunction.check(path.getParentNode(2)));

      var needsColon = isArrowFunctionTypeAnnotation &&
        namedTypes.TypeAnnotation.check(parent);

      if (isObjectTypePropertyAFunction(parent)) {
        isArrowFunctionTypeAnnotation = true;
        needsColon = true;
      }

      if (needsColon) {
        parts.push(": ");
      }

      parts.push(path.call(print, "typeParameters"));

      parts.push(group(printFunctionParams(path, print, options)));

      // The returnType is not wrapped in a TypeAnnotation, so the colon
      // needs to be added separately.
      if (n.returnType || n.predicate) {
        parts.push(
          isArrowFunctionTypeAnnotation ? " => " : ": ",
          path.call(print, "returnType"),
          path.call(print, "predicate")
        );
      }

      return concat(parts);
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
        path.call(print, "typeParameters"),
        " "
      );

      if (n["extends"].length > 0) {
        parts.push("extends ", join(", ", path.map(print, "extends")), " ");
      }

      parts.push(path.call(print, "body"));

      return concat(parts);
    }
    case "ClassImplements":
    case "InterfaceExtends":
      return concat([
        path.call(print, "id"),
        path.call(print, "typeParameters")
      ]);
    case "IntersectionTypeAnnotation":
    case "UnionTypeAnnotation": {
      const types = path.map(print, "types");
      const op = n.type === "IntersectionTypeAnnotation" ? "&" : "|";

      // single-line variation
      // A | B | C

      // multi-line variation
      // | A
      // | B
      // | C
      return group(
        indent(
          options.tabWidth,
          concat([
            ifBreak(concat([line, op, " "])),
            join(concat([line, op, " "]), types)
          ])
        )
      );
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
      var variance = n.variance === "plus"
        ? "+"
        : n.variance === "minus" ? "-" : "";
      return concat([
        variance,
        "[",
        path.call(print, "id"),
        n.id ? ": " : "",
        path.call(print, "key"),
        "]: ",
        path.call(print, "value")
      ]);
    case "ObjectTypeProperty":
      var variance = n.variance === "plus"
        ? "+"
        : n.variance === "minus" ? "-" : "";
      // TODO: This is a bad hack and we need a better way to know
      // when to emit an arrow function or not.
      var isFunction = !n.variance &&
        !n.optional &&
        n.value.type === "FunctionTypeAnnotation";

      if (isObjectTypePropertyAFunction(n)) {
        isFunction = true;
      }

      return concat([
        n.static ? "static " : "",
        variance,
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

      return "" + n.value;
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
        " = ",
        path.call(print, "right"),
        ";"
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
    case "TypeParameterInstantiation":
      return concat(["<", join(", ", path.map(print, "params")), ">"]);
    case "TypeParameter":
      switch (n.variance) {
        case "plus":
          parts.push("+");

          break;
        case "minus":
          parts.push("-");

          break;
        default:
      }

      parts.push(path.call(print, "name"));

      if (n.bound) {
        parts.push(path.call(print, "bound"));
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
  return p;
}

function printStatementSequence(path, options, print) {
  let printed = [];

  path.map(function(stmtPath, i) {
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

    parts.push(stmtPrinted);

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
      key.type === "Literal" && typeof key.value === "string") &&
    isIdentifierName(key.value) &&
    !node.computed &&
    // There's a bug in the flow parser where it throws if there are
    // unquoted unicode literals as keys. Let's quote them for now.
    (options.parser !== "flow" || key.value.match(/[a-zA-Z0-9$_]/))
  ) {
    // 'a' -> a
    return key.value;
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
        path.call(
          function(valuePath) {
            return printFunctionParams(valuePath, print, options);
          },
          "value"
        ),
        path.call(p => printReturnType(p, print), "value")
      ])
    ),
    " ",
    path.call(print, "value", "body")
  );

  return concat(parts);
}

function printArgumentsList(path, options, print) {
  var printed = path.map(print, "arguments");
  var args;

  if (printed.length === 0) {
    return "()";
  }

  const lastArg = util.getLast(path.getValue().arguments);
  // This is just an optimization; I think we could return the
  // conditional group for all function calls, but it's more expensive
  // so only do it for specific forms.
  const groupLastArg = (!lastArg.comments || !lastArg.comments.length) &&
    (lastArg.type === "ObjectExpression" ||
      lastArg.type === "ArrayExpression" ||
      lastArg.type === "FunctionExpression" ||
      lastArg.type === "ArrowFunctionExpression" &&
        (lastArg.body.type === "BlockStatement" ||
          lastArg.body.type === "ArrowFunctionExpression" ||
          lastArg.body.type === "ObjectExpression" ||
          lastArg.body.type === "ArrayExpression" ||
          lastArg.body.type === "CallExpression" ||
          lastArg.body.type === "JSXElement"));

  if (groupLastArg) {
    const shouldBreak = printed.slice(0, -1).some(willBreak);
    return concat([
      printed.some(willBreak) ? breakParent : "",
      conditionalGroup(
        [
          concat(["(", join(concat([", "]), printed), ")"]),
          concat([
            "(",
            join(concat([",", line]), printed.slice(0, -1)),
            printed.length > 1 ? ", " : "",
            group(util.getLast(printed), { shouldBreak: true }),
            ")"
          ]),
          group(
            concat([
              "(",
              indent(
                options.tabWidth,
                concat([line, join(concat([",", line]), printed)])
              ),
              options.trailingComma ? "," : "",
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
      indent(
        options.tabWidth,
        concat([softline, join(concat([",", line]), printed)])
      ),
      ifBreak(options.trailingComma ? "," : ""),
      softline,
      ")"
    ]),
    { shouldBreak: printed.some(willBreak) }
  );
}

function printFunctionParams(path, print, options) {
  var fun = path.getValue();
  // namedTypes.Function.assert(fun);
  var printed = path.map(print, "params");

  if (fun.defaults) {
    path.each(
      function(defExprPath) {
        var i = defExprPath.getName();
        var p = printed[i];

        if (p && defExprPath.getValue()) {
          printed[i] = concat([p, " = ", print(defExprPath)]);
        }
      },
      "defaults"
    );
  }

  if (fun.rest) {
    printed.push(concat(["...", path.call(print, "rest")]));
  }

  if (printed.length === 0) {
    return "()";
  }

  const lastParam = util.getLast(path.getValue().params);
  const canHaveTrailingComma = !(lastParam &&
    lastParam.type === "RestElement") &&
    !fun.rest;

  return concat([
    "(",
    indent(
      options.tabWidth,
      concat([softline, join(concat([",", line]), printed)])
    ),
    ifBreak(canHaveTrailingComma && options.trailingComma ? "," : ""),
    softline,
    ")"
  ]);
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
  return type === "FunctionExpression" ||
    type === "ArrowFunctionExpression" ||
    type === "NewExpression";
}

function printExportDeclaration(path, options, print) {
  var decl = path.getValue();
  var parts = ["export "];

  namedTypes.Declaration.assert(decl);

  if (decl["default"] || decl.type === "ExportDefaultDeclaration") {
    parts.push("default ");
  }

  if (decl.declaration) {
    parts.push(path.call(print, "declaration"));

    if (
      decl.type === "ExportDefaultDeclaration" &&
      (decl.declaration.type !== "ClassDeclaration" &&
        decl.declaration.type !== "FunctionDeclaration")
    ) {
      parts.push(";");
    }
  } else {
    if (decl.specifiers && decl.specifiers.length > 0) {
      if (
        decl.specifiers.length === 1 &&
        decl.specifiers[0].type === "ExportBatchSpecifier"
      ) {
        parts.push("*");
      } else if (
        decl.specifiers.length === 1 &&
          decl.specifiers[0].type === "ExportDefaultSpecifier" ||
        decl.specifiers[0].type === "ExportNamespaceSpecifier"
      ) {
        parts.push(path.map(print, "specifiers")[0]);
      } else {
        parts.push(
          decl.exportKind === "type" ? "type " : "",
          group(
            concat([
              "{",
              indent(
                options.tabWidth,
                concat([
                  options.bracketSpacing ? line : softline,
                  join(concat([",", line]), path.map(print, "specifiers"))
                ])
              ),
              ifBreak(options.trailingComma ? "," : ""),
              options.bracketSpacing ? line : softline,
              "}"
            ])
          )
        );
      }
    } else {
      parts.push("{}");
    }

    if (decl.source) {
      parts.push(" from ", path.call(print, "source"));
    }

    parts.push(";");
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
    parts.push(group(indent(options.tabWidth, concat(partsGroup))));
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
          group(
            concat([
              indent(options.tabWidth, concat([softline, property])),
              softline
            ])
          ),
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
  // letter or just a sequence of _$. The rationale is that they are
  // likely to be factories.
  const shouldMerge = groups[0].length === 1 &&
    groups[0][0].node.type === "Identifier" &&
    groups[0][0].node.name.match(/(^[A-Z])|^[_$]+$/) &&
    groups.length >= 2;

  function printGroup(printedGroup) {
    return concat(printedGroup.map(tuple => tuple.printed));
  }

  function printIndentedGroup(groups, lineType) {
    return indent(
      options.tabWidth,
      group(concat([lineType, join(lineType, groups.map(printGroup))]))
    );
  }

  const printedGroups = groups.map(printGroup);
  const oneLine = concat(printedGroups);
  const hasComment = groups.length >= 2 && groups[1][0].node.comments;

  // If we only have a single `.`, we shouldn't do anything fancy and just
  // render everything concatenated together.
  if (groups.length <= 2 && !hasComment) {
    return group(oneLine);
  }

  const expanded = concat([
    printGroup(groups[0]),
    shouldMerge ? printIndentedGroup(groups.slice(1, 2), softline) : "",
    printIndentedGroup(groups.slice(shouldMerge ? 2 : 1), hardline)
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

  return conditionalGroup([oneLine, expanded]);
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
  path.map(
    function(childPath, i) {
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
          value.split(/(\n\s*)/).forEach(line => {
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
            }

            const stripped = line.replace(/^\s+|\s+$/g, "");
            if (stripped) {
              children.push(stripped);
            }

            const endSpace = /\s+$/.test(line);
            if (endSpace) {
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
    },
    "children"
  );

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

  // If no children, just print the opening element
  const openingLines = path.call(print, "openingElement");
  if (n.openingElement.selfClosing) {
    assert.ok(!n.closingElement);
    return openingLines;
  }

  const jsxWhitespace = options.singleQuote
    ? ifBreak("{' '}", " ")
    : ifBreak('{" "}', " ");
  const children = printJSXChildren(path, options, print, jsxWhitespace);
  let forcedBreak = false;

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
          Array.isArray(contents)
            ? conditionalGroup([concat(contents)])
            : contents
      )
    )
  ];

  const closingLines = path.call(print, "closingElement");

  const multiLineElem = group(
    concat([
      openingLines,
      indent(
        options.tabWidth,
        group(concat(childrenGroupedByLine), { shouldBreak: true })
      ),
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
    JSXElement: true,
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
      indent(options.tabWidth, concat([softline, elem])),
      softline,
      ifBreak(")")
    ])
  );
}

function isBinaryish(node) {
  return node.type === "BinaryExpression" || node.type === "LogicalExpression";
}

function shouldInlineLogicalExpression(node) {
  return node.type === "LogicalExpression" &&
    (node.right.type === "ObjectExpression" ||
      node.right.type === "ArrayExpression");
}

// For binary expressions to be consistent, we need to group
// subsequent operators with the same precedence level under a single
// group. Otherwise they will be nested such that some of them break
// onto new lines but not all. Operators with the same precedence
// level should either all break or not. Because we group them by
// precedence level and the AST is structured based on precedence
// level, things are naturally broken up correctly, i.e. `&&` is
// broken before `+`.
function printBinaryishExpressions(path, parts, print, options, isNested) {
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
    // print them normally.
    if (
      util.getPrecedence(node.left.operator) ===
      util.getPrecedence(node.operator)
    ) {
      // Flatten them out by recursively calling this function. The
      // printed values will all be appended to `parts`.
      path.call(
        left =>
          printBinaryishExpressions(
            left,
            parts,
            print,
            options,
            /* isNested */ true
          ),
        "left"
      );
    } else {
      parts.push(path.call(print, "left"));
    }

    const right = concat([
      node.operator,
      shouldInlineLogicalExpression(node) ? " " : line,
      path.call(print, "right")
    ]);

    // If there's only a single binary expression: everything except && and ||,
    // we want to create a group in order to avoid having a small right part
    // like -1 be on its own line.
    const parent = path.getParentNode();
    const shouldGroup = node.type === "BinaryExpression" &&
      parent.type !== "BinaryExpression" &&
      node.left.type !== "BinaryExpression" &&
      node.right.type !== "BinaryExpression";

    parts.push(" ", shouldGroup ? group(right) : right);

    // The root comments are already printed, but we need to manually print
    // the other ones since we don't call the normal print on BinaryExpression,
    // only for the left and right parts
    if (isNested && node.comments) {
      parts.push(comments.printComments(path, p => "", options));
    }
  } else {
    // Our stopping case. Simply print the node normally.
    parts.push(path.call(print));
  }

  return parts;
}

function adjustClause(clause, options, forceSpace) {
  if (clause === "") {
    return ";";
  }

  if (isCurlyBracket(clause) || forceSpace) {
    return concat([" ", clause]);
  }

  return indent(options.tabWidth, concat([line, clause]));
}

function isCurlyBracket(doc) {
  const str = getFirstString(doc);
  return str === "{" || str === "{}";
}

function isEmptyBlock(doc) {
  const str = getFirstString(doc);
  return str === "{}";
}

function lastNonSpaceCharacter(lines) {
  var pos = lines.lastPos();
  do {
    var ch = lines.charAt(pos);

    if (/\S/.test(ch)) return ch;
  } while (lines.prevPos(pos));
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

function printNumber(rawNumber) {
  return rawNumber
    .toLowerCase()
    // Remove unnecessary plus and zeroes from scientific notation.
    .replace(/^([\d.]+e)(?:\+|(-))?0*/, "$1$2")
    // Make sure numbers always start with a digit.
    .replace(/^\./, "0.")
    // Remove trailing dot.
    .replace(/\.(?=e|$)/, "");
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

// Hack to differentiate between the following two which have the same ast
// type T = { method: () => void };
// type T = { method(): void };
function isObjectTypePropertyAFunction(node) {
  return node.type === "ObjectTypeProperty" &&
    node.value.type === "FunctionTypeAnnotation" &&
    !node.static &&
    util.locStart(node.key) !== util.locStart(node.value);
}

function isFlowNodeStartingWithDeclare(node, options) {
  if (options.parser !== "flow") {
    return false;
  }

  return options.originalText
    .slice(0, util.locStart(node))
    .match(/declare\s*$/);
}

function printAstToDoc(ast, options) {
  function printGenerically(path) {
    return comments.printComments(
      path,
      p => genericPrint(p, options, printGenerically),
      options
    );
  }

  const doc = printGenerically(FastPath.from(ast));
  docUtils.propagateBreaks(doc);
  return doc;
}

module.exports = { printAstToDoc };
