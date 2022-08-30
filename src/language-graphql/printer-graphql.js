import {
  join,
  hardline,
  line,
  softline,
  group,
  indent,
  ifBreak,
} from "../document/builders.js";
import { isNextLineEmpty, isNonEmptyArray } from "../common/util.js";
import createGetVisitorKeys from "../utils/create-get-visitor-keys.js";
import UnexpectedNodeError from "../utils/unexpected-node-error.js";
import { insertPragma } from "./pragma.js";
import { locStart, locEnd } from "./loc.js";
import visitorKeys from "./visitor-keys.evaluate.js";

const getVisitorKeys = createGetVisitorKeys(visitorKeys, "kind");

function genericPrint(path, options, print) {
  const node = path.getValue();

  switch (node.kind) {
    case "Document": {
      const parts = [];
      path.each((pathChild, index, definitions) => {
        parts.push(print());
        if (index !== definitions.length - 1) {
          parts.push(hardline);
          if (
            isNextLineEmpty(options.originalText, pathChild.getValue(), locEnd)
          ) {
            parts.push(hardline);
          }
        }
      }, "definitions");
      return [...parts, hardline];
    }
    case "OperationDefinition": {
      const hasOperation = options.originalText[locStart(node)] !== "{";
      const hasName = Boolean(node.name);
      return [
        hasOperation ? node.operation : "",
        hasOperation && hasName ? [" ", print("name")] : "",
        hasOperation && !hasName && isNonEmptyArray(node.variableDefinitions)
          ? " "
          : "",
        isNonEmptyArray(node.variableDefinitions)
          ? group([
              "(",
              indent([
                softline,
                join(
                  [ifBreak("", ", "), softline],
                  path.map(print, "variableDefinitions")
                ),
              ]),
              softline,
              ")",
            ])
          : "",
        printDirectives(path, print, node),
        node.selectionSet ? (!hasOperation && !hasName ? "" : " ") : "",
        print("selectionSet"),
      ];
    }
    case "FragmentDefinition": {
      return [
        "fragment ",
        print("name"),
        isNonEmptyArray(node.variableDefinitions)
          ? group([
              "(",
              indent([
                softline,
                join(
                  [ifBreak("", ", "), softline],
                  path.map(print, "variableDefinitions")
                ),
              ]),
              softline,
              ")",
            ])
          : "",
        " on ",
        print("typeCondition"),
        printDirectives(path, print, node),
        " ",
        print("selectionSet"),
      ];
    }
    case "SelectionSet": {
      return [
        "{",
        indent([
          hardline,
          join(hardline, printSequence(path, options, print, "selections")),
        ]),
        hardline,
        "}",
      ];
    }
    case "Field": {
      return group([
        node.alias ? [print("alias"), ": "] : "",
        print("name"),
        node.arguments.length > 0
          ? group([
              "(",
              indent([
                softline,
                join(
                  [ifBreak("", ", "), softline],
                  printSequence(path, options, print, "arguments")
                ),
              ]),
              softline,
              ")",
            ])
          : "",
        printDirectives(path, print, node),
        node.selectionSet ? " " : "",
        print("selectionSet"),
      ]);
    }
    case "Name": {
      return node.value;
    }
    case "StringValue": {
      if (node.block) {
        const lines = node.value.replace(/"""/g, "\\$&").split("\n");
        if (lines.length === 1) {
          lines[0] = lines[0].trim();
        }

        if (lines.every((line) => line === "")) {
          lines.length = 0;
        }

        return join(hardline, ['"""', ...lines, '"""']);
      }
      return [
        '"',
        node.value.replace(/["\\]/g, "\\$&").replace(/\n/g, "\\n"),
        '"',
      ];
    }
    case "IntValue":
    case "FloatValue":
    case "EnumValue": {
      return node.value;
    }
    case "BooleanValue": {
      return node.value ? "true" : "false";
    }
    case "NullValue": {
      return "null";
    }
    case "Variable": {
      return ["$", print("name")];
    }
    case "ListValue": {
      return group([
        "[",
        indent([
          softline,
          join([ifBreak("", ", "), softline], path.map(print, "values")),
        ]),
        softline,
        "]",
      ]);
    }
    case "ObjectValue": {
      return group([
        "{",
        options.bracketSpacing && node.fields.length > 0 ? " " : "",
        indent([
          softline,
          join([ifBreak("", ", "), softline], path.map(print, "fields")),
        ]),
        softline,
        ifBreak(
          "",
          options.bracketSpacing && node.fields.length > 0 ? " " : ""
        ),
        "}",
      ]);
    }
    case "ObjectField":
    case "Argument": {
      return [print("name"), ": ", print("value")];
    }

    case "Directive": {
      return [
        "@",
        print("name"),
        node.arguments.length > 0
          ? group([
              "(",
              indent([
                softline,
                join(
                  [ifBreak("", ", "), softline],
                  printSequence(path, options, print, "arguments")
                ),
              ]),
              softline,
              ")",
            ])
          : "",
      ];
    }

    case "NamedType": {
      return print("name");
    }

    case "VariableDefinition": {
      return [
        print("variable"),
        ": ",
        print("type"),
        node.defaultValue ? [" = ", print("defaultValue")] : "",
        printDirectives(path, print, node),
      ];
    }

    case "ObjectTypeExtension":
    case "ObjectTypeDefinition":
    case "InputObjectTypeExtension":
    case "InputObjectTypeDefinition":
    case "InterfaceTypeExtension":
    case "InterfaceTypeDefinition": {
      const { kind } = node;
      const parts = [];

      if (kind.endsWith("TypeDefinition")) {
        if (node.description) {
          parts.push(print("description"), hardline);
        }
      } else {
        parts.push("extend ");
      }

      if (kind.startsWith("ObjectType")) {
        parts.push("type");
      } else if (kind.startsWith("InputObjectType")) {
        parts.push("input");
      } else {
        parts.push("interface");
      }
      parts.push(" ", print("name"));

      if (!kind.startsWith("InputObjectType") && node.interfaces.length > 0) {
        parts.push(" implements ", ...printInterfaces(path, options, print));
      }

      parts.push(printDirectives(path, print, node));

      if (node.fields.length > 0) {
        parts.push([
          " {",
          indent([
            hardline,
            join(hardline, printSequence(path, options, print, "fields")),
          ]),
          hardline,
          "}",
        ]);
      }

      return parts;
    }

    case "FieldDefinition": {
      return [
        print("description"),
        node.description ? hardline : "",
        print("name"),
        node.arguments.length > 0
          ? group([
              "(",
              indent([
                softline,
                join(
                  [ifBreak("", ", "), softline],
                  printSequence(path, options, print, "arguments")
                ),
              ]),
              softline,
              ")",
            ])
          : "",
        ": ",
        print("type"),
        printDirectives(path, print, node),
      ];
    }

    case "DirectiveDefinition": {
      return [
        print("description"),
        node.description ? hardline : "",
        "directive ",
        "@",
        print("name"),
        node.arguments.length > 0
          ? group([
              "(",
              indent([
                softline,
                join(
                  [ifBreak("", ", "), softline],
                  printSequence(path, options, print, "arguments")
                ),
              ]),
              softline,
              ")",
            ])
          : "",
        node.repeatable ? " repeatable" : "",
        " on ",
        join(" | ", path.map(print, "locations")),
      ];
    }

    case "EnumTypeExtension":
    case "EnumTypeDefinition": {
      return [
        ...(node.description ? [print("description"), hardline] : []),
        node.kind === "EnumTypeExtension" ? "extend " : "",
        "enum ",
        print("name"),
        printDirectives(path, print, node),
        node.values.length > 0
          ? [
              " {",
              indent([
                hardline,
                join(hardline, printSequence(path, options, print, "values")),
              ]),
              hardline,
              "}",
            ]
          : "",
      ];
    }

    case "EnumValueDefinition": {
      return [
        print("description"),
        node.description ? hardline : "",
        print("name"),
        printDirectives(path, print, node),
      ];
    }

    case "InputValueDefinition": {
      return [
        print("description"),
        node.description ? (node.description.block ? hardline : line) : "",
        print("name"),
        ": ",
        print("type"),
        node.defaultValue ? [" = ", print("defaultValue")] : "",
        printDirectives(path, print, node),
      ];
    }

    case "SchemaExtension": {
      return [
        "extend schema",
        printDirectives(path, print, node),
        ...(node.operationTypes.length > 0
          ? [
              " {",
              indent([
                hardline,
                join(
                  hardline,
                  printSequence(path, options, print, "operationTypes")
                ),
              ]),
              hardline,
              "}",
            ]
          : []),
      ];
    }
    case "SchemaDefinition": {
      return [
        print("description"),
        node.description ? hardline : "",
        "schema",
        printDirectives(path, print, node),
        " {",
        node.operationTypes.length > 0
          ? indent([
              hardline,
              join(
                hardline,
                printSequence(path, options, print, "operationTypes")
              ),
            ])
          : "",
        hardline,
        "}",
      ];
    }

    case "OperationTypeDefinition": {
      return [node.operation, ": ", print("type")];
    }

    case "FragmentSpread": {
      return ["...", print("name"), printDirectives(path, print, node)];
    }

    case "InlineFragment": {
      return [
        "...",
        node.typeCondition ? [" on ", print("typeCondition")] : "",
        printDirectives(path, print, node),
        " ",
        print("selectionSet"),
      ];
    }

    case "UnionTypeExtension":
    case "UnionTypeDefinition": {
      return group([
        ...(node.description ? [print("description"), hardline] : []),
        group([
          node.kind === "UnionTypeExtension" ? "extend " : "",
          "union ",
          print("name"),
          printDirectives(path, print, node),
          node.types.length > 0
            ? [
                " =",
                ifBreak("", " "),
                indent([
                  ifBreak([line, "  "]),
                  join([line, "| "], path.map(print, "types")),
                ]),
              ]
            : "",
        ]),
      ]);
    }

    case "ScalarTypeExtension":
    case "ScalarTypeDefinition": {
      return [
        ...(node.description ? [print("description"), hardline] : []),
        node.kind === "ScalarTypeExtension" ? "extend " : "",
        "scalar ",
        print("name"),
        printDirectives(path, print, node),
      ];
    }

    case "NonNullType": {
      return [print("type"), "!"];
    }

    case "ListType": {
      return ["[", print("type"), "]"];
    }

    default:
      /* istanbul ignore next */
      throw new UnexpectedNodeError(node, "Graphql", "kind");
  }
}

function printDirectives(path, print, node) {
  if (node.directives.length === 0) {
    return "";
  }

  const printed = join(line, path.map(print, "directives"));

  if (
    node.kind === "FragmentDefinition" ||
    node.kind === "OperationDefinition"
  ) {
    return group([line, printed]);
  }

  return [" ", group(indent([softline, printed]))];
}

function printSequence(path, options, print, property) {
  return path.map((path, index, sequence) => {
    const printed = print();

    if (
      index < sequence.length - 1 &&
      isNextLineEmpty(options.originalText, path.getValue(), locEnd)
    ) {
      return [printed, hardline];
    }

    return printed;
  }, property);
}

function canAttachComment(node) {
  return node.kind !== "Comment";
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
  const printed = path.map(print, "interfaces");

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

      parts.push(" &", hasComment ? line : " ");
    }
  }

  return parts;
}

function clean(node, newNode /* , parent */) {
  // We print single line `""" string """` as multiple line string,
  // and the parser ignores space in multiple line string
  if (node.kind === "StringValue" && node.block && !node.value.includes("\n")) {
    newNode.value = newNode.value.trim();
  }
}
clean.ignoredProperties = new Set(["loc", "comments"]);

function hasPrettierIgnore(path) {
  const node = path.getValue();
  return node?.comments?.some(
    (comment) => comment.value.trim() === "prettier-ignore"
  );
}

const printer = {
  print: genericPrint,
  massageAstNode: clean,
  hasPrettierIgnore,
  insertPragma,
  printComment,
  canAttachComment,
  getVisitorKeys,
};

export default printer;
