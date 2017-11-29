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

function printArguments(print, path, argsKey, defaultsKey) {
  const n = path.getValue();

  // python AST represent arguments and default
  // value in two different lists, so we grab
  // the list of the arguments and the list of
  // default values and we merge them together and sort
  // them by column. Then we iterated one by one and
  // if the next element is a default value we merge it with
  // the current one

  const merge = [...n[argsKey], ...n[defaultsKey]].sort(
    (a, b) => a.col_offset - b.col_offset
  );

  const parts = [];

  let currentArgument = 0;
  let currentDefault = 0;

  for (let i = 0; i < merge.length; i++) {
    const next = merge[i + 1];

    const part = [path.call(print, argsKey, currentArgument)];

    currentArgument += 1;

    if (next && next.ast_type != "arg") {
      part.push("=", path.call(print, defaultsKey, currentDefault));

      i += 1;
      currentDefault += 1;
    }

    parts.push(concat(part));
  }

  return parts;
}

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
      let parts = printArguments(print, path, "args", "defaults");

      // add varargs (*args)

      if (n.vararg) {
        parts.push(concat(["*", path.call(print, "vararg")]));
      }

      // add keyword arguments (**kwargs)

      if (n.kwarg) {
        parts.push(concat(["**", path.call(print, "kwarg")]));
      }

      if (n.kwonlyargs.length > 0) {
        parts.push("*");
        parts = parts.concat(
          printArguments(print, path, "kwonlyargs", "kw_defaults")
        );
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

    case "NameConstant": {
      return `${n.value}`;
    }

    case "For": {
      return concat([
        "for ",
        path.call(print, "target"),
        " in ",
        path.call(print, "iter"),
        ":",
        indent(concat([line, concat(path.map(print, "body"))]))
      ]);
    }

    case "Tuple": {
      const needsParens =
        ["List", "Tuple"].indexOf(path.getParentNode().ast_type) !== -1;

      const elts = join(", ", path.map(print, "elts"));

      if (needsParens) {
        return concat(["(", elts, ")"]);
      }

      return elts;
    }

    case "List": {
      return concat(["[", join(", ", path.map(print, "elts")), "]"]);
    }

    case "Assign": {
      return concat([
        join(", ", path.map(print, "targets")),
        " = ",
        path.call(print, "value")
      ]);
    }

    default:
      /* istanbul ignore next */
      throw new Error("unknown python type: " + JSON.stringify(n.ast_type));
  }
}

module.exports = genericPrint;
