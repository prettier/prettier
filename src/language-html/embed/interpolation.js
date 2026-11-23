import { indent, line } from "../document/index.js";
import { needsToBorrowPrevClosingTagEndMarker } from "./print/tag.js";
import isVueSfcWithTypescriptScript from "./utilities/is-vue-sfc-with-typescript-script.js";

async function printInterpolationExpression(textToDoc, print, path, options) {
  const { node } = path;
  const textToDocOptions = {
    __isInHtmlInterpolation: true, // to avoid unexpected `}}`
    __embeddedInHtml: true,
  };
  if (options.parser === "angular") {
    textToDocOptions.parser = "__ng_interpolation";
  } else if (options.parser === "vue") {
    textToDocOptions.parser = isVueSfcWithTypescriptScript(path, options)
      ? "__vue_ts_expression"
      : "__vue_expression";
  } else {
    textToDocOptions.parser = "__js_expression";
  }

  return [
    indent([line, await textToDoc(node.value, textToDocOptions)]),
    node.parent.next && needsToBorrowPrevClosingTagEndMarker(node.parent.next)
      ? " "
      : line,
  ];
}

export { printInterpolationExpression };
