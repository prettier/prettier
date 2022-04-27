// import prettier from "../../../../index.js";

// const parsers = prettier
//   .getSupportInfo()
//   .options.find((option) => option.name === "parser")
//   .choices.filter((choice) => !choice.deprecated)
//   .map((choice) => choice.value);

// TODO: Use the code above when possible
const parsers = [
  "flow",
  "babel",
  "babel-flow",
  "babel-ts",
  "typescript",
  "acorn",
  "espree",
  "meriyah",
  "css",
  "less",
  "scss",
  "json",
  "json5",
  "json-stringify",
  "graphql",
  "markdown",
  "mdx",
  "vue",
  "yaml",
  "glimmer",
  "html",
  "angular",
  "lwc",
];

run_spec(
  {
    importMeta: import.meta,
    snippets: [
      // empty
      "",
      // space
      " ",
      "     ",
      // `\n`
      "\n",
      " \n",
      " \n ",
      "\n\n\n\n",
      " \n  \n \n\n",
      " \n  \n \n\n ",
      // `\r`
      "\r",
      " \r",
      " \r ",
      "\r\r\r\r",
      " \r  \r \r\r",
      " \r  \r \r\r ",
      // `\r\n`
      "\r\n",
      " \r\n",
      " \r\n ",
      "\r\n\r\n\r\n\r\n",
      " \r\n  \r\n \r\n\r\n",
      " \r\n  \r\n \r\n\r\n ",
      // mixed `\r` `\r\n` '\n'
      " \r \r\n \n ",
    ].map((code) => ({ code, output: "" })),
  },
  parsers
);
