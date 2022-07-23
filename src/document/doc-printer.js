"use strict";

const { convertEndOfLineToChars } = require("../common/end-of-line.js");
const getLast = require("../utils/get-last.js");
const getStringWidth = require("../utils/get-string-width.js");
const { fill, cursor, indent } = require("./doc-builders.js");
const { isConcat, getDocParts } = require("./doc-utils.js");

/** @typedef {typeof MODE_BREAK | typeof MODE_FLAT} Mode */
/** @typedef {{ ind: any, doc: any, mode: Mode }} Command */

/** @type {Record<symbol, Mode>} */
let groupModeMap;

// prettier-ignore
const MODE_BREAK = /** @type {const} */ (1);
// prettier-ignore
const MODE_FLAT = /** @type {const} */ (2);

function rootIndent() {
  return { value: "", length: 0, queue: [] };
}

function makeIndent(ind, options) {
  return generateInd(ind, { type: "indent" }, options);
}

function makeAlign(indent, widthOrDoc, options) {
  if (widthOrDoc === Number.NEGATIVE_INFINITY) {
    return indent.root || rootIndent();
  }

  if (widthOrDoc < 0) {
    return generateInd(indent, { type: "dedent" }, options);
  }

  if (!widthOrDoc) {
    return indent;
  }

  if (widthOrDoc.type === "root") {
    return { ...indent, root: indent };
  }

  const alignType =
    typeof widthOrDoc === "string" ? "stringAlign" : "numberAlign";

  return generateInd(indent, { type: alignType, n: widthOrDoc }, options);
}

