import htmlWhitespace from "../../utilities/html-whitespace.js";
import { getOrderedListItemInfo, mapAst, splitText } from "../utilities.js";

// 0x0 ~ 0x10ffff
const isSingleCharRegex = /^\\?.$/su;
const isNewLineBlockquoteRegex = /^\n *>[ >]*$/;

function preprocess(ast, options) {
  ast = restoreUnescapedCharacter(ast, options);
  ast = mergeContinuousTexts(ast);
  ast = transformIndentedCodeblockAndMarkItsParentList(ast, options);
  ast = markAlignedList(ast, options);
  ast = splitTextIntoSentences(ast);
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

function splitTextIntoSentences(ast) {
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

function transformIndentedCodeblockAndMarkItsParentList(ast, options) {
  return mapAst(ast, (node, index, parentStack) => {
    if (node.type === "code") {
      // the first char may point to `\n`, e.g. `\n\t\tbar`, just ignore it
      const isIndented = /^\n?(?: {4,}|\t)/.test(
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

export default preprocess;
