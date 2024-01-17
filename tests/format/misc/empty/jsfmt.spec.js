import prettier from "../../../config/prettier-entry.js";

const parsers = (await prettier.getSupportInfo()).options
  .find((option) => option.name === "parser")
  .choices.filter((choice) => !choice.deprecated)
  .map((choice) => choice.value);

runFormatTest(
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
  parsers,
);
