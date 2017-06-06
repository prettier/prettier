"use strict";

const docBuilders = require("./doc-builders");
const concat = docBuilders.concat;
const join = docBuilders.join;
const hardline = docBuilders.hardline;
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
        n.name === null ? "" : concat([n.operation, " "]),
        path.call(print, "name"),
        n.name ? " " : "",
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
    case "IntValue": {
      return n.value;
    }
    case "FloatValue": {
      return n.value;
    }
    case "BooleanValue": {
      return n.value ? 'true' : 'false';
    }
    case "Variable": {
      return concat(["$", path.call(print, "name")])
    }
    case "Argument": {
      return concat([
        path.call(print, "name"),
        ": ",
        path.call(print, "value")
      ]);
    }

    default:
      throw new Error("unknown graphql type: " + JSON.stringify(n.kind));
  }
}

module.exports = genericPrint;
