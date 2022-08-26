import {
  DOC_TYPE_STRING,
  DOC_TYPE_ARRAY,
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
} from "../constants.js";

// Using a unique object to compare by reference.
const traverseDocOnExitStackMarker = {};

function traverse(doc, onEnter, onExit, shouldTraverseConditionalGroups) {
  const docsStack = [doc];

  while (docsStack.length > 0) {
    const doc = docsStack.pop();

    if (doc === traverseDocOnExitStackMarker) {
      onExit(docsStack.pop());
      continue;
    }

    if (onExit) {
      docsStack.push(doc, traverseDocOnExitStackMarker);
    }

    // Should Recurse
    if (onEnter?.(doc) !== false) {
      continue;
    }

    // When there are multiple parts to process,
    // the parts need to be pushed onto the stack in reverse order,
    // so that they are processed in the original order
    // when the stack is popped.
    if (Array.isArray(doc) || doc.type === DOC_TYPE_FILL) {
      const parts = getDocParts(doc);
      for (let ic = parts.length, i = ic - 1; i >= 0; --i) {
        docsStack.push(parts[i]);
      }
    } else if (doc.type === DOC_TYPE_IF_BREAK) {
      if (doc.flatContents) {
        docsStack.push(doc.flatContents);
      }
      if (doc.breakContents) {
        docsStack.push(doc.breakContents);
      }
    } else if (doc.type === DOC_TYPE_GROUP && doc.expandedStates) {
      if (shouldTraverseConditionalGroups) {
        for (let ic = doc.expandedStates.length, i = ic - 1; i >= 0; --i) {
          docsStack.push(doc.expandedStates[i]);
        }
      } else {
        docsStack.push(doc.contents);
      }
    } else if (doc.contents) {
      docsStack.push(doc.contents);
    }
  }
}

export default traverse;
