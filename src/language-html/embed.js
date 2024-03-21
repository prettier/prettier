import {
  breakParent,
  group,
  hardline,
  indent,
  line,
} from "../document/builders.js";
import printFrontMatter from "../utils/front-matter/print.js";
import printAngularControlFlowBlockParameters from "./embed/angular-control-flow-block-parameters.js";
import printAttribute from "./embed/attribute.js";
import getNodeContent from "./get-node-content.js";
import {
  needsToBorrowPrevClosingTagEndMarker,
  printClosingTag,
  printClosingTagSuffix,
  printOpeningTag,
  printOpeningTagPrefix,
} from "./print/tag.js";
import {
  dedentString,
  htmlTrimPreserveIndentation,
  inferElementParser,
  isScriptLikeTag,
  isVueNonHtmlBlock,
} from "./utils/index.js";
import isVueSfcWithTypescriptScript from "./utils/is-vue-sfc-with-typescript-script.js";

const embeddedAngularControlFlowBlocks = new Set([
  "if",
  "else if",
  "for",
  "switch",
  "case",
]);

function embed(path, options) {
  const { node } = path;

  switch (node.type) {
    case "element":
      if (isScriptLikeTag(node) || node.type === "interpolation") {
        // Fall through to "text"
        return;
      }

      if (!node.isSelfClosing && isVueNonHtmlBlock(node, options)) {
        const parser = inferElementParser(node, options);
        if (!parser) {
          return;
        }

        return async (textToDoc, print) => {
          const content = getNodeContent(node, options);
          let isEmpty = /^\s*$/.test(content);
          let doc = "";
          if (!isEmpty) {
            doc = await textToDoc(htmlTrimPreserveIndentation(content), {
              parser,
              __embeddedInHtml: true,
            });
            isEmpty = doc === "";
          }

          return [
            printOpeningTagPrefix(node, options),
            group(printOpeningTag(path, options, print)),
            isEmpty ? "" : hardline,
            doc,
            isEmpty ? "" : hardline,
            printClosingTag(node, options),
            printClosingTagSuffix(node, options),
          ];
        };
      }
      break;

    case "text":
      if (isScriptLikeTag(node.parent)) {
        const parser = inferElementParser(node.parent, options);
        if (parser) {
          return async (textToDoc) => {
            const value =
              parser === "markdown"
                ? dedentString(node.value.replace(/^[^\S\n]*\n/, ""))
                : node.value;
            const textToDocOptions = { parser, __embeddedInHtml: true };
            if (options.parser === "html" && parser === "babel") {
              let sourceType = "script";
              const { attrMap } = node.parent;
              if (
                attrMap &&
                (attrMap.type === "module" ||
                  (attrMap.type === "text/babel" &&
                    attrMap["data-type"] === "module"))
              ) {
                sourceType = "module";
              }
              textToDocOptions.__babelSourceType = sourceType;
            }

            return [
              breakParent,
              printOpeningTagPrefix(node, options),
              await textToDoc(value, textToDocOptions),
              printClosingTagSuffix(node, options),
            ];
          };
        }
      } else if (node.parent.type === "interpolation") {
        return async (textToDoc) => {
          const textToDocOptions = {
            __isInHtmlInterpolation: true, // to avoid unexpected `}}`
            __embeddedInHtml: true,
          };
          if (options.parser === "angular") {
            textToDocOptions.parser = "__ng_interpolation";
          } else if (options.parser === "vue") {
            textToDocOptions.parser = isVueSfcWithTypescriptScript(
              path,
              options,
            )
              ? "__vue_ts_expression"
              : "__vue_expression";
          } else {
            textToDocOptions.parser = "__js_expression";
          }

          return [
            indent([line, await textToDoc(node.value, textToDocOptions)]),
            node.parent.next &&
            needsToBorrowPrevClosingTagEndMarker(node.parent.next)
              ? " "
              : line,
          ];
        };
      }
      break;

    case "attribute":
      return printAttribute(path, options);

    case "front-matter":
      return (textToDoc) => printFrontMatter(node, textToDoc);

    case "angularControlFlowBlockParameters":
      if (!embeddedAngularControlFlowBlocks.has(path.parent.name)) {
        return;
      }

      return printAngularControlFlowBlockParameters;
  }
}

export default embed;
