import { hardline, markAsRoot, replaceEndOfLine } from "../document/index.js";
import getMaxContinuousCount from "../utilities/get-max-continuous-count.js";
import inferParser from "../utilities/infer-parser.js";
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
      return (textToDoc) =>
        textToDoc(node.value, {
          // TODO: Rename this option since it's not used in HTML
          __onHtmlBindingRoot: (ast) => validateImportExport(ast, node.type),
          parser: "babel",
        });

    case "mdxFlowExpression":
      return async (textToDoc) => [
        "{ ",
        await printMdxJsExpression(textToDoc, node.value),
        " }",
      ];
  }
}

function isEmptyExpressionError(error) {
  const cause = error?.cause;
  return (
    cause?.code === "BABEL_PARSER_SYNTAX_ERROR" &&
    cause?.reasonCode === "ParseExpressionEmptyInput"
  );
}

async function printMdxJsExpression(textToDoc, code) {
  try {
    return await textToDoc(code, {
      parser: "__js_expression",
    });
  } catch (error) {
    if (isEmptyExpressionError(error)) {
      try {
        return await textToDoc(code, { parser: "babel" });
      } catch {
        // Throw the expression print error instead
      }
    }

    throw error;
  }
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
