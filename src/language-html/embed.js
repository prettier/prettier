"use strict";

const { hasNewlineInRange } = require("../common/util");
const {
  builders: { hardline, concat },
  utils: { removeLines }
} = require("../doc");

function embed(path, print, textToDoc, options) {
  const node = path.getValue();

  switch (node.type) {
    case "text": {
      const node = path.getValue();
      const parentNode = path.getParentNode();

      if (!parentNode) {
        return null;
      }

      let parser;

      if (parentNode.type === "style") {
        if (Object.keys(parentNode.attribs).length === 0) {
          parser = "css";
        }

        const typeAttr = parentNode.attribs["type"];

        if (typeAttr === "text/css") {
          parser = "css";
        } else if (typeAttr === "text/x-scss") {
          parser = "scss";
        } else if (typeAttr === "text/less") {
          parser = "less";
        } else {
          const langAttr = parentNode.attribs["lang"];

          if (langAttr === "postcss") {
            parser = "css";
          } else if (langAttr === "scss") {
            parser = "scss";
          } else if (langAttr === "less") {
            parser = "less";
          } else {
            parser = "css";
          }
        }
      }

      if (parentNode.type === "script") {
        if (Object.keys(parentNode.attribs).length === 0) {
          parser = "babylon";
        }

        const typeAttr = parentNode.attribs["type"];

        if (
          typeAttr === "text/javascript" ||
          typeAttr === "application/javascript"
        ) {
          parser = "babylon";
        } else if (typeAttr === "application/x-typescript") {
          parser = "typescript";
        } else {
          const langAttr = parentNode.attribs["lang"];

          if (langAttr === "ts" || langAttr === "tsx") {
            parser = "typescript";
          } else {
            parser = "babylon";
          }
        }
      }

      if (!parser) {
        return null;
      }

      return concat([
        hardline,
        textToDoc(getText(options, node), { parser: parser }, options)
      ]);
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
