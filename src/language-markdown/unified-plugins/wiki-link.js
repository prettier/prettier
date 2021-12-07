"use strict";

const visit = require("unist-util-visit");

function wikiLink() {
  const entityType = "wikiLink";
  const wikiLinkRegex = /^\[\[(?<linkContents>.+?)]](?<trailingContents>.*)/s;
  function transformer(tree) {
    visit(tree, "text", (node, index, parent) => {
      const matched = wikiLinkRegex.exec(
        // @ts-expect-error
        node.value
      );
      if (matched) {
        const linkContents = matched.groups.linkContents.trim();
        const { trailingContents } = matched.groups;
        node.type = entityType;
        // @ts-expect-error
        node.value = linkContents;
        if (trailingContents) {
          parent.children.push({
            type: "text",
            // @ts-expect-error
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
      }
    });
  }

  return transformer;
}

module.exports = wikiLink;

// function wikiLink() {
//   const entityType = "wikiLink";
//   const wikiLinkRegex = /^\[\[(?<linkContents>.+?)]]/s;
//   const proto = this.Parser.prototype;
//   const methods = proto.inlineMethods;
//   methods.splice(methods.indexOf("link"), 0, entityType);
//   proto.inlineTokenizers.wikiLink = tokenizer;

//   function tokenizer(eat, value) {
//     const match = wikiLinkRegex.exec(value);

//     if (match) {
//       const linkContents = match.groups.linkContents.trim();

//       return eat(match[0])({
//         type: entityType,
//         value: linkContents,
//       });
//     }
//   }

//   tokenizer.locator = function (value, fromIndex) {
//     return value.indexOf("[", fromIndex);
//   };
// }

// module.exports = wikiLink;
