import {
  breakParent,
  group,
  hardlineWithoutBreakParent,
  ifBreak,
  join,
} from "../../document/builders.js";
import { printDocToString } from "../../document/printer.js";
import getStringWidth from "../../utils/get-string-width.js";

function printTable(path, options, print) {
  const { node } = path;

  const columnMaxWidths = [];
  // { [rowIndex: number]: { [columnIndex: number]: {text: string, width: number} } }
  const contents = path.map(
    () =>
      path.map(({ index: columnIndex }) => {
        const text = printDocToString(print(), options).formatted;
        const width = getStringWidth(text);
        columnMaxWidths[columnIndex] = Math.max(
          columnMaxWidths[columnIndex] || 3, // minimum width = 3 (---, :--, :-:, --:)
          width,
        );
        return { text, width };
      }, "children"),
    "children",
  );

  const alignedTable = printTableContents(/* isCompact */ false);
  if (options.proseWrap !== "never") {
    return [breakParent, alignedTable];
  }

  // Only if the --prose-wrap never is set and it exceeds the print width.
  const compactTable = printTableContents(/* isCompact */ true);
  return [breakParent, group(ifBreak(compactTable, alignedTable))];

  function printTableContents(isCompact) {
    /** @type{Doc[]} */
    const parts = [printRow(contents[0], isCompact), printAlign(isCompact)];
    if (contents.length > 1) {
      parts.push(
        join(
          hardlineWithoutBreakParent,
          contents
            .slice(1)
            .map((rowContents) => printRow(rowContents, isCompact)),
        ),
      );
    }
    return join(hardlineWithoutBreakParent, parts);
  }

  function printAlign(isCompact) {
    const align = columnMaxWidths.map((width, index) => {
      const align = node.align[index];
      const first = align === "center" || align === "left" ? ":" : "-";
      const last = align === "center" || align === "right" ? ":" : "-";
      const middle = isCompact ? "-" : "-".repeat(width - 2);
      return `${first}${middle}${last}`;
    });

    return `| ${align.join(" | ")} |`;
  }

  function printRow(rowContents, isCompact) {
    const columns = rowContents.map(({ text, width }, columnIndex) => {
      if (isCompact) {
        return text;
      }
      const spaces = columnMaxWidths[columnIndex] - width;
      const align = node.align[columnIndex];
      let before = 0;
      if (align === "right") {
        before = spaces;
      } else if (align === "center") {
        before = Math.floor(spaces / 2);
      }
      const after = spaces - before;
      return `${" ".repeat(before)}${text}${" ".repeat(after)}`;
    });

    return `| ${columns.join(" | ")} |`;
  }
}

export { printTable };
