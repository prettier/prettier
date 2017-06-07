"use strict";

const docBuilders = require("./doc-builders");
const concat = docBuilders.concat;
const join = docBuilders.join;
const hardline = docBuilders.hardline;
const line = docBuilders.line;
const softline = docBuilders.softline;
const group = docBuilders.group;
const indent = docBuilders.indent;
const ifBreak = docBuilders.ifBreak;

function genericPrint(path, options, print) {
  const n = path.getValue();
  if (!n) {
    return "";
  }

  if (typeof n === "string") {
    return n;
  }

  switch (n.kind) {
    case "Document": {
      return join(concat([hardline, hardline]), path.map(print, "definitions"));
    }
    case "OperationDefinition": {
      return concat([
        n.name === null ? "" : n.operation,
        n.name ? concat([" ", path.call(print, "name")]) : "",
        n.variableDefinitions && n.variableDefinitions.length
          ? group(
              concat([
                "(",
                indent(
                  concat([
                    softline,
                    join(
                      concat([",", ifBreak("", " "), softline]),
                      path.map(print, "variableDefinitions")
                    )
                  ])
                ),
                softline,
                ")"
              ])
            )
          : "",
        printDirectives(path, print, n),
        n.selectionSet ? (n.name === null ? "" : " ") : "",
        path.call(print, "selectionSet")
      ]);
    }
    case "FragmentDefinition": {
      return concat([
        "fragment ",
        path.call(print, "name"),
        " on ",
        path.call(print, "typeCondition"),
        printDirectives(path, print, n),
        " ",
        path.call(print, "selectionSet")
      ]);
    }
    case "SelectionSet": {
      return concat([
        "{",
        indent(
          concat([hardline, join(hardline, path.map(print, "selections"))])
        ),
        hardline,
        "}"
      ]);
    }
    case "Field": {
      return group(
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
                        concat([",", ifBreak("", " "), softline]),
                        path.map(print, "arguments")
                      )
                    ])
                  ),
                  softline,
                  ")"
                ])
              )
            : "",
          printDirectives(path, print, n),
          n.selectionSet ? " " : "",
          path.call(print, "selectionSet")
        ])
      );
    }
    case "Name": {
      return n.value;
    }
    case "StringValue": {
      return concat(['"', n.value, '"']);
    }
    case "IntValue":
    case "FloatValue":
    case "EnumValue": {
      return n.value;
    }
    case "BooleanValue": {
      return n.value ? "true" : "false";
    }
    case "NullValue": {
      return "null";
    }
    case "Variable": {
      return concat(["$", path.call(print, "name")]);
    }
    case "ListValue": {
      return group(
        concat([
          "[",
          indent(
            concat([
              softline,
              join(
                concat([",", ifBreak("", " "), softline]),
                path.map(print, "values")
              )
            ])
          ),
          softline,
          "]"
        ])
      );
    }
    case "ObjectValue": {
      return group(
        concat([
          "{",
          n.fields.length > 0 ? " " : "",
          indent(
            concat([
              softline,
              join(
                concat([",", ifBreak("", " "), softline]),
                path.map(print, "fields")
              )
            ])
          ),
          softline,
          ifBreak("", n.fields.length > 0 ? " " : ""),
          "}"
        ])
      );
    }
    case "ObjectField":
    case "Argument": {
      return concat([
        path.call(print, "name"),
        ": ",
        path.call(print, "value")
      ]);
    }

    case "Directive": {
      return concat([
        "@",
        path.call(print, "name"),
        n.arguments.length > 0
          ? group(
              concat([
                "(",
                indent(
                  concat([
                    softline,
                    join(
                      concat([",", ifBreak("", " "), softline]),
                      path.map(print, "arguments")
                    )
                  ])
                ),
                softline,
                ")"
              ])
            )
          : ""
      ]);
    }

    case "NamedType": {
      return path.call(print, "name");
    }

    case "VariableDefinition": {
      return concat([
        path.call(print, "variable"),
        ": ",
        path.call(print, "type"),
        n.defaultValue ? concat([" = ", path.call(print, "defaultValue")]) : ""
      ]);
    }

    case "FragmentSpread": {
      return concat([
        "...",
        path.call(print, "name"),
        printDirectives(path, print, n)
      ]);
    }

    case "InlineFragment": {
      return concat([
        "...",
        n.typeCondition
          ? concat([" on ", path.call(print, "typeCondition")])
          : "",
        printDirectives(path, print, n),
        " ",
        path.call(print, "selectionSet")
      ]);
    }

    case "UnionTypeDefinition": {
      return group(
        concat([
          "union ",
          path.call(print, "name"),
          " =",
          ifBreak("", " "),
          indent(
            concat([
              ifBreak(concat([line, "  "])),
              join(concat([line, "| "]), path.map(print, "types"))
            ])
          )
        ])
      );
    }

    default:
      throw new Error("unknown graphql type: " + JSON.stringify(n.kind));
  }
}

function printDirectives(path, print, n) {
  if (n.directives.length === 0) {
    return "";
  }

  return concat([
    " ",
    group(
      indent(
        concat([
          softline,
          join(
            concat([ifBreak("", " "), softline]),
            path.map(print, "directives")
          )
        ])
      )
    )
  ]);
}

module.exports = genericPrint;
