import { group, hardline, indent } from "../../document/index.js";
import htmlWhitespace from "../../utilities/html-whitespace.js";
import { printClosingTag, printOpeningTag } from "../print/tag.js";

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
  const contentDoc = await path.call(
    () =>
      printScriptLikeElementContent(parser, textToDoc, print, path, options),
    "children",
    0,
  );

  return [
    group(printOpeningTag(path, options, print)),
    indent([hardline, contentDoc]),
    hardline,
    printClosingTag(path.node, options),
  ];
}

export { printScriptLikeElement };
