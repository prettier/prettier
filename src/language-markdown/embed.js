import { hardline, markAsRoot, replaceEndOfLine } from "../document/index.js";
import getMaxContinuousCount from "../utilities/get-max-continuous-count.js";
import inferParser from "../utilities/infer-parser.js";
import { printJsExpression } from "./acorn/printer.js";

function embed(path, options) {
  const { node } = path;

  switch (node.type) {
    case "code": {
      const { lang: language } = node;
      if (!language) {
        return;
      }

      let parser;
      // https://shiki.style/references/engine-js-compat#supported-languages
      if (language === "angular-ts") {
        parser = inferParser(options, { language: "typescript" });
      } else if (language === "angular-html") {
        parser = "angular";
      } else {
        parser = inferParser(options, { language });
      }

      if (!parser) {
        return;
      }

      return async (textToDoc) => {
        const textToDocOptions = { parser };

        // Override the filepath option.
        // This is because whether the trailing comma of type parameters
        // should be printed depends on whether it is `*.ts` or `*.tsx`.
        // https://github.com/prettier/prettier/issues/15282
        if (language === "ts" || language === "typescript") {
          textToDocOptions.filepath = "dummy.ts";
        } else if (language === "tsx") {
          textToDocOptions.filepath = "dummy.tsx";
        }

        const doc = await textToDoc(node.value, textToDocOptions);

        const styleUnit = options.__inJsTemplate ? "~" : "`";
        const style = styleUnit.repeat(
          Math.max(3, getMaxContinuousCount(node.value, styleUnit) + 1),
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

    // MDX
    case "mdxjsEsm":
      return async (textToDoc) =>
        await textToDoc(node.value.trimEnd(), {
          // TODO: Rename this option since it's not used in HTML
          __onHtmlBindingRoot: validateImportExport,
          parser: "babel",
        });

    case "mdxFlowExpression":
    case "mdxJsxAttributeValueExpression":
    case "mdxTextExpression":
      return async (textToDoc, print, path, options) => [
        "{",
        await printJsExpression(textToDoc, print, path, options),
        "}",
      ];

    case "mdxJsxFlowElement":
    case "mdxJsxTextElement":
      return (textToDoc) => {
        const text = options.originalText.slice(
          node.position.start.offset,
          node.position.end.offset,
        );
        return textToDoc(`<$>${text}</$>`, {
          parser: "__js_expression",
          rootMarker: "mdx",
        });
      };
  }
}

function validateImportExport(ast, type) {
  const {
    program: { body },
  } = ast;

  // https://github.com/micromark/micromark-extension-mdxjs-esm/blob/3fdf3d3e597c707ac08ca94ba52d99d88f87ddfe/dev/lib/syntax.js#L18-L23
  if (
    !body.every(
      (node) =>
        node.type === "ExportAllDeclaration" ||
        node.type === "ExportDefaultDeclaration" ||
        node.type === "ExportNamedDeclaration" ||
        node.type === "ImportDeclaration",
    )
  ) {
    throw new Error(`Unexpected '${type}' in MDX.`);
  }
}

export default embed;