function generateInd(ind, newPart, options) {
  const queue =
    newPart.type === "dedent"
      ? ind.queue.slice(0, -1)
      : [...ind.queue, newPart];

  let value = "";
  let length = 0;
  let lastTabs = 0;
  let lastSpaces = 0;

  for (const part of queue) {
    switch (part.type) {
      case "indent":
        flush();
        if (options.useTabs) {
          addTabs(1);
        } else {
          addSpaces(options.tabWidth);
        }
        break;
      case "stringAlign":
        flush();
        value += part.n;
        length += part.n.length;
        break;
      case "numberAlign":
        lastTabs += 1;
        lastSpaces += part.n;
        break;
      /* istanbul ignore next */
      default:
        throw new Error(`Unexpected type '${part.type}'`);
    }
  }

  flushSpaces();

  return { ...ind, value, length, queue };

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

function trim(out) {
  if (out.length === 0) {
    return 0;
  }

  let trimCount = 0;

  // Trim whitespace at the end of line
  while (
    out.length > 0 &&
    typeof getLast(out) === "string" &&
    /^[\t ]*$/.test(getLast(out))
  ) {
    trimCount += out.pop().length;
  }

  if (out.length > 0 && typeof getLast(out) === "string") {
    const trimmed = getLast(out).replace(/[\t ]*$/, "");
    trimCount += getLast(out).length - trimmed.length;
    out[out.length - 1] = trimmed;
  }

  return trimCount;
}

/**
 * @param {Command} next
 * @param {Command[]} restCommands
 * @param {number} width
 * @param {boolean} hasLineSuffix
 * @param {boolean} [mustBeFlat]
 * @returns {boolean}
 */
function fits(next, restCommands, width, hasLineSuffix, mustBeFlat) {
  let restIdx = restCommands.length;
  /** @type {Array<Omit<Command, 'ind'>>} */
  const cmds = [next];
  // `out` is only used for width counting because `trim` requires to look
  // backwards for space characters.
  const out = [];
  while (width >= 0) {
    if (cmds.length === 0) {
      if (restIdx === 0) {
        return true;
      }
      cmds.push(restCommands[--restIdx]);
      continue;
    }

    const { mode, doc } = cmds.pop();

    if (typeof doc === "string") {
      out.push(doc);
      width -= getStringWidth(doc);
    } else if (isConcat(doc) || doc.type === "fill") {
      const parts = getDocParts(doc);
      for (let i = parts.length - 1; i >= 0; i--) {
        cmds.push({ mode, doc: parts[i] });
      }
    } else {
      switch (doc.type) {
        case "indent":
        case "align":
        case "indent-if-break":
        case "label":
          cmds.push({ mode, doc: doc.contents });
          break;

        case "trim":
          width += trim(out);
          break;

        case "group": {
          if (mustBeFlat && doc.break) {
            return false;
          }
          const groupMode = doc.break ? MODE_BREAK : mode;
          // The most expanded state takes up the least space on the current line.
          const contents =
            doc.expandedStates && groupMode === MODE_BREAK
              ? getLast(doc.expandedStates)
              : doc.contents;
          cmds.push({ mode: groupMode, doc: contents });
          break;
        }

        case "if-break": {
          const groupMode = doc.groupId
            ? groupModeMap[doc.groupId] || MODE_FLAT
            : mode;
          const contents =
            groupMode === MODE_BREAK ? doc.breakContents : doc.flatContents;
          if (contents) {
            cmds.push({ mode, doc: contents });
          }
          break;
        }

        case "line":
          if (mode === MODE_BREAK || doc.hard) {
            return true;
          }
          if (!doc.soft) {
            out.push(" ");
            width--;
          }
          break;

        case "line-suffix":
          hasLineSuffix = true;
          break;

        case "line-suffix-boundary":
          if (hasLineSuffix) {
            return false;
          }
          break;
      }
    }
  }
  return false;
}

function printDocToString(doc, options) {
  groupModeMap = {};

  const width = options.printWidth;
  const newLine = convertEndOfLineToChars(options.endOfLine);
  let pos = 0;
  // cmds is basically a stack. We've turned a recursive call into a
  // while loop which is much faster. The while loop below adds new
  // cmds to the array instead of recursively calling `print`.
  /** @type Command[] */
  const cmds = [{ ind: rootIndent(), mode: MODE_BREAK, doc }];
  const out = [];
  let shouldRemeasure = false;
  /** @type Command[] */
  const lineSuffix = [];

  while (cmds.length > 0) {
    const { ind, mode, doc } = cmds.pop();

    if (typeof doc === "string") {
      const formatted = newLine !== "\n" ? doc.replace(/\n/g, newLine) : doc;
      out.push(formatted);
      pos += getStringWidth(formatted);
    } else if (isConcat(doc)) {
      const parts = getDocParts(doc);
      for (let i = parts.length - 1; i >= 0; i--) {
        cmds.push({ ind, mode, doc: parts[i] });
      }
    } else {
      switch (doc.type) {
        case "cursor":
          out.push(cursor.placeholder);

          break;
        case "indent":
          cmds.push({ ind: makeIndent(ind, options), mode, doc: doc.contents });

          break;
        case "align":
          cmds.push({
            ind: makeAlign(ind, doc.n, options),
            mode,
            doc: doc.contents,
          });

          break;
        case "trim":
          pos -= trim(out);

          break;
        case "group":
          switch (mode) {
            case MODE_FLAT:
              if (!shouldRemeasure) {
                cmds.push({
                  ind,
                  mode: doc.break ? MODE_BREAK : MODE_FLAT,
                  doc: doc.contents,
                });

                break;
              }
            // fallthrough

            case MODE_BREAK: {
              shouldRemeasure = false;

              const next = { ind, mode: MODE_FLAT, doc: doc.contents };
              const rem = width - pos;
              const hasLineSuffix = lineSuffix.length > 0;

              if (!doc.break && fits(next, cmds, rem, hasLineSuffix)) {
                cmds.push(next);
              } else {
                // Expanded states are a rare case where a document
                // can manually provide multiple representations of
                // itself. It provides an array of documents
                // going from the least expanded (most flattened)
                // representation first to the most expanded. If a
                // group has these, we need to manually go through
                // these states and find the first one that fits.
                if (doc.expandedStates) {
                  const mostExpanded = getLast(doc.expandedStates);

                  if (doc.break) {
                    cmds.push({ ind, mode: MODE_BREAK, doc: mostExpanded });

                    break;
                  } else {
                    for (let i = 1; i < doc.expandedStates.length + 1; i++) {
                      if (i >= doc.expandedStates.length) {
                        cmds.push({ ind, mode: MODE_BREAK, doc: mostExpanded });

                        break;
                      } else {
                        const state = doc.expandedStates[i];
                        const cmd = { ind, mode: MODE_FLAT, doc: state };

                        if (fits(cmd, cmds, rem, hasLineSuffix)) {
                          cmds.push(cmd);

                          break;
                        }
                      }
                    }
                  }
                } else {
                  cmds.push({ ind, mode: MODE_BREAK, doc: doc.contents });
                }
              }

              break;
            }
          }

          if (doc.id) {
            groupModeMap[doc.id] = getLast(cmds).mode;
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
        case "fill": {
          const rem = width - pos;

          const { parts } = doc;
          if (parts.length === 0) {
            break;
          }

          const [content, whitespace] = parts;
          const contentFlatCmd = { ind, mode: MODE_FLAT, doc: content };
          const contentBreakCmd = { ind, mode: MODE_BREAK, doc: content };
          const contentFits = fits(
            contentFlatCmd,
            [],
            rem,
            lineSuffix.length > 0,
            true
          );

          if (parts.length === 1) {
            if (contentFits) {
              cmds.push(contentFlatCmd);
            } else {
              cmds.push(contentBreakCmd);
            }
            break;
          }

          const whitespaceFlatCmd = { ind, mode: MODE_FLAT, doc: whitespace };
          const whitespaceBreakCmd = { ind, mode: MODE_BREAK, doc: whitespace };

          if (parts.length === 2) {
            if (contentFits) {
              cmds.push(whitespaceFlatCmd, contentFlatCmd);
            } else {
              cmds.push(whitespaceBreakCmd, contentBreakCmd);
            }
            break;
          }

          // At this point we've handled the first pair (context, separator)
          // and will create a new fill doc for the rest of the content.
          // Ideally we wouldn't mutate the array here but copying all the
          // elements to a new array would make this algorithm quadratic,
          // which is unusable for large arrays (e.g. large texts in JSX).
          parts.splice(0, 2);
          const remainingCmd = { ind, mode, doc: fill(parts) };

          const secondContent = parts[0];

          const firstAndSecondContentFlatCmd = {
            ind,
            mode: MODE_FLAT,
            doc: [content, whitespace, secondContent],
          };
          const firstAndSecondContentFits = fits(
            firstAndSecondContentFlatCmd,
            [],
            rem,
            lineSuffix.length > 0,
            true
          );

          if (firstAndSecondContentFits) {
            cmds.push(remainingCmd, whitespaceFlatCmd, contentFlatCmd);
          } else if (contentFits) {
            cmds.push(remainingCmd, whitespaceBreakCmd, contentFlatCmd);
          } else {
            cmds.push(remainingCmd, whitespaceBreakCmd, contentBreakCmd);
          }
          break;
        }
        case "if-break":
        case "indent-if-break": {
          const groupMode = doc.groupId ? groupModeMap[doc.groupId] : mode;
          if (groupMode === MODE_BREAK) {
            const breakContents =
              doc.type === "if-break"
                ? doc.breakContents
                : doc.negate
                ? doc.contents
                : indent(doc.contents);
            if (breakContents) {
              cmds.push({ ind, mode, doc: breakContents });
            }
          }
          if (groupMode === MODE_FLAT) {
            const flatContents =
              doc.type === "if-break"
                ? doc.flatContents
                : doc.negate
                ? indent(doc.contents)
                : doc.contents;
            if (flatContents) {
              cmds.push({ ind, mode, doc: flatContents });
            }
          }

          break;
        }
        case "line-suffix":
          lineSuffix.push({ ind, mode, doc: doc.contents });
          break;
        case "line-suffix-boundary":
          if (lineSuffix.length > 0) {
            cmds.push({ ind, mode, doc: { type: "line", hard: true } });
          }
          break;
        case "line":
          switch (mode) {
            case MODE_FLAT:
              if (!doc.hard) {
                if (!doc.soft) {
                  out.push(" ");

                  pos += 1;
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
                cmds.push({ ind, mode, doc }, ...lineSuffix.reverse());
                lineSuffix.length = 0;
                break;
              }

              if (doc.literal) {
                if (ind.root) {
                  out.push(newLine, ind.root.value);
                  pos = ind.root.length;
                } else {
                  out.push(newLine);
                  pos = 0;
                }
              } else {
                pos -= trim(out);
                out.push(newLine + ind.value);
                pos = ind.length;
              }
              break;
          }
          break;
        case "label":
          cmds.push({ ind, mode, doc: doc.contents });
          break;
        default:
      }
    }

    // Flush remaining line-suffix contents at the end of the document, in case
    // there is no new line after the line-suffix.
    if (cmds.length === 0 && lineSuffix.length > 0) {
      cmds.push(...lineSuffix.reverse());
      lineSuffix.length = 0;
    }
  }

  const cursorPlaceholderIndex = out.indexOf(cursor.placeholder);
  if (cursorPlaceholderIndex !== -1) {
    const otherCursorPlaceholderIndex = out.indexOf(
      cursor.placeholder,
      cursorPlaceholderIndex + 1
    );
    const beforeCursor = out.slice(0, cursorPlaceholderIndex).join("");
    const aroundCursor = out
      .slice(cursorPlaceholderIndex + 1, otherCursorPlaceholderIndex)
      .join("");
    const afterCursor = out.slice(otherCursorPlaceholderIndex + 1).join("");

    return {
      formatted: beforeCursor + aroundCursor + afterCursor,
      cursorNodeStart: beforeCursor.length,
      cursorNodeText: aroundCursor,
    };
  }

  return { formatted: out.join("") };
}

module.exports = { printDocToString };
