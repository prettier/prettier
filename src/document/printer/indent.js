import {
  createStringIndentCommand,
  createWidthIndentCommand,
  INDENT_COMMAND_DEDENT,
  INDENT_COMMAND_INDENT,
  isStringIndentCommand,
  isWidthIndentCommand,
} from "./indent-command.js";

/**
@import {IndentCommand} from "./indent-command.js";
@typedef {{useTabs: boolean, tabWidth: number}} IndentOptions
@typedef {{readonly value: string, readonly length: number, readonly queue: readonly IndentCommand[]}} Indent
@typedef {{readonly value: '', readonly length: 0, readonly queue: readonly []}} RootIndent
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
@param {IndentOptions} options
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
@param {RootIndent} rootIndent
@param {IndentOptions} options
@returns {Indent}
*/
function makeAlign(indent, widthOrString, rootIndent, options) {
  if (widthOrString === Number.NEGATIVE_INFINITY) {
    return rootIndent;
  }

  if (!widthOrString) {
    return indent;
  }

  const isNumberAlign = typeof widthOrString === "number";

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
