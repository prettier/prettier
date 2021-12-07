"use strict";

const visit = require("unist-util-visit");

function wikiLink() {
  const wikiLinkRegex =
    /(?<leadingContents>.*)\[\[(?<linkContents>.+?)]](?<trailingContents>.*)/s;
  function transformer(tree) {
    visit(tree, "text", (node, index, parent) => {
      const matched = wikiLinkRegex.exec(
        // @ts-expect-error
        node.value
      );
      if (matched) {
        const { leadingContents, linkContents, trailingContents } =
          matched.groups;

        if (linkContents) {
          const children = [];

          if (leadingContents) {
            children.push({
              type: "text",
              value: leadingContents,
              position: {
                start: node.position.start,
                end: {
                  line: 0,
                  column: 0,
                  offset: node.position.start.offset + leadingContents.length,
                },
              },
            });
          }

          children.push({
            type: "wikiLink",
            value: linkContents.trim(),
            // TODO: calculate
            position: node.position,
          });

          if (trailingContents) {
            children.push({
              type: "text",
              value: trailingContents,
              position: {
                start: {
                  line: 0,
                  column: 0,
                  offset: node.position.end.offset - trailingContents.length,
                },
                end: node.position.end,
              },
            });
          }

          parent.children = children;
        }
      }
    });
  }

  return transformer;
}

module.exports = wikiLink;
