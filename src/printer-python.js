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

  switch (n.ast_type) {
    case "Module": {
      return concat([
        join(concat([hardline, hardline]), path.map(print, "body")),
        hardline
      ]);
    }

    case "FunctionDef": {
      return concat([
        "def ",
        path.call(print, "name"),
        // concat(["(", path.call(print, "args"), ")"]),
        group(
          concat([
            "(",
            indent(concat([softline, path.call(print, "args")])),
            softline,
            ")"
          ])
        ),
        ":",
        indent(concat([line, concat(path.map(print, "body"))]))
      ]);
    }

    case "arguments": {
      // TODO: default args
      // keyword only arguments

      // python AST represent arguments and default
      // value in two different lists, so we grab
      // the list of the arguments and the list of
      // default values and we merge them together and sort
      // them by column. Then we iterated one by one and
      // if the next element is a default value we merge it with
      // the current one

      const merge = [...n.args, ...n.defaults].sort(
        (a, b) => a.col_offset - b.col_offset
      );

      const parts = [];

      let currentArgument = 0;
      let currentDefault = 0;

      for (let i = 0; i < merge.length; i++) {
        const next = merge[i + 1];

        const part = [path.call(print, "args", currentArgument)];

        currentArgument += 1;

        if (next && next.ast_type != "arg") {
          part.push("=", path.call(print, "defaults", currentDefault));

          i += 1;
          currentDefault += 1;
        }

        parts.push(concat(part));
      }

      // add varargs (*args)

      if (n.vararg) {
        parts.push(concat(["*", path.call(print, "vararg")]));
      }

      // add keyword arguments (**kwargs)

      if (n.kwarg) {
        parts.push(concat(["**", path.call(print, "kwarg")]));
      }

      return join(concat([", ", softline]), parts);
    }

    case "arg": {
      return n.arg;
    }

    case "Expr": {
      return path.call(print, "value");
    }

    case "Call": {
      return concat([n.func.id, "(", join(", ", path.map(print, "args")), ")"]);
    }

    case "Str": {
      return `"${n.s}"`;
    }

    case "Num": {
      return path.call(print, "n");
    }

    case "int": {
      return `${n.n}`;
    }

    case "Name": {
      return n.id;
    }

    default:
      /* istanbul ignore next */
      throw new Error("unknown python type: " + JSON.stringify(n.ast_type));
  }
}

module.exports = genericPrint;
