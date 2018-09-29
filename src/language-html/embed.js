"use strict";

const { hasNewlineInRange } = require("../common/util");
const {
  builders: { hardline, concat, markAsRoot, literalline, indent },
  utils: { removeLines, mapDoc, stripTrailingHardline }
} = require("../doc");
const { isScriptTagNode } = require("./utils");

function embed(path, print, textToDoc /*, options */) {
  return null; // TODO

  const node = path.getValue();

  switch (node.type) {
    case "text": {
      const parentNode = path.getParentNode();

      if (node.data.trim().length !== 0 && isScriptTagNode(parentNode)) {
        const parser = inferScriptParser(parentNode);
        if (parser) {
          return concat([
            indent(
              concat([
                hardline,
                stripTrailingHardline(textToDoc(node.data, { parser }))
              ])
            ),
            hardline
          ]);
        }
      }

      break;
    }

    case "attribute": {
      /*
       * Vue binding syntax: JS expressions
       * :class="{ 'some-key': value }"
       * v-bind:id="'list-' + id"
       * v-if="foo && !bar"
       * @click="someFunction()"
       */
      if (/(^@)|(^v-)|:/.test(node.key) && !/^\w+$/.test(node.value)) {
        const doc = textToDoc(node.value, {
          parser: "__js_expression",
          // Use singleQuote since HTML attributes use double-quotes.
          // TODO(azz): We still need to do an entity escape on the attribute.
          singleQuote: true
        });
        return concat([
          node.key,
          '="',
          hasNewlineInRange(node.value, 0, node.value.length)
            ? doc
            : removeLines(doc),
          '"'
        ]);
      }

      break;
    }

    case "yaml":
      return markAsRoot(
        concat([
          "---",
          hardline,
          node.value.trim()
            ? replaceNewlinesWithLiterallines(
                textToDoc(node.value, { parser: "yaml" })
              )
            : "",
          "---"
        ])
      );
  }
}

function inferScriptParser(node) {
  if (
    node.type === "script" &&
    ((!node.attribs.lang && !node.attribs.type) ||
      node.attribs.type === "text/javascript" ||
      node.attribs.type === "application/javascript")
  ) {
    return "babylon";
  }

  if (
    node.type === "script" &&
    (node.attribs.type === "application/x-typescript" ||
      node.attribs.lang === "ts")
  ) {
    return "typescript";
  }

  if (node.type === "style") {
    return "css";
  }

  return null;
}

function replaceNewlinesWithLiterallines(doc) {
  return mapDoc(
    doc,
    currentDoc =>
      typeof currentDoc === "string" && currentDoc.includes("\n")
        ? concat(
            currentDoc
              .split(/(\n)/g)
              .map((v, i) => (i % 2 === 0 ? v : literalline))
          )
        : currentDoc
  );
}

module.exports = embed;
