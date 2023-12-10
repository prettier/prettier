import { softline, line, indent, join } from "../../document/builders.js";

/*
  <span i18n>
    Updated {minutes, plural,
      =0 {just now}
      =1 {one minute ago}
      other {{{minutes}} minutes ago}
    }
  </span>
*/

function printAngularICUExpression(path, options, print) {
  const { node } = path;
  return [
    "{",
    node.switchValue,
    ", ",
    node.clause,
    node.cases.length > 0
      ? [",", indent([line, join(line, path.map(print, "cases"))])]
      : "",
    softline,
    "}",
  ];
}

function printAngularExpansionCase(path, options, print) {
  const { node } = path;
  return [
    node.value,
    " {",
    indent([line, join(" ", path.map(print, "expression"))]),
    "}",
  ];
}

export { printAngularICUExpression, printAngularExpansionCase };
