"use strict";

const { hasNewlineInRange } = require("../common/util");
const {
  builders: { hardline, concat },
  utils: { stripTrailingHardline, removeLines }
} = require("../doc");

function embed(path, print, textToDoc, options) {
  const node = path.getValue();

  switch (node.type) {
    case "text": {
      const parent = path.getParentNode();
      // Inline JavaScript
      if (
        parent.type === "script" &&
        ((!parent.attribs.lang && !parent.attribs.lang) ||
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
        return concat([hardline, stripTrailingHardline(doc)]);
      }

      break;
    }

    case "attribute": {
      /*
       * Vue binding sytax: JS expressions
       * :class="{ 'some-key': value }"
       * v-bind:id="'list-' + id"
       * v-if="foo && !bar"
       * @click="someFunction()"
       */
      if (/(^@)|(^v-)|:/.test(node.key) && !/^\w+$/.test(node.value)) {
        const doc = textToDoc(node.value, {
          parser: parseJavaScriptExpression,
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
    }
  }
}

function parseJavaScriptExpression(text, parsers) {
  // Force parsing as an expression
  const ast = parsers.babylon(`(${text})`);
  // Extract expression from the declaration
  return {
    type: "File",
    program: ast.program.body[0].expression
  };
}

function getText(options, node) {
  return options.originalText.slice(
    options.locStart(node),
    options.locEnd(node)
  );
}

module.exports = embed;
