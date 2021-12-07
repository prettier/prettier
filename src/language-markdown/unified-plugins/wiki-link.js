"use strict";

const visit = require("unist-util-visit");

function calculatePositions({ position, leadingContents, trailingContents }) {
  const leadingPosition = leadingContents
    ? {
        start: position.start,
        end: {
          line: 0,
          column: 0,
          offset: position.start.offset + leadingContents.length,
        },
      }
    : undefined;

  const trailingPosition = trailingContents
    ? {
        start: {
          line: 0,
          column: 0,
          offset: position.end.offset - trailingContents.length,
        },
        end: position.end,
      }
    : undefined;

  const linkPosition = {
    start: leadingPosition
      ? { line: 0, column: 0, offset: leadingPosition.end.offset + 1 }
      : position.start,
    end: trailingPosition
      ? { line: 0, column: 0, offset: trailingPosition.start.offset - 1 }
      : position.end,
  };

  return { leadingPosition, trailingPosition, linkPosition };
}

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

          const { leadingPosition, trailingPosition, linkPosition } =
            calculatePositions({
              position: node.position,
              leadingContents,
              trailingContents,
            });

          if (leadingContents) {
            children.push({
              type: "text",
              value: leadingContents,
              position: leadingPosition,
            });
          }

          children.push({
            type: "wikiLink",
            value: linkContents.trim(),
            position: linkPosition,
          });

          if (trailingContents) {
            children.push({
              type: "text",
              value: trailingContents,
              position: trailingPosition,
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
