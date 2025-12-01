import { convertEndOfLineOptionToCharacter } from "../../common/end-of-line.js";
import getStringWidth from "../../utilities/get-string-width.js";
import {
  DOC_TYPE_ALIGN,
  DOC_TYPE_ARRAY,
  DOC_TYPE_BREAK_PARENT,
  DOC_TYPE_CURSOR,
  DOC_TYPE_FILL,
  DOC_TYPE_GROUP,
  DOC_TYPE_IF_BREAK,
  DOC_TYPE_INDENT,
  DOC_TYPE_INDENT_IF_BREAK,
  DOC_TYPE_LABEL,
  DOC_TYPE_LINE,
  DOC_TYPE_LINE_SUFFIX,
  DOC_TYPE_LINE_SUFFIX_BOUNDARY,
  DOC_TYPE_STRING,
  DOC_TYPE_TRIM,
  hardlineWithoutBreakParent,
  indent as indentDoc,
} from "../builders/index.js";
import { getDocType, propagateBreaks } from "../utilities/index.js";
import InvalidDocError from "../utilities/invalid-doc-error.js";
import { makeAlign, makeIndent, ROOT_INDENT } from "./indent.js";
import { trimIndentation } from "./trim-indentation.js";

/**
@import {EndOfLineOption} from "../../common/end-of-line.js";
@import {Doc} from "../builders/index.js";
@import {Indent, IndentOptions} from "./indent.js";
@typedef {typeof MODE_BREAK | typeof MODE_FLAT} Mode
@typedef {{ indent: Indent, doc: any, mode: Mode }} Command
@typedef {Record<symbol, Mode>} GroupModeMap
*/

/** @type {unique symbol} */
const MODE_BREAK = Symbol("MODE_BREAK");
/** @type {unique symbol} */
const MODE_FLAT = Symbol("MODE_FLAT");

const DOC_FILL_PRINTED_LENGTH = Symbol("DOC_FILL_PRINTED_LENGTH");

/**
 * @param {Command} next
 * @param {Command[]} restCommands
 * @param {number} remainingWidth
 * @param {boolean} hasLineSuffix
 * @param {GroupModeMap} groupModeMap
 * @param {boolean} [mustBeFlat]
 * @returns {boolean}
 */
function fits(
  next,
  restCommands,
  remainingWidth,
  hasLineSuffix,
  groupModeMap,
  mustBeFlat,
) {
  if (remainingWidth === Number.POSITIVE_INFINITY) {
    return true;
  }

  let restCommandsIndex = restCommands.length;
  let hasPendingSpace = false;
  /** @type {Array<Omit<Command, 'indent'>>} */
  const commands = [next];
  // `output` is only used for width counting because `trim` requires to look
  // backwards for space characters.
  let output = "";
  while (remainingWidth >= 0) {
    if (commands.length === 0) {
      if (restCommandsIndex === 0) {
        return true;
      }
      commands.push(restCommands[--restCommandsIndex]);

      continue;
    }

    const { mode, doc } = commands.pop();
    const docType = getDocType(doc);
    switch (docType) {
      case DOC_TYPE_STRING:
        if (doc) {
          if (hasPendingSpace) {
            output += " ";
            remainingWidth -= 1;
            hasPendingSpace = false;
          }

          output += doc;
          remainingWidth -= getStringWidth(doc);
        }
        break;

      case DOC_TYPE_ARRAY:
      case DOC_TYPE_FILL: {
        const parts = docType === DOC_TYPE_ARRAY ? doc : doc.parts;
        const end = doc[DOC_FILL_PRINTED_LENGTH] ?? 0;
        for (let index = parts.length - 1; index >= end; index--) {
          commands.push({ mode, doc: parts[index] });
        }
        break;
      }

      case DOC_TYPE_INDENT:
      case DOC_TYPE_ALIGN:
      case DOC_TYPE_INDENT_IF_BREAK:
      case DOC_TYPE_LABEL:
        commands.push({ mode, doc: doc.contents });
        break;

      case DOC_TYPE_TRIM: {
        const { text, count } = trimIndentation(output);
        output = text;
        remainingWidth += count;
        break;
      }

      case DOC_TYPE_GROUP: {
        if (mustBeFlat && doc.break) {
          return false;
        }
        const groupMode = doc.break ? MODE_BREAK : mode;
        // The most expanded state takes up the least space on the current line.
        const contents =
          doc.expandedStates && groupMode === MODE_BREAK
            ? doc.expandedStates.at(-1)
            : doc.contents;
        commands.push({ mode: groupMode, doc: contents });
        break;
      }

      case DOC_TYPE_IF_BREAK: {
        const groupMode = doc.groupId
          ? groupModeMap[doc.groupId] || MODE_FLAT
          : mode;
        const contents =
          groupMode === MODE_BREAK ? doc.breakContents : doc.flatContents;
        if (contents) {
          commands.push({ mode, doc: contents });
        }
        break;
      }

      case DOC_TYPE_LINE:
        if (mode === MODE_BREAK || doc.hard) {
          return true;
        }
        if (!doc.soft) {
          hasPendingSpace = true;
        }
        break;

      case DOC_TYPE_LINE_SUFFIX:
        hasLineSuffix = true;
        break;

      case DOC_TYPE_LINE_SUFFIX_BOUNDARY:
        if (hasLineSuffix) {
          return false;
        }
        break;
    }
  }
  return false;
}

