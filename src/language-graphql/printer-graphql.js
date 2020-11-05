"use strict";

const {
  concat,
  join,
  hardline,
  line,
  softline,
  group,
  indent,
  ifBreak,
} = require("../document").builders;
const { hasIgnoreComment, isNextLineEmpty } = require("../common/util");
const { insertPragma } = require("./pragma");

function* genericPrint(path, options, print) {
  const n = path.getValue();
  if (!n) {
    return;
  }

  if (typeof n === "string") {
    yield n;
    return;
  }

  switch (n.kind) {
    case "Document": {
      const parts = [];
      path.each((pathChild, index) => {
        parts.push(concat([pathChild.call(print)]));
        if (index !== n.definitions.length - 1) {
          parts.push(hardline);
          if (
            isNextLineEmpty(
              options.originalText,
              pathChild.getValue(),
              options.locEnd
            )
          ) {
            parts.push(hardline);
          }
        }
      }, "definitions");
      yield* parts;
      yield hardline;
      return;
    }
    case "OperationDefinition": {
      const hasOperation = options.originalText[options.locStart(n)] !== "{";

      if (hasOperation) {
        yield n.operation;
      }

      const hasName = !!n.name;
      if (hasOperation && hasName) {
        yield " ";
        yield path.call(print, "name");
      }

      if (n.variableDefinitions && n.variableDefinitions.length) {
        yield group(
          concat([
            "(",
            indent(
              concat([
                softline,
                join(
                  concat([ifBreak("", ", "), softline]),
                  path.map(print, "variableDefinitions")
                ),
              ])
            ),
            softline,
            ")",
          ])
        );
      }

      yield printDirectives(path, print, n);
      if (n.selectionSet && (hasOperation || hasName)) {
        yield " ";
      }
      yield path.call(print, "selectionSet");
      return;
    }
    case "FragmentDefinition": {
      yield "fragment ";
      yield path.call(print, "name");
      if (n.variableDefinitions && n.variableDefinitions.length) {
        yield group(
          concat([
            "(",
            indent(
              concat([
                softline,
                join(
                  concat([ifBreak("", ", "), softline]),
                  path.map(print, "variableDefinitions")
                ),
              ])
            ),
            softline,
            ")",
          ])
        );
      }
      yield " on ";
      yield path.call(print, "typeCondition");
      yield printDirectives(path, print, n);
      yield " ";
      yield path.call(print, "selectionSet");
      return;
    }
    case "SelectionSet": {
      yield "{";
      yield indent(
        concat([
          hardline,
          join(
            hardline,
            path.call(
              (selectionsPath) => printSequence(selectionsPath, options, print),
              "selections"
            )
          ),
        ])
      );
      yield hardline;
      yield "}";
      return;
    }
    case "Field": {
      yield group(
        concat([
          n.alias ? concat([path.call(print, "alias"), ": "]) : "",
          path.call(print, "name"),
          n.arguments.length > 0
            ? group(
                concat([
                  "(",
                  indent(
                    concat([
                      softline,
                      join(
                        concat([ifBreak("", ", "), softline]),
                        path.call(
                          (argsPath) => printSequence(argsPath, options, print),
                          "arguments"
                        )
                      ),
                    ])
                  ),
                  softline,
                  ")",
                ])
              )
            : "",
          printDirectives(path, print, n),
          n.selectionSet ? " " : "",
          path.call(print, "selectionSet"),
        ])
      );
      return;
    }
    case "Name": {
      yield n.value;
      return;
    }
    case "StringValue": {
      if (n.block) {
        yield '"""';
        yield hardline;
        yield join(hardline, n.value.replace(/"""/g, "\\$&").split("\n"));
        yield hardline;
        yield '"""';
      } else {
        yield '"';
        yield n.value.replace(/["\\]/g, "\\$&").replace(/\n/g, "\\n");
        yield '"';
      }
      return;
    }
    case "IntValue":
    case "FloatValue":
    case "EnumValue": {
      yield n.value;
      return;
    }
    case "BooleanValue": {
      yield n.value ? "true" : "false";
      return;
    }
    case "NullValue": {
      yield "null";
      return;
    }
    case "Variable": {
      yield "$";
      yield path.call(print, "name");
      return;
    }
    case "ListValue": {
      return yield group(
        concat([
          "[",
          indent(
            concat([
              softline,
              join(
                concat([ifBreak("", ", "), softline]),
                path.map(print, "values")
              ),
            ])
          ),
          softline,
          "]",
        ])
      );
    }
    case "ObjectValue": {
      return yield group(
        concat([
          "{",
          options.bracketSpacing && n.fields.length > 0 ? " " : "",
          indent(
            concat([
              softline,
              join(
                concat([ifBreak("", ", "), softline]),
                path.map(print, "fields")
              ),
            ])
          ),
          softline,
          ifBreak("", options.bracketSpacing && n.fields.length > 0 ? " " : ""),
          "}",
        ])
      );
    }
    case "ObjectField":
    case "Argument": {
      yield path.call(print, "name");
      yield ": ";
      yield path.call(print, "value");
      return;
    }

    case "Directive": {
      yield "@";
      yield path.call(print, "name");
      if (n.arguments.length > 0) {
        yield group(
          concat([
            "(",
            indent(
              concat([
                softline,
                join(
                  concat([ifBreak("", ", "), softline]),
                  path.call(
                    (argsPath) => printSequence(argsPath, options, print),
                    "arguments"
                  )
                ),
              ])
            ),
            softline,
            ")",
          ])
        );
      }
      return;
    }

    case "NamedType": {
      yield path.call(print, "name");
      return;
    }

    case "VariableDefinition": {
      yield path.call(print, "variable");
      yield ": ";
      yield path.call(print, "type");
      if (n.defaultValue) {
        yield " = ";
        yield path.call(print, "defaultValue");
      }
      yield printDirectives(path, print, n);
      return;
    }

    case "ObjectTypeExtension":
    case "ObjectTypeDefinition": {
      yield path.call(print, "description");
      if (n.description) {
        yield hardline;
      }
      if (n.kind === "ObjectTypeExtension") {
        yield "extend ";
      }
      yield "type ";
      yield path.call(print, "name");
      if (n.interfaces.length > 0) {
        yield " implements ";
        yield* printInterfaces(path, options, print);
      }
      yield printDirectives(path, print, n);
      if (n.fields.length > 0) {
        yield " {";
        yield indent(
          concat([
            hardline,
            join(
              hardline,
              path.call(
                (fieldsPath) => printSequence(fieldsPath, options, print),
                "fields"
              )
            ),
          ])
        );
        yield hardline;
        yield "}";
      }
      return;
    }

    case "FieldDefinition": {
      yield path.call(print, "description");

      if (n.description) {
        yield hardline;
      }

      yield path.call(print, "name");
      if (n.arguments.length > 0) {
        yield group(
          concat([
            "(",
            indent(
              concat([
                softline,
                join(
                  concat([ifBreak("", ", "), softline]),
                  path.call(
                    (argsPath) => printSequence(argsPath, options, print),
                    "arguments"
                  )
                ),
              ])
            ),
            softline,
            ")",
          ])
        );
      }
      yield ": ";
      yield path.call(print, "type");
      yield printDirectives(path, print, n);
      return;
    }

    case "DirectiveDefinition": {
      yield path.call(print, "description");
      if (n.description) {
        yield hardline;
      }
      yield "directive ";
      yield "@";
      yield path.call(print, "name");
      if (n.arguments.length > 0) {
        yield group(
          concat([
            "(",
            indent(
              concat([
                softline,
                join(
                  concat([ifBreak("", ", "), softline]),
                  path.call(
                    (argsPath) => printSequence(argsPath, options, print),
                    "arguments"
                  )
                ),
              ])
            ),
            softline,
            ")",
          ])
        );
      }
      yield n.repeatable ? " repeatable" : "";
      yield " on ";
      yield join(" | ", path.map(print, "locations"));
      return;
    }

    case "EnumTypeExtension":
    case "EnumTypeDefinition": {
      yield path.call(print, "description");
      if (n.description) {
        yield hardline;
      }
      if (n.kind === "EnumTypeExtension") {
        yield "extend ";
      }
      yield "enum ";
      yield path.call(print, "name");
      yield printDirectives(path, print, n);

      if (n.values.length > 0) {
        yield " {";
        yield indent(
          concat([
            hardline,
            join(
              hardline,
              path.call(
                (valuesPath) => printSequence(valuesPath, options, print),
                "values"
              )
            ),
          ])
        );
        yield hardline;
        yield "}";
      }
      return;
    }

    case "EnumValueDefinition": {
      yield path.call(print, "description");
      if (n.description) {
        yield hardline;
      }
      yield path.call(print, "name");
      yield printDirectives(path, print, n);
      return;
    }

    case "InputValueDefinition": {
      yield path.call(print, "description");
      if (n.description) {
        if (n.description.block) {
          yield hardline;
        } else {
          yield line;
        }
      }
      yield path.call(print, "name");
      yield ": ";
      yield path.call(print, "type");
      if (n.defaultValue) {
        yield " = ";
        yield path.call(print, "defaultValue");
      }
      yield printDirectives(path, print, n);
      return;
    }

    case "InputObjectTypeExtension":
    case "InputObjectTypeDefinition": {
      yield path.call(print, "description");
      yield n.description ? hardline : "";
      yield n.kind === "InputObjectTypeExtension" ? "extend " : "";
      yield "input ";
      yield path.call(print, "name");
      yield printDirectives(path, print, n);
      if (n.fields.length > 0) {
        yield " {";
        yield indent(
          concat([
            hardline,
            join(
              hardline,
              path.call(
                (fieldsPath) => printSequence(fieldsPath, options, print),
                "fields"
              )
            ),
          ])
        );
        yield hardline;
        yield "}";
      }
      return;
    }

    case "SchemaDefinition": {
      yield "schema";
      yield printDirectives(path, print, n);
      yield " {";
      if (n.operationTypes.length > 0) {
        yield indent(
          concat([
            hardline,
            join(
              hardline,
              path.call(
                (opsPath) => printSequence(opsPath, options, print),
                "operationTypes"
              )
            ),
          ])
        );
      }
      yield hardline;
      yield "}";
      return;
    }

    case "OperationTypeDefinition": {
      yield path.call(print, "operation");
      yield ": ";
      yield path.call(print, "type");
      return;
    }

    case "InterfaceTypeExtension":
    case "InterfaceTypeDefinition": {
      yield path.call(print, "description");
      if (n.description) {
        yield hardline;
      }
      if (n.kind === "InterfaceTypeExtension") {
        yield "extend ";
      }
      yield "interface ";
      yield path.call(print, "name");
      if (n.interfaces.length > 0) {
        yield " implements ";
        yield* printInterfaces(path, options, print);
      }
      yield printDirectives(path, print, n);
      if (n.fields.length > 0) {
        yield " {";
        yield indent(
          concat([
            hardline,
            join(
              hardline,
              path.call(
                (fieldsPath) => printSequence(fieldsPath, options, print),
                "fields"
              )
            ),
          ])
        );
        yield hardline;
        yield "}";
      }
      return;
    }

    case "FragmentSpread": {
      yield "...";
      yield path.call(print, "name");
      yield printDirectives(path, print, n);
      return;
    }

    case "InlineFragment": {
      yield "...";
      if (n.typeCondition) {
        yield concat([" on ", path.call(print, "typeCondition")]);
      }
      yield printDirectives(path, print, n);
      yield " ";
      yield path.call(print, "selectionSet");
      return;
    }

    case "UnionTypeExtension":
    case "UnionTypeDefinition": {
      yield group(
        concat([
          path.call(print, "description"),
          n.description ? hardline : "",
          group(
            concat([
              n.kind === "UnionTypeExtension" ? "extend " : "",
              "union ",
              path.call(print, "name"),
              printDirectives(path, print, n),
              n.types.length > 0
                ? concat([
                    " =",
                    ifBreak("", " "),
                    indent(
                      concat([
                        ifBreak(concat([line, "  "])),
                        join(concat([line, "| "]), path.map(print, "types")),
                      ])
                    ),
                  ])
                : "",
            ])
          ),
        ])
      );
      return;
    }

    case "ScalarTypeExtension":
    case "ScalarTypeDefinition": {
      yield path.call(print, "description");
      yield n.description ? hardline : "";
      yield n.kind === "ScalarTypeExtension" ? "extend " : "";
      yield "scalar ";
      yield path.call(print, "name");
      yield printDirectives(path, print, n);
      return;
    }

    case "NonNullType": {
      yield path.call(print, "type");
      yield "!";
      return;
    }

    case "ListType": {
      yield "[";
      yield path.call(print, "type");
      yield "]";
      return;
    }

    default:
      /* istanbul ignore next */
      throw new Error("unknown graphql type: " + JSON.stringify(n.kind));
  }
}

function printDirectives(path, print, n) {
  if (n.directives.length === 0) {
    return "";
  }

  const printed = join(line, path.map(print, "directives"));

  if (n.kind === "FragmentDefinition" || n.kind === "OperationDefinition") {
    return group(concat([line, printed]));
  }

  return concat([" ", group(indent(concat([softline, printed])))]);
}

function printSequence(sequencePath, options, print) {
  const count = sequencePath.getValue().length;

  return sequencePath.map((path, i) => {
    const printed = print(path);

    if (
      isNextLineEmpty(options.originalText, path.getValue(), options.locEnd) &&
      i < count - 1
    ) {
      return concat([printed, hardline]);
    }

    return printed;
  });
}

function canAttachComment(node) {
  return node.kind && node.kind !== "Comment";
}

function printComment(commentPath) {
  const comment = commentPath.getValue();
  if (comment.kind === "Comment") {
    return "#" + comment.value.trimEnd();
  }

  /* istanbul ignore next */
  throw new Error("Not a comment: " + JSON.stringify(comment));
}

function printInterfaces(path, options, print) {
  const node = path.getNode();
  const parts = [];
  const { interfaces } = node;
  const printed = path.map((node) => print(node), "interfaces");

  for (let index = 0; index < interfaces.length; index++) {
    const interfaceNode = interfaces[index];
    parts.push(printed[index]);
    const nextInterfaceNode = interfaces[index + 1];
    if (nextInterfaceNode) {
      const textBetween = options.originalText.slice(
        interfaceNode.loc.end,
        nextInterfaceNode.loc.start
      );
      const hasComment = textBetween.includes("#");
      const separator = textBetween.replace(/#.*/g, "").trim();

      parts.push(separator === "," ? "," : " &");
      parts.push(hasComment ? line : " ");
    }
  }

  return parts;
}

function clean(node, newNode /*, parent*/) {
  delete newNode.loc;
  delete newNode.comments;
}

module.exports = {
  print: genericPrint,
  massageAstNode: clean,
  hasPrettierIgnore: hasIgnoreComment,
  insertPragma,
  printComment,
  canAttachComment,
};
