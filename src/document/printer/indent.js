const INDENT_COMMAND_TYPE_INDENT = 0;
const INDENT_COMMAND_TYPE_DEDENT = 1;
const INDENT_COMMAND_TYPE_WIDTH = 2;
const INDENT_COMMAND_TYPE_STRING = 3;

/**
@import {Align} from "../builders/index.js";
@typedef {{useTabs: boolean, tabWidth: number}} IndentOptions
@typedef {{
  readonly value: string,
  readonly length: number,
  readonly queue: readonly IndentCommand[],
  readonly root: Indent,
}} Indent
@typedef {{
  readonly value: '',
  readonly length: 0,
  readonly queue: readonly [],
  readonly root: RootIndent,
}} RootIndent
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

/** @type {{readonly type: typeof INDENT_COMMAND_TYPE_INDENT}} */
const INDENT_COMMAND_INDENT = { type: INDENT_COMMAND_TYPE_INDENT };
/** @type {{readonly type: typeof INDENT_COMMAND_TYPE_DEDENT}} */
const INDENT_COMMAND_DEDENT = { type: INDENT_COMMAND_TYPE_DEDENT };
/** @type {RootIndent} */
const ROOT_INDENT = {
  value: "",
  length: 0,
  queue: [],
  get root() {
    return ROOT_INDENT;
  },
};

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
@param {Align["n"]} indentOptions
@param {IndentOptions} options
@returns {Indent}
*/
function makeAlign(indent, indentOptions, options) {
  if (!indentOptions) {
    return indent;
  }

  // @ts-expect-error -- Safe
  if (indentOptions.type === "root") {
    return { ...indent, root: indent };
  }

  if (indentOptions === Number.NEGATIVE_INFINITY) {
    return indent.root;
  }

  /** @type {IndentCommand} */
  let command;
  if (typeof indentOptions === "number") {
    if (indentOptions < 0) {
      command = INDENT_COMMAND_DEDENT;
    } else {
      command = { type: INDENT_COMMAND_TYPE_WIDTH, width: indentOptions };
    }
  } else {
    // @ts-expect-error -- Safe
    command = { type: INDENT_COMMAND_TYPE_STRING, string: indentOptions };
  }

  return generateIndent(indent, command, options);
}

/**
@param {Indent} indent
@param {IndentOptions} options
@returns {Indent}
*/
function makeIndent(indent, options) {
  return generateIndent(indent, INDENT_COMMAND_INDENT, options);
}

export { makeAlign, makeIndent, ROOT_INDENT };
