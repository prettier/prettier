import { group, hardline, indent, line } from "../document/index.js";
import printAngularControlFlowBlockParameters from "./embed/angular-control-flow-block-parameters.js";
import printAttribute from "./embed/attribute.js";
import { printScriptLikeElement } from "./embed/element.js";
import { formatAttributeValue } from "./embed/utilities.js";
import getNodeContent from "./get-node-content.js";
import {
  needsToBorrowPrevClosingTagEndMarker,
  printClosingTag,
  printClosingTagSuffix,
  printOpeningTag,
  printOpeningTagPrefix,
} from "./print/tag.js";
import {
  htmlTrimPreserveIndentation,
  inferElementParser,
  isScriptLikeTag,
  isVueNonHtmlBlock,
} from "./utilities/index.js";
import isVueSfcWithTypescriptScript from "./utilities/is-vue-sfc-with-typescript-script.js";

const embeddedAngularControlFlowBlocks = new Set([
  "if",
  "else if",
  "for",
  "switch",
  "case",
]);

function embed(path, options) {
  const { node } = path;

  switch (node.kind) {
    case "element":
      if (isScriptLikeTag(node, options)) {
        if (!(node.children.length === 1 && node.children[0].kind === "text")) {
          return;
        }

        const parser = inferElementParser(node, options);

        if (!parser) {
          return;
        }

        return (textToDoc, print, path, options) =>
          printScriptLikeElement(parser, textToDoc, print, path, options);
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
      if (node.parent.kind === "interpolation") {
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

    case "angularControlFlowBlockParameters":
      if (!embeddedAngularControlFlowBlocks.has(path.parent.name)) {
        return;
      }

      return printAngularControlFlowBlockParameters;

    case "angularLetDeclarationInitializer":
      return (textToDoc) =>
        formatAttributeValue(node.value, textToDoc, {
          parser: "__ng_binding",
          __isInHtmlAttribute: false,
        });
  }
}

export default embed;
