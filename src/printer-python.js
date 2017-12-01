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

function printBody(path, print) {
  return join(concat([hardline, hardline]), path.map(print, "body"));
}

function printForIn(path, print) {
  return concat([
    "for ",
    path.call(print, "target"),
    " in ",
    path.call(print, "iter")
  ]);
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
      return concat([printBody(path, print), hardline]);
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
        indent(concat([hardline, printBody(path, print)]))
      ]);
    }

    case "arguments": {
      let parts = printArguments(print, path, "args", "defaults");

      // add varargs (*args)

      if (n.vararg) {
        parts.push(concat(["*", path.call(print, "vararg")]));
      }

      // add keyword only arguments

      if (n.kwonlyargs.length > 0) {
        parts.push("*");
        parts = parts.concat(
          printArguments(print, path, "kwonlyargs", "kw_defaults")
        );
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
      return concat([
        path.call(print, "func"),
        "(",
        join(", ", path.map(print, "args")),
        ")"
      ]);
    }

    case "Str": {
      return `"${n.s}"`;
    }

    case "Num": {
      return path.call(print, "n");
    }

    case "float":
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
      const parts = [
        printForIn(path, print),
        ":",
        indent(concat([hardline, printBody(path, print)]))
      ];

      if (n.orelse.length > 0) {
        parts.push(line);
        parts.push("else:");
        parts.push(indent(concat([line, concat(path.map(print, "orelse"))])));
      }

      return concat(parts);
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
      return group(
        concat([
          join(", ", path.map(print, "targets")),
          " = ",
          path.call(print, "value")
        ])
      );
    }

    case "AugAssign": {
      return concat([
        path.call(print, "target"),
        " ",
        path.call(print, "op"),
        "= ",
        path.call(print, "value")
      ]);
    }

    case "Dict": {
      const keys = path.map(print, "keys");
      const values = path.map(print, "values");

      const pairs = keys.map((k, i) => concat([softline, k, ": ", values[i]]));

      return concat(["{", indent(join(",", pairs)), softline, "}"]);
    }

    case "ClassDef": {
      let bases = [];

      if (n.bases.length > 0) {
        bases = ["(", join(",", path.map(print, "bases")), ")"];
      }

      return concat([
        "class ",
        n.name,
        concat(bases),
        ":",
        indent(concat([hardline, printBody(path, print)]))
      ]);
    }

    case "Attribute": {
      return concat([path.call(print, "value"), ".", n.attr]);
    }

    case "Add": {
      return "+";
    }

    case "USub":
    case "Sub": {
      return "-";
    }

    case "Mult": {
      return "*";
    }

    case "MatMult": {
      return "@";
    }

    case "Div": {
      return "/";
    }

    case "FloorDiv": {
      return "//";
    }

    case "Mod": {
      return "%";
    }

    case "Pow": {
      return "**";
    }

    case "LShift": {
      return "<<";
    }

    case "RShift": {
      return ">>";
    }

    case "BitAnd": {
      return "&";
    }

    case "BitXor": {
      return "^";
    }

    case "BitOr": {
      return "|";
    }

    case "Compare": {
      const ops = path.map(print, "ops");
      const comparators = path.map(print, "comparators");

      const pairs = ops.map((op, i) => concat([" ", op, " ", comparators[i]]));

      return concat([path.call(print, "left"), ...pairs]);
    }

    case "Lt": {
      return "<";
    }

    case "LtE": {
      return "<=";
    }

    case "Gt": {
      return ">";
    }

    case "GtE": {
      return ">=";
    }

    case "Eq": {
      return "==";
    }

    case "NotEq": {
      return "!=";
    }

    case "Import": {
      return concat(["import ", join(", ", path.map(print, "names"))]);
    }

    case "ImportFrom": {
      return concat([
        "from ",
        ".".repeat(n.level),
        n.module,
        " import ",
        join(", ", path.map(print, "names"))
      ]);
    }

    case "alias": {
      if (n.asname) {
        return `${n.name} as ${n.asname}`;
      }

      return n.name;
    }

    case "While": {
      return concat([
        "while ",
        path.call(print, "test"),
        ":",
        indent(concat([hardline, printBody(path, print)]))
      ]);
    }

    case "If": {
      let ifType = "if ";

      if (path.getParentNode().ast_type === "If") {
        ifType = "elif ";
      }

      let parts = [
        ifType,
        path.call(print, "test"),
        ":",
        indent(concat([hardline, printBody(path, print)]))
      ];

      if (n.orelse.length > 0) {
        if (n.orelse.length === 1 && n.orelse[0].ast_type !== "If") {
          parts = [
            ...parts,
            line,
            "else:",
            indent(concat([line, concat(path.map(print, "orelse"))]))
          ];
        } else {
          parts = [...parts, line, concat(path.map(print, "orelse"))];
        }
      }

      return concat(parts);
    }

    case "Subscript": {
      return concat([
        path.call(print, "value"),
        "[",
        path.call(print, "slice"),
        "]"
      ]);
    }

    case "Index": {
      return path.call(print, "value");
    }

    case "Slice": {
      const parts = [path.call(print, "lower")];

      if (n.upper) {
        parts.push(path.call(print, "upper"));
      }

      if (n.step) {
        if (!n.upper) {
          parts.push("");
        }

        parts.push(path.call(print, "step"));
      }

      return join(":", parts);
    }

    case "UnaryOp": {
      return concat([path.call(print, "op"), path.call(print, "operand")]);
    }

    case "ListComp": {
      return group(
        concat([
          "[",
          path.call(print, "elt"),
          line,
          join(line, path.map(print, "generators")),
          "]"
        ])
      );
    }

    case "comprehension": {
      let parts = [printForIn(path, print)];

      if (n.ifs.length > 0) {
        parts = [
          ...parts,
          line,
          "if",
          line,
          join(line, path.map(print, "ifs"))
        ];
      }

      return concat(parts);
    }

    case "BinOp": {
      return concat([
        path.call(print, "left"),
        line,
        path.call(print, "op"),
        line,
        path.call(print, "right")
      ]);
    }

    case "NotIn": {
      return "not in";
    }

    case "Try": {
      let parts = [
        "try:",
        indent(concat([hardline, printBody(path, print)])),
        hardline,
        join(hardline, path.map(print, "handlers"))
      ];

      if (n.orelse.length > 0) {
        parts = [
          ...parts,
          hardline,
          "else:",
          indent(concat([hardline, concat(path.map(print, "orelse"))]))
        ];
      }

      if (n.finalbody.length > 0) {
        parts = [
          ...parts,
          hardline,
          "finally:",
          indent(concat([hardline, concat(path.map(print, "finalbody"))]))
        ];
      }

      return concat(parts);
    }

    case "ExceptHandler": {
      let parts = ["except"];

      if (n.type) {
        parts = [...parts, line, path.call(print, "type")];
      }

      if (n.name) {
        parts = [...parts, line, "as", line, n.name];
      }

      return concat([
        group(concat([...parts, ":"])),
        indent(concat([hardline, printBody(path, print)]))
      ]);
    }

    case "Raise": {
      return group(concat(["raise", line, path.call(print, "exc")]));
    }

    default:
      /* istanbul ignore next */
      throw new Error("unknown python type: " + JSON.stringify(n.ast_type));
  }
}

module.exports = genericPrint;
