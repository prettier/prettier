import getMaxContinuousCount from "../utils/get-max-continuous-count.js";
import { hardline, markAsRoot } from "../document/builders.js";
import { replaceEndOfLine } from "../document/utils.js";
import printFrontMatter from "../utils/front-matter/print.js";
import inferParser from "../utils/infer-parser.js";

function embed(path, options) {
  const { node } = path;

  if (node.type === "code" && node.lang !== null) {
    const parser = inferParser(options, { language: node.lang });
    if (parser) {
      return async (textToDoc) => {
        const styleUnit = options.__inJsTemplate ? "~" : "`";
        const style = styleUnit.repeat(
          Math.max(3, getMaxContinuousCount(node.value, styleUnit) + 1),
        );
        const newOptions = { parser };
        if (node.lang === "tsx") {
          newOptions.filepath = "dummy.tsx";
        }

        const doc = await textToDoc(
          node.value,
          newOptions
        );

        return markAsRoot([
          style,
          node.lang,
          node.meta ? " " + node.meta : "",
          hardline,
          replaceEndOfLine(doc),
          hardline,
          style,
        ]);
      };
    }
  }

  switch (node.type) {
    case "front-matter":
      return (textToDoc) => printFrontMatter(node, textToDoc);

    // MDX
    case "import":
    case "export":
      return (textToDoc) => textToDoc(node.value, { parser: "babel" });
    case "jsx":
      return (textToDoc) =>
        textToDoc(`<$>${node.value}</$>`, {
          parser: "__js_expression",
          rootMarker: "mdx",
        });
  }

  return null;
}

export default embed;
