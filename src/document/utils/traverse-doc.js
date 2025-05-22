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
} from "../constants.js";
import InvalidDocError from "../invalid-doc-error.js";
import getDocType from "./get-doc-type.js";

// Using a unique object to compare by reference.
const traverseDocOnExitStackMarker = {};

function traverseDoc(doc, onEnter, onExit, shouldTraverseConditionalGroups) {
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

    const docType = getDocType(doc);
    if (!docType) {
      throw new InvalidDocError(doc);
    }

    // Should Recurse
    if (onEnter?.(doc) === false) {
      continue;
    }

    // When there are multiple parts to process,
    // the parts need to be pushed onto the stack in reverse order,
    // so that they are processed in the original order
    // when the stack is popped.

    switch (docType) {
      case DOC_TYPE_ARRAY:
      case DOC_TYPE_FILL: {
        const parts = docType === DOC_TYPE_ARRAY ? doc : doc.parts;
        for (let ic = parts.length, i = ic - 1; i >= 0; --i) {
          docsStack.push(parts[i]);
        }
        break;
      }

      case DOC_TYPE_IF_BREAK:
        docsStack.push(doc.flatContents, doc.breakContents);
        break;

      case DOC_TYPE_GROUP:
        if (shouldTraverseConditionalGroups && doc.expandedStates) {
          for (let ic = doc.expandedStates.length, i = ic - 1; i >= 0; --i) {
            docsStack.push(doc.expandedStates[i]);
          }
        } else {
          docsStack.push(doc.contents);
        }
        break;

      case DOC_TYPE_ALIGN:
      case DOC_TYPE_INDENT:
      case DOC_TYPE_INDENT_IF_BREAK:
      case DOC_TYPE_LABEL:
      case DOC_TYPE_LINE_SUFFIX:
        docsStack.push(doc.contents);
        break;

      case DOC_TYPE_STRING:
      case DOC_TYPE_CURSOR:
      case DOC_TYPE_TRIM:
      case DOC_TYPE_LINE_SUFFIX_BOUNDARY:
      case DOC_TYPE_LINE:
      case DOC_TYPE_BREAK_PARENT:
        // No children
        break;

      default:
        throw new InvalidDocError(doc);
    }
  }
}

export default traverseDoc;
