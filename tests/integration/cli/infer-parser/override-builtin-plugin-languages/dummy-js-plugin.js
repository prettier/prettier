
import createPlugin from "../../../../config/utils/create-plugin.cjs";

const PARSER_NAME = 'dummy-js-parser'
const PRINT_MARK = `formatted by '${PARSER_NAME}' parser`

const languages = [
  {
    parsers: [PARSER_NAME],
    extensions: ['.js']
  }
]

export default {
  ...createPlugin({
    name: PARSER_NAME,
    print: (content) => `${content.replace(PRINT_MARK,"").trim()}\n${PRINT_MARK}`,
    finalNewLine: false,
  }),
  languages,
};
