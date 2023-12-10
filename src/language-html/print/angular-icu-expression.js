import {
  softline,
  line,
  indent,
  join,
  group,
} from "../../document/builders.js";

/*
  <span i18n>
    Updated {minutes, plural,
      =0 {just now}
      =1 {one minute ago}
      other {{{minutes}} minutes ago}
    }
  </span>
*/

function printAngularIcuExpression(path, options, print) {
  const { node } = path;
  return group([
    "{",
    node.switchValue,
    ", ",
    node.clause,
    node.cases.length > 0
      ? [",", indent([line, join(line, path.map(print, "cases"))])]
      : "",
    softline,
    "}",
  ]);
}

function printAngularIcuCase(path, options, print) {
  const { node } = path;
  return [
    node.value,
    " {",
    group([indent([softline, path.map(print, "expression")]), softline]),
    "}",
  ];
}

export { printAngularIcuExpression, printAngularIcuCase };
