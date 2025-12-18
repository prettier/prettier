import { htmlBlockNames, htmlRawNames } from "micromark-util-html-tag-name";
import htmlWhitespace from "../../utilities/html-whitespace.js";
import { getOrderedListItemInfo, mapAst, splitText } from "../utilities.js";

// 0x0 ~ 0x10ffff
const isSingleCharRegex = /^\\?.$/su;
const isNewLineBlockquoteRegex = /^\n *>[ >]*$/u;

function preprocess(ast, options) {
  if (options.parser === "mdx") {
    ast = restoreUnescapedCharacter(ast, options);
  } else {
    ast = addRawToText(ast, options);
  }
  ast = mergeContinuousTexts(ast);
  if (options.parser === "mdx") {
    ast = transformIndentedCodeblockAndMarkItsParentList(ast, options);
  } else {
    ast = transformIndentedCodeblock(ast, options);
  }
  if (options.parser !== "mdx") {
    ast = markOriginalImageAndLinkAlt(ast, options);
  }
  if (options.parser === "mdx") {
    ast = markAlignedListLegacy(ast, options);
  } else {
    ast = markAlignedList(ast, options);
  }
  if (options.parser !== "mdx") {
    ast = transformInlineHtml(ast);
  }
  if (options.parser === "mdx") {
    ast = splitTextIntoSentencesLegacy(ast);
  } else {
    ast = splitTextIntoSentences(ast);
  }
  return ast;
}

function restoreUnescapedCharacter(ast, options) {
  return mapAst(ast, (node) => {
    if (node.type !== "text") {
      return node;
    }

    const { value } = node;

    if (
      value === "*" ||
      value === "_" || // handle these cases in printer
      !isSingleCharRegex.test(value) ||
      node.position.end.offset - node.position.start.offset === value.length
    ) {
      return node;
    }

    const text = options.originalText.slice(
      node.position.start.offset,
      node.position.end.offset,
    );

    if (isNewLineBlockquoteRegex.test(text)) {
      return node;
    }

    return { ...node, value: text };
  });
}

function addRawToText(ast, options) {
  return mapAst(ast, (node) => {
    if (node.type === "text") {
      // https://github.com/remarkjs/remark-gfm/issues/16
      node.raw = options.originalText.slice(
        node.position.start.offset,
        node.position.end.offset,
      );
    }
    return node;
  });
}

function mergeChildren(ast, shouldMerge, mergeNode) {
  return mapAst(ast, (node) => {
    if (!node.children) {
      return node;
    }

    const children = [];
    let lastChild;
    let changed;
    for (let child of node.children) {
      if (lastChild && shouldMerge(lastChild, child)) {
        child = mergeNode(lastChild, child);
        // Replace the previous node
        children.splice(-1, 1, child);
        changed ||= true;
      } else {
        children.push(child);
      }

      lastChild = child;
    }

    return changed ? { ...node, children } : node;
  });
}

function mergeContinuousTexts(ast) {
  return mergeChildren(
    ast,
    (prevNode, node) => prevNode.type === "text" && node.type === "text",
    (prevNode, node) => ({
      type: "text",
      value: prevNode.value + node.value,
      position: {
        start: prevNode.position.start,
        end: node.position.end,
      },
    }),
  );
}

function splitTextIntoSentencesLegacy(ast) {
  return mapAst(ast, (node, index, [parentNode]) => {
    if (node.type !== "text") {
      return node;
    }

    let { value } = node;

    if (parentNode.type === "paragraph") {
      // CommonMark doesn't remove trailing/leading \f, but it should be
      // removed in the HTML rendering process
      if (index === 0) {
        value = htmlWhitespace.trimStart(value);
      }
      if (index === parentNode.children.length - 1) {
        value = htmlWhitespace.trimEnd(value);
      }
    }

    return {
      type: "sentence",
      position: node.position,
      children: splitText(value),
    };
  });
}

