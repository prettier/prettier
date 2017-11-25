"use strict";

const docBuilders = require("./doc-builders");
const concat = docBuilders.concat;
const join = docBuilders.join;
const hardline = docBuilders.hardline;
// const line = docBuilders.line;
// const softline = docBuilders.softline;
// const group = docBuilders.group;
// const indent = docBuilders.indent;
// const ifBreak = docBuilders.ifBreak;

function genericPrint(path, options, print) {
  const n = path.getValue();
  if (!n) {
    return "";
  }

  if (typeof n === "string") {
    return n;
  }

  console.log(n.ast_type);

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
        ":"
      ]);
    }

    case "arguments": {
      // TODO: default args, *args, **kwargs,
      // keyword only arguments
      return join(", ", n.args.map(a => a.arg));
    }
  }

  // TODO: implement all the ast types
  return "hello world";
}

module.exports = genericPrint;
