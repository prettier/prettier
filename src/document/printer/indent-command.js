const INDENT_COMMAND_TYPE_INDENT = "INDENT_COMMAND_TYPE_INDENT";
const INDENT_COMMAND_TYPE_DEDENT = "INDENT_COMMAND_TYPE_DEDENT";
const INDENT_COMMAND_TYPE_WIDTH = "INDENT_COMMAND_TYPE_WIDTH";
const INDENT_COMMAND_TYPE_STRING = "INDENT_COMMAND_TYPE_STRING";

/**
@typedef {{
  readonly type: typeof INDENT_COMMAND_TYPE_WIDTH,
  readonly width: number,
}} WidthIndentCommand
@typedef {{
  readonly type: typeof INDENT_COMMAND_TYPE_STRING,
  readonly string: string,
}} StringIndentCommand
@typedef {
  | typeof INDENT_COMMAND_INDENT
  | typeof INDENT_COMMAND_DEDENT
  | WidthIndentCommand
  | StringIndentCommand
} IndentCommand
*/

export {
  INDENT_COMMAND_TYPE_DEDENT,
  INDENT_COMMAND_TYPE_INDENT,
  INDENT_COMMAND_TYPE_STRING,
  INDENT_COMMAND_TYPE_WIDTH,
};