function splitTextIntoSentences(ast) {
  const canOpenAccidentalWikiLink = new Set();
  const riskyParagraphPositions = new Set(); // we can't use nodes themselves because they will be cloned.

  walkAst(ast, (node, parentStack) => {
    if (node.type === "wikiLink") {
      markAncestors(parentStack); // word wrapping can accidentally merge nodes like `[[foo\n[[wiki link]]`
      return;
    }

    if (node.type !== "text") {
      return;
    }

    if (node.raw.includes("[[")) {
      for (const ancestor of parentStack) {
        if (ancestor.type === "paragraph") {
          canOpenAccidentalWikiLink.add(ancestor);
        }
      }
    }

    if (node.raw.includes("]]")) {
      markAncestors(parentStack);
    }
  });

  return mapAst(ast, (node, index, parentStack) => {
    if (node.type !== "text") {
      return node;
    }

    // NOTE: there's trade-off between using `node.value` or `node.raw` here.
    // Using `node.raw`, we can better preserve the original text, especially escaped characters.
    // Using `node.value`, we don't need to care about markers like `\n > ` in `blockquote`s.
    let text = node.raw;

    const paragraphIndex = parentStack.findIndex(
      (ancestor) => ancestor?.type === "paragraph",
    );

    const paragraphNode =
      paragraphIndex === -1 ? undefined : parentStack[paragraphIndex];

    if (paragraphNode) {
      if (
        parentStack
          .slice(paragraphIndex + 1)
          .some((ancestor) => ancestor?.type === "blockquote")
      ) {
        text = getBlockquoteRawText(text, node);
      }

      const parentNode = parentStack[0];

      if (parentNode?.type === "paragraph") {
        if (index === 0) {
          text = htmlWhitespace.trimStart(text);
        }
        if (index === parentNode.children.length - 1) {
          text = htmlWhitespace.trimEnd(text);
        }
      }
    }

    if (paragraphNode && riskyParagraphPositions.has(paragraphNode.position)) {
      return {
        type: "text",
        position: node.position,
        value: text,
      };
    }

    return {
      type: "sentence",
      position: node.position,
      children: splitText(text),
    };
  });

  function walkAst(ast, handler) {
    return (function preorder(node, parentStack) {
      handler(node, parentStack);
      if (node.children) {
        for (const child of node.children) {
          preorder(child, [node, ...parentStack]);
        }
      }
    })(ast, []);
  }

  function markAncestors(parentStack) {
    for (const ancestor of parentStack) {
      if (
        ancestor.type === "paragraph" &&
        canOpenAccidentalWikiLink.has(ancestor)
      ) {
        riskyParagraphPositions.add(ancestor.position);
      }
    }
  }
}

function getBlockquoteRawText(text, node) {
  const angleBracketsRegex = /^([ \t]*>[ \t]*)*/u;
  const rawLines = text.split("\n");
  const valueLines = node.value.split("\n");
  const resultLines = rawLines.map((rawLine, index) => {
    const valueLine = valueLines[index] ?? "";
    const leadingTextAngleBrackets =
      valueLine.match(angleBracketsRegex)[0] ?? "";
    return rawLine.replace(angleBracketsRegex, leadingTextAngleBrackets);
  });
  return resultLines.join("\n");
}

function transformIndentedCodeblock(ast, options) {
  return mapAst(ast, (node) => {
    if (node.type !== "code") {
      return node;
    }
    // the first char may point to `\n`, e.g. `\n\t\tbar`, just ignore it
    const isIndented = /^\n?(?: {4,}|\t)/u.test(
      options.originalText.slice(
        node.position.start.offset,
        node.position.end.offset,
      ),
    );

    node.isIndented = isIndented;
    return node;
  });
}

function transformIndentedCodeblockAndMarkItsParentList(ast, options) {
  return mapAst(ast, (node, index, parentStack) => {
    if (node.type === "code") {
      // the first char may point to `\n`, e.g. `\n\t\tbar`, just ignore it
      const isIndented = /^\n?(?: {4,}|\t)/u.test(
        options.originalText.slice(
          node.position.start.offset,
          node.position.end.offset,
        ),
      );

      node.isIndented = isIndented;

      if (isIndented) {
        for (let i = 0; i < parentStack.length; i++) {
          const parent = parentStack[i];

          // no need to check checked items
          if (parent.hasIndentedCodeblock) {
            break;
          }

          if (parent.type === "list") {
            parent.hasIndentedCodeblock = true;
          }
        }
      }
    }
    return node;
  });
}

