"use strict";

const prettier = require("prettier-local");
const { group, hardline, indent, softline } = prettier.doc.builders;

/**
 * This plugin tests whether a dynamically-created AstPath can be used
 * in the printing process.
 */
module.exports = {
  languages: [
    {
      name: "foo",
      parsers: ["foo-parser"],
      extensions: [".foo"],
    },
  ],
  parsers: {
    "foo-parser": {
      parse: (text) => JSON.parse(text),
      astFormat: "foo-ast",
    },
  },
  printers: {
    "foo-ast": {
      print: (path, options, print) => {
        const node = path.getNode();

        // If we encounter a `baz` element, we want to reparse its content and
        // print it specially.
        if (node.type === "element" && node.name === "baz") {
          const newAst = {
            type: "list",
            content: node.children[0].value.split(","),
          };
          const newPath = new path.constructor(newAst);
          return ["<baz>", print(newPath), "</baz>"];
        }

        switch (node.type) {
          case "element":
            return [
              `<${node.name}>`,
              indent([hardline, group(path.map(print, "children"))]),
              hardline,
              `</${node.name}>`,
              softline,
            ];
          case "string":
            return node.value;
          case "list":
            return node.content.join("; ");
        }
      },
    },
  },
};
