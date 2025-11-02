const INDENT_TYPE_WIDTH = "indent-width";
const INDENT_TYPE_STRING = "indent-string";

/**
@typedef {{type: typeof INDENT_TYPE_WIDTH, width: number}} WidthIndentCommand
@typedef {{type: typeof INDENT_TYPE_STRING, string: string}} StringIndentCommand
@typedef {
  | typeof INDENT_COMMAND_INDENT
  | typeof INDENT_COMMAND_DEDENT
  | WidthIndentCommand
  | StringIndentCommand
} IndentCommand
@typedef {{useTabs: boolean, tabWidth: number}} IndentOptions
*/

const INDENT_COMMAND_INDENT = Symbol("INDENT_COMMAND_INDENT");
const INDENT_COMMAND_DEDENT = Symbol("INDENT_COMMAND_DEDENT");

/**
@param {IndentCommand} command
@returns {command is WidthIndentCommand}
*/
function isWidthIndentCommand(command) {
  return command.type === INDENT_TYPE_WIDTH;
}

/**
@param {IndentCommand} command
@returns {command is StringIndentCommand}
*/
function isStringIndentCommand(command) {
  return command.type === INDENT_TYPE_STRING;
}

/**
@param {number} width
@returns {WidthIndentCommand}
*/
function createWidthIndentCommand(width) {
  return { type: INDENT_TYPE_WIDTH, width };
}

/**
@param {string} string
@returns {StringIndentCommand}
*/
function createStringIndentCommand(string) {
  return { type: INDENT_TYPE_STRING, string };
}

/**
@typedef {{type: typeof INDENT_TYPE_WIDTH, width: number}} WidthIndentCommand
@typedef {{type: typeof INDENT_TYPE_STRING, string: string}} StringIndentCommand
@typedef {
  | typeof INDENT_COMMAND_INDENT
  | typeof INDENT_COMMAND_DEDENT
  | WidthIndentCommand
  | StringIndentCommand
} IndentCommand
*/

/**
@typedef {{value: string, length: number, queue: IndentCommand[], root?: RootIndent}} Indent
@typedef {{value: '', length: 0, queue: []}} RootIndent
*/

/**
@returns {RootIndent}
*/
function createRootIndent() {
  return { value: "", length: 0, queue: [] };
}

/**
@param {Indent} indent
@param {IndentCommand} command
@param {*} options
@returns {Indent}
*/
function generateIndent(indent, command, options) {
  const queue =
    command === INDENT_COMMAND_DEDENT
      ? indent.queue.slice(0, -1)
      : [...indent.queue, command];

  let value = "";
  let length = 0;
  let lastTabs = 0;
  let lastSpaces = 0;

  for (const command of queue) {
    if (command === INDENT_COMMAND_INDENT) {
      flush();
      if (options.useTabs) {
        addTabs(1);
      } else {
        addSpaces(options.tabWidth);
      }
    } else if (isStringIndentCommand(command)) {
      const { string } = command;
      flush();
      value += string;
      length += string.length;
    } else if (isWidthIndentCommand(command)) {
      const { width } = command;
      lastTabs += 1;
      lastSpaces += width;
    }
  }

  flushSpaces();

  return { ...indent, value, length, queue };

  function addTabs(count) {
    value += "\t".repeat(count);
    length += options.tabWidth * count;
  }

  function addSpaces(count) {
    value += " ".repeat(count);
    length += count;
  }

  function flush() {
    if (options.useTabs) {
      flushTabs();
    } else {
      flushSpaces();
    }
  }

  function flushTabs() {
    if (lastTabs > 0) {
      addTabs(lastTabs);
    }
    resetLast();
  }

  function flushSpaces() {
    if (lastSpaces > 0) {
      addSpaces(lastSpaces);
    }
    resetLast();
  }

  function resetLast() {
    lastTabs = 0;
    lastSpaces = 0;
  }
}

/**
@param {Indent} indent
@param {number | string} widthOrString
@param {*} options
@returns {Indent}
*/
function makeAlign(indent, widthOrString, options) {
  if (widthOrString === Number.NEGATIVE_INFINITY) {
    return indent.root ?? createRootIndent();
  }

  if (!widthOrString) {
    return indent;
  }

  const isNumberAlign = typeof widthOrString === "string";

  if (isNumberAlign && widthOrString < 0) {
    return generateIndent(indent, INDENT_COMMAND_DEDENT, options);
  }

  const indentCommand = isNumberAlign
    ? createWidthIndentCommand(widthOrString)
    : createStringIndentCommand(widthOrString);

  return generateIndent(indent, indentCommand, options);
}

/**
@param {Indent} indent
@param {*} options
@returns {Indent}
*/
function makeIndent(indent, options) {
  return generateIndent(indent, INDENT_COMMAND_INDENT, options);
}

export { createRootIndent, makeAlign, makeIndent };