// remark 11 removes nested links so we need to recover the original alt text
function markOriginalImageAndLinkAlt(ast, options) {
  const { originalText } = options;
  return mapAst(ast, (node) => {
    if (node.type === "image" || node.type === "imageReference") {
      node.originalAltText = getBracketContent(
        originalText,
        node.position.start.offset,
        node.position.end.offset,
      );
      return node;
    }

    if (node.type !== "link" || !node.url) {
      return node;
    }

    const originalAlt = getBracketContent(
      originalText,
      node.position.start.offset,
      node.position.end.offset,
    );

    if (originalAlt && /[[\]]/u.test(originalAlt)) {
      node.originalLabelText = originalAlt;
    }

    return node;
  });
}

function getBracketContent(text, startOffset, endOffset) {
  const firstBracket = text.indexOf("[", startOffset);

  if (firstBracket === -1 || firstBracket >= endOffset) {
    return null;
  }

  let depth = 1;
  let index = firstBracket + 1;

  while (index < endOffset) {
    const char = text[index];

    if (char === "\\") {
      index += 2;
      continue;
    }

    if (char === "[") {
      depth++;
    } else if (char === "]") {
      depth--;
      if (depth === 0) {
        return text.slice(firstBracket + 1, index);
      }
    }

    index++;
  }

  return null;
}

function markAlignedList(ast, options) {
  return mapAst(ast, (node, index, parentStack) => {
    if (node.type === "list" && node.children.length > 0) {
      // if one of its parents is not aligned, it's not possible to be aligned in sub-lists
      for (let i = 0; i < parentStack.length; i++) {
        const parent = parentStack[i];
        if (parent.type === "list" && !parent.isAligned) {
          node.isAligned = false;
          return node;
        }
      }

      const next = parentStack[0]?.children[index + 1];
      if (next?.type === "code" && next.isIndented) {
        // hard to align in this case
        node.isAligned = false;
        return node;
      }

      node.isAligned = isAligned(node);
    }

    return node;
  });

  function getListItemStart(listItem) {
    return listItem.children.length === 0
      ? -1
      : listItem.children[0].position.start.column - 1;
  }

  function isAligned(list) {
    if (!list.ordered) {
      /**
       * - 123
       * - 123
       */
      return true;
    }

    const [firstItem, secondItem] = list.children;

    const firstInfo = getOrderedListItemInfo(firstItem, options);

    if (firstInfo.leadingSpaces.length > 1) {
      /**
       * 1.   123
       *
       * 1.   123
       * 1. 123
       */
      return true;
    }

    const firstStart = getListItemStart(firstItem);

    if (firstStart === -1) {
      /**
       * 1.
       *
       * 1.
       * 1.
       */
      return false;
    }

    if (list.children.length === 1) {
      /**
       * aligned:
       *
       * 11. 123
       *
       * not aligned:
       *
       * 1. 123
       */
      return firstStart % options.tabWidth === 0;
    }

    const secondStart = getListItemStart(secondItem);

    if (firstStart !== secondStart) {
      /**
       * 11. 123
       * 1. 123
       *
       * 1. 123
       * 11. 123
       */
      return false;
    }

    if (firstStart % options.tabWidth === 0) {
      /**
       * 11. 123
       * 12. 123
       */
      return true;
    }

    /**
     * aligned:
     *
     * 11. 123
     * 1.  123
     *
     * not aligned:
     *
     * 1. 123
     * 2. 123
     */
    const secondInfo = getOrderedListItemInfo(secondItem, options);
    return secondInfo.leadingSpaces.length > 1;
  }
}

