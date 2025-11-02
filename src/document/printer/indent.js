import {
  INDENT_COMMAND_TYPE_DEDENT,
  INDENT_COMMAND_TYPE_INDENT,
  INDENT_COMMAND_TYPE_STRING,
  INDENT_COMMAND_TYPE_WIDTH,
} from "./indent-command.js";

/**
@import {IndentCommand} from "./indent-command.js";
@typedef {{useTabs: boolean, tabWidth: number}} IndentOptions
@typedef {{
  readonly value: string,
  readonly length: number,
  readonly queue: readonly IndentCommand[],
  readonly root?: Indent,
}} Indent
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
    command.type === INDENT_COMMAND_TYPE_DEDENT
      ? indent.queue.slice(0, -1)
      : [...indent.queue, command];

  let value = "";
  let length = 0;
  let lastTabs = 0;
  let lastSpaces = 0;

  for (const command of queue) {
    switch (command.type) {
      case INDENT_COMMAND_TYPE_INDENT:
        flush();
        if (options.useTabs) {
          addTabs(1);
        } else {
          addSpaces(options.tabWidth);
        }
        break;
      case INDENT_COMMAND_TYPE_STRING: {
        const { string } = command;
        flush();
        value += string;
        length += string.length;
        break;
      }
      case INDENT_COMMAND_TYPE_WIDTH: {
        const { width } = command;
        lastTabs += 1;
        lastSpaces += width;
        break;
      }
      default:
        /* c8 ignore next */
        throw new Error(`Unexpected indent comment '${command.type}'.`);
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
@param {IndentOptions} options
@param {RootIndent} rootIndent
@returns {Indent}
*/
function makeAlign(indent, widthOrString, rootIndent, options) {
  if (widthOrString === Number.NEGATIVE_INFINITY) {
    return indent.root ?? rootIndent;
  }

  if (!widthOrString) {
    return indent;
  }

  if (widthOrString.type === "root") {
    return { ...indent, root: indent };
  }

  const isNumberAlign = typeof widthOrString === "number";

  if (isNumberAlign && widthOrString < 0) {
    return generateIndent(
      indent,
      { type: INDENT_COMMAND_TYPE_DEDENT },
      options,
    );
  }

  const indentCommand = isNumberAlign
    ? { type: INDENT_COMMAND_TYPE_WIDTH, width: widthOrString }
    : { type: INDENT_COMMAND_TYPE_STRING, string: widthOrString };

  return generateIndent(indent, indentCommand, options);
}

/**
@param {Indent} indent
@param {*} options
@returns {Indent}
*/
function makeIndent(indent, options) {
  return generateIndent(indent, { type: INDENT_COMMAND_TYPE_INDENT }, options);
}

export { createRootIndent, makeAlign, makeIndent };
