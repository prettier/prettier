"use strict";

const docBuilders = require("./doc-builders");
const concat = docBuilders.concat;
const join = docBuilders.join;
const hardline = docBuilders.hardline;
const line = docBuilders.line;
// const softline = docBuilders.softline;
// const group = docBuilders.group;
const indent = docBuilders.indent;
// const ifBreak = docBuilders.ifBreak;

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
        concat(["(", path.call(print, "args"), ")"]),
        ":",
        indent(concat([line, concat(path.map(print, "body"))]))
      ]);
    }

    case "arguments": {
      // TODO: default args, *args, **kwargs,
      // keyword only arguments
      return join(", ", n.args.map(a => a.arg));
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

    case "Name": {
      return n.id;
    }

    default:
      /* istanbul ignore next */
      throw new Error("unknown python type: " + JSON.stringify(n.ast_type));
  }
}

module.exports = genericPrint;
