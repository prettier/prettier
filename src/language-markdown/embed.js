import { hardline, markAsRoot, replaceEndOfLine } from "../document/index.js";
import getMaxContinuousCount from "../utilities/get-max-continuous-count.js";
import inferParser from "../utilities/infer-parser.js";
import { printJsExpression, printJsProgram } from "./acorn/printer.js";
import { getFencedCodeBlockValue } from "./utilities.js";

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
      return printJsProgram;

    case "mdxFlowExpression":
      return async (textToDoc, print, path, options) => [
        path.parent.type === "mdxJsxFlowElement" ? hardline : "",
        "{",
        await printJsExpression(textToDoc, print, path, options),
        "}",
      ];
    case "mdxJsxAttributeValueExpression":
    case "mdxTextExpression":
      return async (textToDoc, print, path, options) => [
        "{",
        await printJsExpression(textToDoc, print, path, options),
        "}",
      ];
  }
}

export default embed;
