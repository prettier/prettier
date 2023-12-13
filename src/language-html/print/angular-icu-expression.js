import {
  softline,
  line,
  indent,
  join,
  group,
} from "../../document/builders.js";
import htmlWhitespaceUtils from "../../utils/html-whitespace-utils.js";
import { printClosingTagEnd, printOpeningTagStart } from "./tag.js";

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
  return [
    printOpeningTagStart(node, options),
    group([
      node.switchValue.trim(),
      ", ",
      node.clause,
      node.cases.length > 0
        ? [",", indent([line, join(line, path.map(print, "cases"))])]
        : "",
      softline,
    ]),
    printClosingTagEnd(node, options),
  ];
}

function printAngularIcuCase(path, options, print) {
  const { node } = path;
  return [
    node.value,
    " {",
    group([
      indent([
        softline,
        path.map(({ node }) => {
          // FIXME: We need a fundamental solution.
          // Like this: https://github.com/prettier/prettier/blob/c1ebae2e8303841e59bc02e9e719a93e964ab0e9/src/language-html/print-preprocess.js#L254
          if (node.type === "text" && !htmlWhitespaceUtils.trim(node.value)) {
            return "";
          }

          return print();
        }, "expression"),
      ]),
      softline,
    ]),
    "}",
  ];
}

export { printAngularIcuExpression, printAngularIcuCase };
