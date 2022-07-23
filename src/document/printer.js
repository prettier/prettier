import { convertEndOfLineToChars } from "../common/end-of-line.js";
import getLast from "../utils/get-last.js";
import getStringWidth from "../utils/get-string-width.js";
import {
  DOC_TYPE_STRING,
  DOC_TYPE_CONCAT,
  DOC_TYPE_CURSOR,
  DOC_TYPE_INDENT,
  DOC_TYPE_ALIGN,
  DOC_TYPE_TRIM,
  DOC_TYPE_GROUP,
  DOC_TYPE_FILL,
  DOC_TYPE_IF_BREAK,
  DOC_TYPE_INDENT_IF_BREAK,
  DOC_TYPE_LINE_SUFFIX,
  DOC_TYPE_LINE_SUFFIX_BOUNDARY,
  DOC_TYPE_LINE,
  DOC_TYPE_LABEL,
  DOC_TYPE_BREAK_PARENT,
} from "./constants.js";
import { fill, cursor, indent } from "./builders.js";
import { getDocParts, getDocType } from "./utils.js";

/** @type {Record<symbol, typeof MODE_BREAK | typeof MODE_FLAT>} */
let groupModeMap;

const MODE_BREAK = 1;
const MODE_FLAT = 2;

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

function fits(next, restCommands, width, options, hasLineSuffix, mustBeFlat) {
  let restIdx = restCommands.length;
  const cmds = [next];
  // `out` is only used for width counting because `trim` requires to look
  // backwards for space characters.
  const out = [];
  while (width >= 0) {
    if (cmds.length === 0) {
      if (restIdx === 0) {
        return true;
      }
      cmds.push(restCommands[restIdx - 1]);

      restIdx--;

      continue;
    }

    const [ind, mode, doc] = cmds.pop();

    switch (getDocType(doc)) {
      case DOC_TYPE_STRING:
        out.push(doc);
        width -= getStringWidth(doc);

        break;
      case DOC_TYPE_CONCAT: {
        const parts = getDocParts(doc);
        for (let i = parts.length - 1; i >= 0; i--) {
          cmds.push([ind, mode, parts[i]]);
        }

        break;
      }
      case DOC_TYPE_INDENT:
        cmds.push([makeIndent(ind, options), mode, doc.contents]);

        break;
      case DOC_TYPE_ALIGN:
        cmds.push([makeAlign(ind, doc.n, options), mode, doc.contents]);

        break;
      case DOC_TYPE_TRIM:
        width += trim(out);

        break;
      case DOC_TYPE_GROUP: {
        if (mustBeFlat && doc.break) {
          return false;
        }
        const groupMode = doc.break ? MODE_BREAK : mode;
        cmds.push([
          ind,
          groupMode,
          // The most expanded state takes up the least space on the current line.
          doc.expandedStates && groupMode === MODE_BREAK
            ? getLast(doc.expandedStates)
            : doc.contents,
        ]);

        if (doc.id) {
          groupModeMap[doc.id] = groupMode;
        }
        break;
      }
      case DOC_TYPE_FILL:
        for (let i = doc.parts.length - 1; i >= 0; i--) {
          cmds.push([ind, mode, doc.parts[i]]);
        }

        break;
      case DOC_TYPE_IF_BREAK:
      case DOC_TYPE_INDENT_IF_BREAK: {
        const groupMode = doc.groupId ? groupModeMap[doc.groupId] : mode;
        if (groupMode === MODE_BREAK) {
          const breakContents =
            doc.type === DOC_TYPE_IF_BREAK
              ? doc.breakContents
              : doc.negate
              ? doc.contents
              : indent(doc.contents);
          if (breakContents) {
            cmds.push([ind, mode, breakContents]);
          }
        }
        if (groupMode === MODE_FLAT) {
          const flatContents =
            doc.type === DOC_TYPE_IF_BREAK
              ? doc.flatContents
              : doc.negate
              ? indent(doc.contents)
              : doc.contents;
          if (flatContents) {
            cmds.push([ind, mode, flatContents]);
          }
        }

        break;
      }
      case DOC_TYPE_LINE:
        switch (mode) {
          // fallthrough
          case MODE_FLAT:
            if (!doc.hard) {
              if (!doc.soft) {
                out.push(" ");

                width -= 1;
              }

              break;
            }
            return true;

          case MODE_BREAK:
            return true;
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
      case DOC_TYPE_LABEL:
        cmds.push([ind, mode, doc.contents]);
        break;
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
  const cmds = [[rootIndent(), MODE_BREAK, doc]];
  const out = [];
  let shouldRemeasure = false;
  let lineSuffix = [];

  while (cmds.length > 0) {
    const [ind, mode, doc] = cmds.pop();
    const type = getDocType(doc);

    switch (type) {
      case DOC_TYPE_STRING: {
        const formatted = newLine !== "\n" ? doc.replace(/\n/g, newLine) : doc;
        out.push(formatted);
        pos += getStringWidth(formatted);

        break;
      }
      case DOC_TYPE_CONCAT: {
        const parts = getDocParts(doc);
        for (let i = parts.length - 1; i >= 0; i--) {
          cmds.push([ind, mode, parts[i]]);
        }

        break;
      }
      case DOC_TYPE_CURSOR:
        out.push(cursor.placeholder);

        break;
      case DOC_TYPE_INDENT:
        cmds.push([makeIndent(ind, options), mode, doc.contents]);

        break;
      case DOC_TYPE_ALIGN:
        cmds.push([makeAlign(ind, doc.n, options), mode, doc.contents]);

        break;
      case DOC_TYPE_TRIM:
        pos -= trim(out);

        break;
      case DOC_TYPE_GROUP:
        switch (mode) {
          case MODE_FLAT:
            if (!shouldRemeasure) {
              cmds.push([
                ind,
                doc.break ? MODE_BREAK : MODE_FLAT,
                doc.contents,
              ]);

              break;
            }
          // fallthrough

          case MODE_BREAK: {
            shouldRemeasure = false;

            const next = [ind, MODE_FLAT, doc.contents];
            const rem = width - pos;
            const hasLineSuffix = lineSuffix.length > 0;

            if (!doc.break && fits(next, cmds, rem, options, hasLineSuffix)) {
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
                  cmds.push([ind, MODE_BREAK, mostExpanded]);

                  break;
                } else {
                  for (let i = 1; i < doc.expandedStates.length + 1; i++) {
                    if (i >= doc.expandedStates.length) {
                      cmds.push([ind, MODE_BREAK, mostExpanded]);

                      break;
                    } else {
                      const state = doc.expandedStates[i];
                      const cmd = [ind, MODE_FLAT, state];

                      if (fits(cmd, cmds, rem, options, hasLineSuffix)) {
                        cmds.push(cmd);

                        break;
                      }
                    }
                  }
                }
              } else {
                cmds.push([ind, MODE_BREAK, doc.contents]);
              }
            }

            break;
          }
        }

        if (doc.id) {
          groupModeMap[doc.id] = getLast(cmds)[1];
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
        const rem = width - pos;

        const { parts } = doc;
        if (parts.length === 0) {
          break;
        }

        const [content, whitespace] = parts;
        const contentFlatCmd = [ind, MODE_FLAT, content];
        const contentBreakCmd = [ind, MODE_BREAK, content];
        const contentFits = fits(
          contentFlatCmd,
          [],
          rem,
          options,
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

        const whitespaceFlatCmd = [ind, MODE_FLAT, whitespace];
        const whitespaceBreakCmd = [ind, MODE_BREAK, whitespace];

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
        const remainingCmd = [ind, mode, fill(parts)];

        const secondContent = parts[0];

        const firstAndSecondContentFlatCmd = [
          ind,
          MODE_FLAT,
          [content, whitespace, secondContent],
        ];
        const firstAndSecondContentFits = fits(
          firstAndSecondContentFlatCmd,
          [],
          rem,
          options,
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
      case DOC_TYPE_IF_BREAK:
      case DOC_TYPE_INDENT_IF_BREAK: {
        const groupMode = doc.groupId ? groupModeMap[doc.groupId] : mode;
        if (groupMode === MODE_BREAK) {
          const breakContents =
            doc.type === DOC_TYPE_IF_BREAK
              ? doc.breakContents
              : doc.negate
              ? doc.contents
              : indent(doc.contents);
          if (breakContents) {
            cmds.push([ind, mode, breakContents]);
          }
        }
        if (groupMode === MODE_FLAT) {
          const flatContents =
            doc.type === DOC_TYPE_IF_BREAK
              ? doc.flatContents
              : doc.negate
              ? indent(doc.contents)
              : doc.contents;
          if (flatContents) {
            cmds.push([ind, mode, flatContents]);
          }
        }

        break;
      }
      case DOC_TYPE_LINE_SUFFIX:
        lineSuffix.push([ind, mode, doc.contents]);
        break;
      case DOC_TYPE_LINE_SUFFIX_BOUNDARY:
        if (lineSuffix.length > 0) {
          cmds.push([ind, mode, { type: "line", hard: true }]);
        }
        break;
      case DOC_TYPE_LINE:
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
              cmds.push([ind, mode, doc], ...lineSuffix.reverse());
              lineSuffix = [];
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
      case DOC_TYPE_LABEL:
        cmds.push([ind, mode, doc.contents]);
        break;
      case DOC_TYPE_BREAK_PARENT:
        // No op
        break;
      default:
        // eslint-disable-next-line no-console
        console.log("Invalid doc:", doc);
        throw new Error(`'${typeof doc}' is not a valid document`);
    }

    // Flush remaining line-suffix contents at the end of the document, in case
    // there is no new line after the line-suffix.
    if (cmds.length === 0 && lineSuffix.length > 0) {
      cmds.push(...lineSuffix.reverse());
      lineSuffix = [];
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

export { printDocToString };