/**
@param {Doc} doc
@param {{
  printWidth: number,
  endOfLine: EndOfLineOption,
} & IndentOptions} options
@returns
*/
function printDocToString(doc, options) {
  /** @type GroupModeMap */
  const groupModeMap = Object.create(null);

  const width = options.printWidth;
  const newLine = convertEndOfLineOptionToCharacter(options.endOfLine);
  let position = 0;
  // commands is basically a stack. We've turned a recursive call into a
  // while loop which is much faster. The while loop below adds new
  // commands to the array instead of recursively calling `print`.
  /** @type Command[] */
  const commands = [{ indent: ROOT_INDENT, mode: MODE_BREAK, doc }];
  let output = "";
  let shouldRemeasure = false;
  /** @type Command[] */
  const lineSuffix = [];
  const cursorPositions = [];

  /** @type string[] */
  const settledOutput = [];
  const settledCursorPositions = [];
  let settledTextLength = 0;

  propagateBreaks(doc);

  while (commands.length > 0) {
    const { indent, mode, doc } = commands.pop();
    switch (getDocType(doc)) {
      case DOC_TYPE_STRING: {
        const formatted =
          newLine !== "\n" ? doc.replaceAll("\n", newLine) : doc;
        // Plugins may print single string, should skip measure the width
        if (formatted) {
          output += formatted;
          if (commands.length > 0) {
            position += getStringWidth(formatted);
          }
        }
        break;
      }

      case DOC_TYPE_ARRAY:
        for (let index = doc.length - 1; index >= 0; index--) {
          commands.push({ indent, mode, doc: doc[index] });
        }
        break;

      case DOC_TYPE_CURSOR:
        if (cursorPositions.length >= 2) {
          throw new Error("There are too many 'cursor' in doc.");
        }
        cursorPositions.push(settledTextLength + output.length);
        break;

      case DOC_TYPE_INDENT:
        commands.push({
          indent: makeIndent(indent, options),
          mode,
          doc: doc.contents,
        });
        break;

      case DOC_TYPE_ALIGN:
        commands.push({
          indent: makeAlign(indent, doc.n, options),
          mode,
          doc: doc.contents,
        });
        break;

      case DOC_TYPE_TRIM:
        trim();
        break;

      case DOC_TYPE_GROUP:
        switch (mode) {
          case MODE_FLAT:
            if (!shouldRemeasure) {
              commands.push({
                indent,
                mode: doc.break ? MODE_BREAK : MODE_FLAT,
                doc: doc.contents,
              });

              break;
            }
          // fallthrough

          case MODE_BREAK: {
            shouldRemeasure = false;

            /** @type {Command} */
            const next = { indent, mode: MODE_FLAT, doc: doc.contents };
            const remainingWidth = width - position;
            const hasLineSuffix = lineSuffix.length > 0;

            if (
              !doc.break &&
              fits(next, commands, remainingWidth, hasLineSuffix, groupModeMap)
            ) {
              commands.push(next);
            } else {
              // Expanded states are a rare case where a document
              // can manually provide multiple representations of
              // itself. It provides an array of documents
              // going from the least expanded (most flattened)
              // representation first to the most expanded. If a
              // group has these, we need to manually go through
              // these states and find the first one that fits.
              // eslint-disable-next-line no-lonely-if
              if (doc.expandedStates) {
                const mostExpanded = doc.expandedStates.at(-1);

                if (doc.break) {
                  commands.push({
                    indent,
                    mode: MODE_BREAK,
                    doc: mostExpanded,
                  });

                  break;
                } else {
                  for (
                    let index = 1;
                    index < doc.expandedStates.length + 1;
                    index++
                  ) {
                    if (index >= doc.expandedStates.length) {
                      commands.push({
                        indent,
                        mode: MODE_BREAK,
                        doc: mostExpanded,
                      });

                      break;
                    } else {
                      const state = doc.expandedStates[index];
                      /** @type {Command} */
                      const cmd = { indent, mode: MODE_FLAT, doc: state };

                      if (
                        fits(
                          cmd,
                          commands,
                          remainingWidth,
                          hasLineSuffix,
                          groupModeMap,
                        )
                      ) {
                        commands.push(cmd);

                        break;
                      }
                    }
                  }
                }
              } else {
                commands.push({ indent, mode: MODE_BREAK, doc: doc.contents });
              }
            }

            break;
          }
        }

        if (doc.id) {
          groupModeMap[doc.id] = commands.at(-1).mode;
        }
        break;
      // Fills each line with as much code as possible before moving to a new
      // line with the same indentation.
      //
      // Expects doc.parts to be an array of alternating content and
      // whitespace. The whitespace contains the linebreaks.
      //
      // For example:
      //   ["I", line, "love", line, "monkeys"]
      // or
      //   [{ type: group, ... }, softline, { type: group, ... }]
      //
      // It uses this parts structure to handle three main layout cases:
      // * The first two content items fit on the same line without
      //   breaking
      //   -> output the first content item and the whitespace "flat".
      // * Only the first content item fits on the line without breaking
      //   -> output the first content item "flat" and the whitespace with
      //   "break".
      // * Neither content item fits on the line without breaking
      //   -> output the first content item and the whitespace with "break".
      case DOC_TYPE_FILL: {
        const remainingWidth = width - position;

        const offset = doc[DOC_FILL_PRINTED_LENGTH] ?? 0;
        const { parts } = doc;
        const length = parts.length - offset;
        if (length === 0) {
          break;
        }

        const content = parts[offset + 0];
        const whitespace = parts[offset + 1];
        /** @type {Command} */
        const contentFlatCommand = { indent, mode: MODE_FLAT, doc: content };
        /** @type {Command} */
        const contentBreakCommand = { indent, mode: MODE_BREAK, doc: content };
        const contentFits = fits(
          contentFlatCommand,
          [],
          remainingWidth,
          lineSuffix.length > 0,
          groupModeMap,
          true,
        );

        if (length === 1) {
          if (contentFits) {
            commands.push(contentFlatCommand);
          } else {
            commands.push(contentBreakCommand);
          }
          break;
        }

        /** @type {Command} */
        const whitespaceFlatCommand = {
          indent,
          mode: MODE_FLAT,
          doc: whitespace,
        };
        /** @type {Command} */
        const whitespaceBreakCommand = {
          indent,
          mode: MODE_BREAK,
          doc: whitespace,
        };

        if (length === 2) {
          if (contentFits) {
            commands.push(whitespaceFlatCommand, contentFlatCommand);
          } else {
            commands.push(whitespaceBreakCommand, contentBreakCommand);
          }
          break;
        }

        const secondContent = parts[offset + 2];

        /** @type {Command} */
        const remainingCommand = {
          indent,
          mode,
          doc: { ...doc, [DOC_FILL_PRINTED_LENGTH]: offset + 2 },
        };

        /** @type {Command} */
        const firstAndSecondContentFlatCommand = {
          indent,
          mode: MODE_FLAT,
          doc: [content, whitespace, secondContent],
        };
        const firstAndSecondContentFits = fits(
          firstAndSecondContentFlatCommand,
          [],
          remainingWidth,
          lineSuffix.length > 0,
          groupModeMap,
          true,
        );

        commands.push(remainingCommand);

        if (firstAndSecondContentFits) {
          commands.push(whitespaceFlatCommand, contentFlatCommand);
        } else if (contentFits) {
          commands.push(whitespaceBreakCommand, contentFlatCommand);
        } else {
          commands.push(whitespaceBreakCommand, contentBreakCommand);
        }
        break;
      }
      case DOC_TYPE_IF_BREAK:
      case DOC_TYPE_INDENT_IF_BREAK: {
        const groupMode = doc.groupId ? groupModeMap[doc.groupId] : mode;
        if (groupMode === MODE_BREAK) {
          const breakContents =
            doc.type === DOC_TYPE_IF_BREAK
              ? doc.breakContents
              : doc.negate
                ? doc.contents
                : indentDoc(doc.contents);
          if (breakContents) {
            commands.push({ indent, mode, doc: breakContents });
          }
        }
        if (groupMode === MODE_FLAT) {
          const flatContents =
            doc.type === DOC_TYPE_IF_BREAK
              ? doc.flatContents
              : doc.negate
                ? indentDoc(doc.contents)
                : doc.contents;
          if (flatContents) {
            commands.push({ indent, mode, doc: flatContents });
          }
        }

        break;
      }
      case DOC_TYPE_LINE_SUFFIX:
        lineSuffix.push({ indent, mode, doc: doc.contents });
        break;

      case DOC_TYPE_LINE_SUFFIX_BOUNDARY:
        if (lineSuffix.length > 0) {
          commands.push({ indent, mode, doc: hardlineWithoutBreakParent });
        }
        break;

      case DOC_TYPE_LINE:
        switch (mode) {
          case MODE_FLAT:
            if (!doc.hard) {
              if (!doc.soft) {
                output += " ";

                position += 1;
              }

              break;
            } else {
              // This line was forced into the output even if we
              // were in flattened mode, so we need to tell the next
              // group that no matter what, it needs to remeasure
              // because the previous measurement didn't accurately
              // capture the entire expression (this is necessary
              // for nested groups)
              shouldRemeasure = true;
            }
          // fallthrough

          case MODE_BREAK:
            if (lineSuffix.length > 0) {
              commands.push({ indent, mode, doc }, ...lineSuffix.reverse());
              lineSuffix.length = 0;
              break;
            }

            if (doc.literal) {
              output += newLine;
              position = 0;
              if (indent.root) {
                if (indent.root.value) {
                  output += indent.root.value;
                }
                position = indent.root.length;
              }
            } else {
              trim();
              output += newLine + indent.value;
              position = indent.length;
            }
            break;
        }
        break;

      case DOC_TYPE_LABEL:
        commands.push({ indent, mode, doc: doc.contents });
        break;

      case DOC_TYPE_BREAK_PARENT:
        // No op
        break;

      default:
        throw new InvalidDocError(doc);
    }

    // Flush remaining line-suffix contents at the end of the document, in case
    // there is no new line after the line-suffix.
    if (commands.length === 0 && lineSuffix.length > 0) {
      commands.push(...lineSuffix.reverse());
      lineSuffix.length = 0;
    }
  }

  const formatted = settledOutput.join("") + output;
  const finalCursorPositions = [...settledCursorPositions, ...cursorPositions];

  if (finalCursorPositions.length !== 2) {
    // If the doc contained ONE cursor command,
    // instead of the expected zero or two. If the doc being printed was
    // returned by printAstToDoc, then the only ways this can have happened
    // are if:
    // 1. a plugin added a cursor command itself, or
    // 2. one (but not both) of options.nodeAfterCursor and
    //    options.nodeAfterCursor pointed to a node within a subtree of the
    //    AST that the printer plugin used in printAstToDoc simply omits from
    //    the doc, or that it prints without recursively calling mainPrint,
    //    with the consequence that the logic for adding a cursor command in
    //    callPluginPrintFunction was never called for that node.
    // These are both weird scenarios that should be considered a bug if they
    // ever occur with one of Prettier's built-in plugins. If a third-party
    // plugin was used when printing the AST to a doc, the possibility of
    // reaching this scenario MIGHT be reasonable to consider a bug in the
    // plugin. However, we try to at least not crash if this ever happens;
    // instead we simply give up on returning a cursorNodeStart or
    // cursorNodeText.
    //
    // coreFormat has logic specifically to handle this scenario - where it
    // is supposed to preserve the cursor position but the printer gives it
    // no information about where the nodes around the cursor ended up -
    // although that logic is unavoidably slower (and has more potential to
    // return a perverse result) than the happy path where we help out
    // coreFormat by returning a cursorNodeStart and cursorNodeText here.
    return { formatted };
  }

  const cursorNodeStart = finalCursorPositions[0];
  return {
    formatted,
    cursorNodeStart,
    cursorNodeText: formatted.slice(
      cursorNodeStart,
      finalCursorPositions.at(-1),
    ),
  };

  function trim() {
    const { text: trimmed, count } = trimIndentation(output);

    if (trimmed) {
      settledOutput.push(trimmed);
      settledTextLength += trimmed.length;
    }

    output = "";
    position -= count;

    if (cursorPositions.length > 0) {
      settledCursorPositions.push(
        ...cursorPositions.map((position) =>
          Math.min(position, settledTextLength),
        ),
      );

      cursorPositions.length = 0;
    }
  }
}

export { printDocToString };
