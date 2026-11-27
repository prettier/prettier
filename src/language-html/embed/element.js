import { group, hardline, indent } from "../../document/index.js";
import htmlWhitespace from "../../utilities/html-whitespace.js";
import { printClosingTag, printOpeningTag } from "../print/tag.js";
import getNodeContent from "../utilities/get-node-content.js";
import {
  htmlTrimPreserveIndentation,
  inferElementParser,
  isScriptLikeTag,
  isSvgWithPreserveSpace,
  isVueNonHtmlBlock,
} from "../utilities/index.js";

async function printScriptLikeElementContent(
  parser,
  textToDoc,
  print,
  path,
  options,
) {
  const textNode = path.node;
  let text = textNode.value;

  if (parser === "markdown") {
    text = htmlWhitespace.dedentString(text.replace(/^[^\S\n]*\n/, ""));
  }

  const textToDocOptions = { parser, __embeddedInHtml: true };

  if (options.parser === "html" && parser === "babel") {
    let sourceType = "script";
    const { attrMap } = path.parent;
    if (
      attrMap &&
      (attrMap.type === "module" ||
        ((attrMap.type === "text/babel" || attrMap.type === "text/jsx") &&
          attrMap["data-type"] === "module"))
    ) {
      sourceType = "module";
    }
    textToDocOptions.__babelSourceType = sourceType;
  }

  return await textToDoc(text, textToDocOptions);
}

async function printScriptLikeElement(parser, textToDoc, print, path, options) {
  let contentDoc = await path.call(
    () =>
      printScriptLikeElementContent(parser, textToDoc, print, path, options),
    "children",
    0,
  );

  if (
    options.parser === "vue" &&
    !options.vueIndentScriptAndStyle &&
    path.parent.kind === "root"
  ) {
    contentDoc = [hardline, contentDoc, hardline];
  } else {
    contentDoc = [indent([hardline, contentDoc]), hardline];
  }

  return [
    group(printOpeningTag(path, options, print)),
    contentDoc,
    printClosingTag(path.node, options),
  ];
}

async function printVueNonHtmlBlock(parser, textToDoc, print, path, options) {
  const { node } = path;
  const content = getNodeContent(node, options);
  let isEmpty = /^\s*$/.test(content);

  let contentDoc = "";
  if (!isEmpty) {
    contentDoc = await textToDoc(htmlTrimPreserveIndentation(content), {
      parser,
      __embeddedInHtml: true,
    });

    isEmpty = contentDoc === "";
  }

  return [
    group(printOpeningTag(path, options, print)),
    isEmpty ? "" : hardline,
    contentDoc,
    isEmpty ? "" : hardline,
    printClosingTag(node, options),
  ];
}

function printElement(path, options) {
  const { node } = path;
  if (node.isSelfClosing || isSvgWithPreserveSpace(node)) {
    return;
  }

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

  if (isVueNonHtmlBlock(node, options)) {
    const parser = inferElementParser(node, options);
    if (!parser) {
      return;
    }

    return (textToDoc, print, path, options) =>
      printVueNonHtmlBlock(parser, textToDoc, print, path, options);
  }
}

export { printElement };