function markAlignedListLegacy(ast, options) {
  return mapAst(ast, (node, index, parentStack) => {
    if (node.type === "list" && node.children.length > 0) {
      // if one of its parents is not aligned, it's not possible to be aligned in sub-lists
      for (let i = 0; i < parentStack.length; i++) {
        const parent = parentStack[i];
        if (parent.type === "list" && !parent.isAligned) {
          node.isAligned = false;
          return node;
        }
      }

      node.isAligned = isAligned(node);
    }

    return node;
  });

  function getListItemStart(listItem) {
    return listItem.children.length === 0
      ? -1
      : listItem.children[0].position.start.column - 1;
  }

  function isAligned(list) {
    if (!list.ordered) {
      /**
       * - 123
       * - 123
       */
      return true;
    }

    const [firstItem, secondItem] = list.children;

    const firstInfo = getOrderedListItemInfo(firstItem, options);

    if (firstInfo.leadingSpaces.length > 1) {
      /**
       * 1.   123
       *
       * 1.   123
       * 1. 123
       */
      return true;
    }

    const firstStart = getListItemStart(firstItem);

    if (firstStart === -1) {
      /**
       * 1.
       *
       * 1.
       * 1.
       */
      return false;
    }

    if (list.children.length === 1) {
      /**
       * aligned:
       *
       * 11. 123
       *
       * not aligned:
       *
       * 1. 123
       */
      return firstStart % options.tabWidth === 0;
    }

    const secondStart = getListItemStart(secondItem);

    if (firstStart !== secondStart) {
      /**
       * 11. 123
       * 1. 123
       *
       * 1. 123
       * 11. 123
       */
      return false;
    }

    if (firstStart % options.tabWidth === 0) {
      /**
       * 11. 123
       * 12. 123
       */
      return true;
    }

    /**
     * aligned:
     *
     * 11. 123
     * 1.  123
     *
     * not aligned:
     *
     * 1. 123
     * 2. 123
     */
    const secondInfo = getOrderedListItemInfo(secondItem, options);
    return secondInfo.leadingSpaces.length > 1;
  }
}

function transformInlineHtml(ast) {
  return mapAst(ast, (node) => {
    if (!node.children) {
      return node;
    }

    const { children } = node;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.type !== "html") {
        continue;
      }
      const tagName = child.value
        .match(/^<\/?([a-z0-9-]+)/iu)?.[1]
        .toLowerCase();
      if (!tagName) {
        continue;
      }
      if (
        [...htmlBlockNames].includes(tagName) ||
        htmlRawNames.includes(tagName)
      ) {
        continue;
      }
      const prev = children[i - 1];
      const next = children[i + 1];

      const previousLineDifference =
        prev?.type !== "paragraph"
          ? null
          : child.position.start.line - prev.position.end.line;
      /** @type {"immediate" | "with-new-line" | "none"} */
      const mergePrevious =
        previousLineDifference === null
          ? "none"
          : previousLineDifference === 0
            ? "immediate"
            : previousLineDifference === 1
              ? "with-new-line"
              : "none";

      const nextLineDifference =
        next?.type !== "paragraph"
          ? null
          : next.position.start.line - child.position.end.line;
      /** @type {"immediate" | "with-new-line" | "none"} */
      const mergeNext =
        previousLineDifference === null
          ? "none"
          : nextLineDifference === 0
            ? "immediate"
            : nextLineDifference === 1
              ? "with-new-line"
              : "none";

      if (mergePrevious === "none" && mergeNext === "none") {
        continue;
      }

      if (mergePrevious !== "none") {
        if (mergePrevious === "with-new-line") {
          prev.children.push(newlineTextAfter(prev));
        }
        prev.children.push(child);
        prev.position.end = child.position.end;
        children.splice(i, 1);
        i--;

        if (mergeNext === "none") {
          continue;
        }
        if (mergeNext === "with-new-line") {
          prev.children.push(newlineTextAfter(child));
        }
        prev.children.push(...next.children);
        prev.position.end = next.position.end;
        children.splice(i + 1, 1);
        continue;
      }

      // mergeNext must be not "none" here
      if (mergeNext === "with-new-line") {
        next.children.unshift(newlineTextAfter(child));
      }
      next.children.unshift(child);
      next.position.start = child.position.start;
      children.splice(i, 1);
    }
    return node;
  });

  function newlineTextAfter(node) {
    return {
      type: "text",
      value: "\n",
      raw: "\n",
      position: {
        start: {
          line: node.position.end.line,
          column: node.position.end.column,
          offset: node.position.end.offset,
        },
        end: {
          line: node.position.end.line + 1,
          column: 1,
          offset: node.position.end.offset + 1,
        },
      },
    };
  }
}

export default preprocess;
