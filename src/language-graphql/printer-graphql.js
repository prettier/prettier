import {
  group,
  hardline,
  ifBreak,
  indent,
  join,
  line,
  softline,
} from "../document/index.js";
import { printDanglingComments } from "../main/comments/print.js";
import isNonEmptyArray from "../utilities/is-non-empty-array.js";
import UnexpectedNodeError from "../utilities/unexpected-node-error.js";
import getVisitorKeys from "./get-visitor-keys.js";
import { locStart } from "./loc.js";
import { massageAstNode } from "./massage-ast/index.js";
import { insertPragma } from "./pragma.js";
import { printArguments } from "./print/arguments.js";
import { printDescription } from "./print/description.js";
import { printDirectives } from "./print/directives.js";
import { printSequence } from "./print/sequence.js";
import { printVariableDefinitions } from "./print/variable-definitions.js";

function genericPrint(path, options, print) {
  const { node } = path;

  switch (node.kind) {
    case "Document":
      return [
        ...join(hardline, printSequence(path, options, print, "definitions")),
        hardline,
      ];

    case "OperationDefinition": {
      const hasOperation = options.originalText[locStart(node)] !== "{";
      const hasName = Boolean(node.name);
      return [
        printDescription(path, options, print),
        hasOperation ? node.operation : "",
        hasOperation && hasName ? [" ", print("name")] : "",
        hasOperation && !hasName && isNonEmptyArray(node.variableDefinitions)
          ? " "
          : "",
        printVariableDefinitions(path, print),
        printDirectives(path, print),
        !hasOperation && !hasName ? "" : " ",
        print("selectionSet"),
      ];
    }
    case "FragmentDefinition":
      return [
        printDescription(path, options, print),
        "fragment ",
        print("name"),
        printVariableDefinitions(path, print),
        " on ",
        print("typeCondition"),
        printDirectives(path, print),
        " ",
        print("selectionSet"),
      ];

    case "SelectionSet":
      return [
        "{",
        indent([
          hardline,
          join(hardline, printSequence(path, options, print, "selections")),
        ]),
        hardline,
        "}",
      ];

    case "Field":
      return group([
        node.alias ? [print("alias"), ": "] : "",
        print("name"),
        isNonEmptyArray(node.arguments)
          ? group([
              "(",
              indent([
                softline,
                join(
                  [ifBreak("", ", "), softline],
                  printSequence(path, options, print, "arguments"),
                ),
              ]),
              softline,
              ")",
            ])
          : "",
        printDirectives(path, print),
        node.selectionSet ? " " : "",
        print("selectionSet"),
      ]);

    case "Name":
      return node.value;

    case "StringValue":
      if (node.block) {
        const lines = node.value
          .replaceAll('"""', String.raw`\"""`)
          .split("\n");
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
        node.value
          .replaceAll(/["\\]/g, String.raw`\$&`)
          .replaceAll("\n", String.raw`\n`),
        '"',
      ];

    case "IntValue":
    case "FloatValue":
    case "EnumValue":
      return node.value;

    case "BooleanValue":
      return node.value ? "true" : "false";

    case "NullValue":
      return "null";

    case "Variable":
      return ["$", print("name")];

    case "ListValue":
      return group([
        "[",
        indent([
          softline,
          join([ifBreak("", ", "), softline], path.map(print, "values")),
        ]),
        softline,
        "]",
      ]);

    case "ObjectValue": {
      const isEmpty = !isNonEmptyArray(node.fields);
      const bracketSpace = options.bracketSpacing && !isEmpty ? " " : "";
      return group([
        "{",
        bracketSpace,
        printDanglingComments(path, options, { indent: true }),
        isEmpty
          ? ""
          : [
              indent([
                softline,
                join([ifBreak("", ", "), softline], path.map(print, "fields")),
              ]),
            ],
        softline,
        ifBreak("", bracketSpace),
        "}",
      ]);
    }

    case "ObjectField":
    case "Argument":
    case "FragmentArgument":
      return [print("name"), ": ", print("value")];

    case "Directive":
      return ["@", print("name"), printArguments(path, options, print)];

    case "NamedType":
      return print("name");

    case "VariableDefinition":
      return [
        printDescription(path, options, print),
        print("variable"),
        ": ",
        print("type"),
        node.defaultValue ? [" = ", print("defaultValue")] : "",
        printDirectives(path, print),
      ];

    case "ObjectTypeExtension":
    case "ObjectTypeDefinition":
    case "InputObjectTypeExtension":
    case "InputObjectTypeDefinition":
    case "InterfaceTypeExtension":
    case "InterfaceTypeDefinition": {
      const { kind } = node;
      const parts = [];

      if (kind.endsWith("TypeDefinition")) {
        parts.push(printDescription(path, options, print));
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

      if (
        !kind.startsWith("InputObjectType") &&
        isNonEmptyArray(node.interfaces)
      ) {
        parts.push(
          " implements ",
          indent([group([join([" &", line], path.map(print, "interfaces"))])]),
        );
      }

      parts.push(printDirectives(path, print));

      if (isNonEmptyArray(node.fields)) {
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

    case "FieldDefinition":
      return [
        printDescription(path, options, print),
        print("name"),
        isNonEmptyArray(node.arguments)
          ? group([
              "(",
              indent([
                softline,
                join(
                  [ifBreak("", ", "), softline],
                  printSequence(path, options, print, "arguments"),
                ),
              ]),
              softline,
              ")",
            ])
          : "",
        ": ",
        print("type"),
        printDirectives(path, print),
      ];

    case "DirectiveDefinition":
      return [
        printDescription(path, options, print),
        "directive ",
        "@",
        print("name"),
        isNonEmptyArray(node.arguments)
          ? group([
              "(",
              indent([
                softline,
                join(
                  [ifBreak("", ", "), softline],
                  printSequence(path, options, print, "arguments"),
                ),
              ]),
              softline,
              ")",
            ])
          : "",
        printDirectives(path, print),
        node.repeatable ? " repeatable" : "",
        " on ",
        ...join(" | ", path.map(print, "locations")),
      ];

    case "DirectiveExtension":
      return [
        "extend directive @",
        print("name"),
        printDirectives(path, print),
      ];

    case "EnumTypeExtension":
    case "EnumTypeDefinition":
      return [
        printDescription(path, options, print),
        node.kind === "EnumTypeExtension" ? "extend " : "",
        "enum ",
        print("name"),
        printDirectives(path, print),
        isNonEmptyArray(node.values)
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

    case "EnumValueDefinition":
      return [
        printDescription(path, options, print),
        print("name"),
        printDirectives(path, print),
      ];

    case "InputValueDefinition":
      return [
        printDescription(path, options, print),
        print("name"),
        ": ",
        print("type"),
        node.defaultValue ? [" = ", print("defaultValue")] : "",
        printDirectives(path, print),
      ];

    case "SchemaExtension":
      return [
        "extend schema",
        printDirectives(path, print),
        ...(isNonEmptyArray(node.operationTypes)
          ? [
              " {",
              indent([
                hardline,
                join(
                  hardline,
                  printSequence(path, options, print, "operationTypes"),
                ),
              ]),
              hardline,
              "}",
            ]
          : []),
      ];

    case "SchemaDefinition":
      return [
        printDescription(path, options, print),
        "schema",
        printDirectives(path, print),
        " {",
        isNonEmptyArray(node.operationTypes)
          ? indent([
              hardline,
              join(
                hardline,
                printSequence(path, options, print, "operationTypes"),
              ),
            ])
          : "",
        hardline,
        "}",
      ];

    case "OperationTypeDefinition":
      return [node.operation, ": ", print("type")];

    case "FragmentSpread":
      return [
        "...",
        print("name"),
        printArguments(path, options, print),
        printDirectives(path, print),
      ];

    case "InlineFragment":
      return [
        "...",
        node.typeCondition ? [" on ", print("typeCondition")] : "",
        printDirectives(path, print),
        " ",
        print("selectionSet"),
      ];

    case "UnionTypeExtension":
    case "UnionTypeDefinition":
      return group([
        printDescription(path, options, print),
        group([
          node.kind === "UnionTypeExtension" ? "extend " : "",
          "union ",
          print("name"),
          printDirectives(path, print),
          isNonEmptyArray(node.types)
            ? [
                " =",
                ifBreak("", " "),
                indent([
                  ifBreak([line, "| "]),
                  join([line, "| "], path.map(print, "types")),
                ]),
              ]
            : "",
        ]),
      ]);

    case "ScalarTypeExtension":
    case "ScalarTypeDefinition":
      return [
        printDescription(path, options, print),
        node.kind === "ScalarTypeExtension" ? "extend " : "",
        "scalar ",
        print("name"),
        printDirectives(path, print),
      ];

    case "NonNullType":
      return [print("type"), "!"];

    case "ListType":
      return ["[", print("type"), "]"];

    default:
      /* c8 ignore next */
      throw new UnexpectedNodeError(node, "Graphql", "kind");
  }
}

function canAttachComment(node /* , ancestors */) {
  return node.kind !== "Comment";
}

function printComment({ node: comment }) {
  if (comment.kind === "Comment") {
    return "#" + comment.value.trimEnd();
  }

  /* c8 ignore next */
  throw new Error("Not a comment: " + JSON.stringify(comment));
}

function hasPrettierIgnore(path) {
  const { node } = path;
  return node?.comments?.some(
    (comment) => comment.value.trim() === "prettier-ignore",
  );
}

const printer = {
  print: genericPrint,
  massageAstNode,
  hasPrettierIgnore,
  insertPragma,
  printComment,
  canAttachComment,
  getVisitorKeys,
};

export default printer;
