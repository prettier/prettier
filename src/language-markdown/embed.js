import { hardline, markAsRoot } from "../document/builders.js";
import { replaceEndOfLine } from "../document/utils.js";
import getMaxContinuousCount from "../utils/get-max-continuous-count.js";
import inferParser from "../utils/infer-parser.js";
import { getFencedCodeBlockValue } from "./utils.js";

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

        // Override the filepath option.
        // This is because whether the trailing comma of type parameters
        // should be printed depends on whether it is `*.ts` or `*.tsx`.
        // https://github.com/prettier/prettier/issues/15282
        if (node.lang === "ts" || node.lang === "typescript") {
          newOptions.filepath = "dummy.ts";
        } else if (node.lang === "tsx") {
          newOptions.filepath = "dummy.tsx";
        }

        const doc = await textToDoc(
          getFencedCodeBlockValue(node, options.originalText),
          newOptions,
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
    // MDX
    case "import":
    case "export":
      return (textToDoc) =>
        textToDoc(node.value, {
          // TODO: Rename this option since it's not used in HTML
          __onHtmlBindingRoot: (ast) => validateImportExport(ast, node.type),
          parser: "babel",
        });
    case "jsx":
      return (textToDoc) =>
        textToDoc(`<$>${node.value}</$>`, {
          parser: "__js_expression",
          rootMarker: "mdx",
        });
  }

  return null;
}

function validateImportExport(ast, type) {
  const {
    program: { body },
  } = ast;

  // https://github.com/mdx-js/mdx/blob/3430138958c9c0344ecad9d59e0d6b5d72bedae3/packages/remark-mdx/extract-imports-and-exports.js#L16
  if (
    !body.every(
      (node) =>
        node.type === "ImportDeclaration" ||
        node.type === "ExportDefaultDeclaration" ||
        node.type === "ExportNamedDeclaration",
    )
  ) {
    throw new Error(`Unexpected '${type}' in MDX.`);
  }
}

export default embed;
