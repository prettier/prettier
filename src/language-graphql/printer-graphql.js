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
import { insertPragma } from "./pragma.js";
import { locStart, locEnd } from "./loc.js";

async function genericPrint(path, options, print) {
  const node = path.getValue();
  if (!node) {
    return "";
  }

  if (typeof node === "string") {
    return node;
  }

  switch (node.kind) {
    case "Document": {
      const parts = [];
      await path.each(async (pathChild, index, definitions) => {
        parts.push(await print());
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
        hasOperation && hasName ? [" ", await print("name")] : "",
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
                  await path.map(print, "variableDefinitions")
                ),
              ]),
              softline,
              ")",
            ])
          : "",
        await printDirectives(path, print, node),
        node.selectionSet ? (!hasOperation && !hasName ? "" : " ") : "",
        await print("selectionSet"),
      ];
    }
    case "FragmentDefinition": {
      return [
        "fragment ",
        await print("name"),
        isNonEmptyArray(node.variableDefinitions)
          ? group([
              "(",
              indent([
                softline,
                join(
                  [ifBreak("", ", "), softline],
                  await path.map(print, "variableDefinitions")
                ),
              ]),
              softline,
              ")",
            ])
          : "",
        " on ",
        await print("typeCondition"),
        await printDirectives(path, print, node),
        " ",
        await print("selectionSet"),
      ];
    }
    case "SelectionSet": {
      return [
        "{",
        indent([
          hardline,
          join(
            hardline,
            await printSequence(path, options, print, "selections")
          ),
        ]),
        hardline,
        "}",
      ];
    }
    case "Field": {
      return group([
        node.alias ? [await print("alias"), ": "] : "",
        await print("name"),
        node.arguments.length > 0
          ? group([
              "(",
              indent([
                softline,
                join(
                  [ifBreak("", ", "), softline],
                  await printSequence(path, options, print, "arguments")
                ),
              ]),
              softline,
              ")",
            ])
          : "",
        await printDirectives(path, print, node),
        node.selectionSet ? " " : "",
        await print("selectionSet"),
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
      return ["$", await print("name")];
    }
    case "ListValue": {
      return group([
        "[",
        indent([
          softline,
          join([ifBreak("", ", "), softline], await path.map(print, "values")),
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
          join([ifBreak("", ", "), softline], await path.map(print, "fields")),
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
      return [await print("name"), ": ", await print("value")];
    }

    case "Directive": {
      return [
        "@",
        await print("name"),
        node.arguments.length > 0
          ? group([
              "(",
              indent([
                softline,
                join(
                  [ifBreak("", ", "), softline],
                  await printSequence(path, options, print, "arguments")
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
        await print("variable"),
        ": ",
        await print("type"),
        node.defaultValue ? [" = ", await print("defaultValue")] : "",
        await printDirectives(path, print, node),
      ];
    }

    case "ObjectTypeExtension":
    case "ObjectTypeDefinition": {
      return [
        await print("description"),
        node.description ? hardline : "",
        node.kind === "ObjectTypeExtension" ? "extend " : "",
        "type ",
        await print("name"),
        node.interfaces.length > 0
          ? [" implements ", ...(await printInterfaces(path, options, print))]
          : "",
        await printDirectives(path, print, node),
        node.fields.length > 0
          ? [
              " {",
              indent([
                hardline,
                join(
                  hardline,
                  await printSequence(path, options, print, "fields")
                ),
              ]),
              hardline,
              "}",
            ]
          : "",
      ];
    }

    case "FieldDefinition": {
      return [
        await print("description"),
        node.description ? hardline : "",
        await print("name"),
        node.arguments.length > 0
          ? group([
              "(",
              indent([
                softline,
                join(
                  [ifBreak("", ", "), softline],
                  await printSequence(path, options, print, "arguments")
                ),
              ]),
              softline,
              ")",
            ])
          : "",
        ": ",
        await print("type"),
        await printDirectives(path, print, node),
      ];
    }

    case "DirectiveDefinition": {
      return [
        await print("description"),
        node.description ? hardline : "",
        "directive ",
        "@",
        await print("name"),
        node.arguments.length > 0
          ? group([
              "(",
              indent([
                softline,
                join(
                  [ifBreak("", ", "), softline],
                  await printSequence(path, options, print, "arguments")
                ),
              ]),
              softline,
              ")",
            ])
          : "",
        node.repeatable ? " repeatable" : "",
        " on ",
        join(" | ", await path.map(print, "locations")),
      ];
    }

    case "EnumTypeExtension":
    case "EnumTypeDefinition": {
      return [
        await print("description"),
        node.description ? hardline : "",
        node.kind === "EnumTypeExtension" ? "extend " : "",
        "enum ",
        await print("name"),
        await printDirectives(path, print, node),

        node.values.length > 0
          ? [
              " {",
              indent([
                hardline,
                join(
                  hardline,
                  await printSequence(path, options, print, "values")
                ),
              ]),
              hardline,
              "}",
            ]
          : "",
      ];
    }

    case "EnumValueDefinition": {
      return [
        await print("description"),
        node.description ? hardline : "",
        await print("name"),
        await printDirectives(path, print, node),
      ];
    }

    case "InputValueDefinition": {
      return [
        await print("description"),
        node.description ? (node.description.block ? hardline : line) : "",
        await print("name"),
        ": ",
        await print("type"),
        node.defaultValue ? [" = ", await print("defaultValue")] : "",
        await printDirectives(path, print, node),
      ];
    }

    case "InputObjectTypeExtension":
    case "InputObjectTypeDefinition": {
      return [
        await print("description"),
        node.description ? hardline : "",
        node.kind === "InputObjectTypeExtension" ? "extend " : "",
        "input ",
        await print("name"),
        await printDirectives(path, print, node),
        node.fields.length > 0
          ? [
              " {",
              indent([
                hardline,
                join(
                  hardline,
                  await printSequence(path, options, print, "fields")
                ),
              ]),
              hardline,
              "}",
            ]
          : "",
      ];
    }

    case "SchemaExtension": {
      return [
        "extend schema",
        await printDirectives(path, print, node),
        ...(node.operationTypes.length > 0
          ? [
              " {",
              indent([
                hardline,
                join(
                  hardline,
                  await printSequence(path, options, print, "operationTypes")
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
        await print("description"),
        node.description ? hardline : "",
        "schema",
        await printDirectives(path, print, node),
        " {",
        node.operationTypes.length > 0
          ? indent([
              hardline,
              join(
                hardline,
                await printSequence(path, options, print, "operationTypes")
              ),
            ])
          : "",
        hardline,
        "}",
      ];
    }

    case "OperationTypeDefinition": {
      return [await print("operation"), ": ", await print("type")];
    }

    case "InterfaceTypeExtension":
    case "InterfaceTypeDefinition": {
      return [
        await print("description"),
        node.description ? hardline : "",
        node.kind === "InterfaceTypeExtension" ? "extend " : "",
        "interface ",
        await print("name"),
        node.interfaces.length > 0
          ? [" implements ", ...(await printInterfaces(path, options, print))]
          : "",
        await printDirectives(path, print, node),
        node.fields.length > 0
          ? [
              " {",
              indent([
                hardline,
                join(
                  hardline,
                  await printSequence(path, options, print, "fields")
                ),
              ]),
              hardline,
              "}",
            ]
          : "",
      ];
    }

    case "FragmentSpread": {
      return [
        "...",
        await print("name"),
        await printDirectives(path, print, node),
      ];
    }

    case "InlineFragment": {
      return [
        "...",
        node.typeCondition ? [" on ", await print("typeCondition")] : "",
        await printDirectives(path, print, node),
        " ",
        await print("selectionSet"),
      ];
    }

    case "UnionTypeExtension":
    case "UnionTypeDefinition": {
      return group([
        await print("description"),
        node.description ? hardline : "",
        group([
          node.kind === "UnionTypeExtension" ? "extend " : "",
          "union ",
          await print("name"),
          await printDirectives(path, print, node),
          node.types.length > 0
            ? [
                " =",
                ifBreak("", " "),
                indent([
                  ifBreak([line, "  "]),
                  join([line, "| "], await path.map(print, "types")),
                ]),
              ]
            : "",
        ]),
      ]);
    }

    case "ScalarTypeExtension":
    case "ScalarTypeDefinition": {
      return [
        await print("description"),
        node.description ? hardline : "",
        node.kind === "ScalarTypeExtension" ? "extend " : "",
        "scalar ",
        await print("name"),
        await printDirectives(path, print, node),
      ];
    }

    case "NonNullType": {
      return [await print("type"), "!"];
    }

    case "ListType": {
      return ["[", await print("type"), "]"];
    }

    default:
      /* istanbul ignore next */
      throw new Error("unknown graphql type: " + JSON.stringify(node.kind));
  }
}

async function printDirectives(path, print, node) {
  if (node.directives.length === 0) {
    return "";
  }

  const printed = join(line, await path.map(print, "directives"));

  if (
    node.kind === "FragmentDefinition" ||
    node.kind === "OperationDefinition"
  ) {
    return group([line, printed]);
  }

  return [" ", group(indent([softline, printed]))];
}

function printSequence(path, options, print, property) {
  return path.map(async (path, index, sequence) => {
    const printed = await print();

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

async function printInterfaces(path, options, print) {
  const node = path.getNode();
  const parts = [];
  const { interfaces } = node;
  const printed = await path.map((node) => print(node), "interfaces");

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
};

export default printer;
