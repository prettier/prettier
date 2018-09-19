"use strict";

const { hasNewlineInRange } = require("../common/util");
const {
  builders: { hardline, concat, markAsRoot, literalline },
  utils: { removeLines, mapDoc }
} = require("../doc");

function embed(path, print, textToDoc, options) {
  const node = path.getValue();

  switch (node.type) {
    case "text": {
      const parent = path.getParentNode();
      // Inline JavaScript
      if (
        parent.type === "script" &&
        (!parent.attribs.lang ||
          parent.attribs.type === "text/javascript" ||
          parent.attribs.type === "application/javascript")
      ) {
        const parser = options.parser === "flow" ? "flow" : "babylon";
        const doc = textToDoc(getText(options, node), { parser });
        return concat([hardline, doc]);
      }

      // Inline TypeScript
      if (
        parent.type === "script" &&
        (parent.attribs.type === "application/x-typescript" ||
          parent.attribs.lang === "ts")
      ) {
        const doc = textToDoc(
          getText(options, node),
          { parser: "typescript" },
          options
        );
        return concat([hardline, doc]);
      }

      // Inline Styles
      if (parent.type === "style") {
        const doc = textToDoc(getText(options, node), { parser: "css" });
        return concat([hardline, doc]);
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
          "---",
          hardline
        ])
      );
  }
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

function getText(options, node) {
  return options.originalText.slice(
    options.locStart(node),
    options.locEnd(node)
  );
}

module.exports = embed;
