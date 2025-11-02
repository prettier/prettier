const INDENT_COMMAND_TYPE_WIDTH = "INDENT_COMMAND_TYPE_WIDTH";
const INDENT_COMMAND_TYPE_STRING = "INDENT_COMMAND_TYPE_STRING";

/**
@typedef {{type: typeof INDENT_COMMAND_TYPE_WIDTH, width: number}} WidthIndentCommand
@typedef {{type: typeof INDENT_COMMAND_TYPE_STRING, string: string}} StringIndentCommand
@typedef {
  | typeof INDENT_COMMAND_INDENT
  | typeof INDENT_COMMAND_DEDENT
  | WidthIndentCommand
  | StringIndentCommand
} IndentCommand
*/

const INDENT_COMMAND_INDENT = "INDENT_COMMAND_INDENT";
const INDENT_COMMAND_DEDENT = "INDENT_COMMAND_DEDENT";

/**
@param {IndentCommand} command
@returns {command is WidthIndentCommand}
*/
function isWidthIndentCommand(command) {
  // @ts-expect-error -- Safe
  return command.type === INDENT_COMMAND_TYPE_WIDTH;
}

/**
@param {IndentCommand} command
@returns {command is StringIndentCommand}
*/
function isStringIndentCommand(command) {
  // @ts-expect-error -- Safe
  return command.type === INDENT_COMMAND_TYPE_STRING;
}

/**
@param {number} width
@returns {WidthIndentCommand}
*/
function createWidthIndentCommand(width) {
  return { type: INDENT_COMMAND_TYPE_WIDTH, width };
}

/**
@param {string} string
@returns {StringIndentCommand}
*/
function createStringIndentCommand(string) {
  return { type: INDENT_COMMAND_TYPE_STRING, string };
}

export {
  createStringIndentCommand,
  createWidthIndentCommand,
  INDENT_COMMAND_DEDENT,
  INDENT_COMMAND_INDENT,
  isStringIndentCommand,
  isWidthIndentCommand,
};
