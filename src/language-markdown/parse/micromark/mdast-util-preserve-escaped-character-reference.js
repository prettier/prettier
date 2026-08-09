/**
 * @import {CompileContext, Extension, Handle} from "mdast-util-from-markdown";
 */

const escapedCharacterReferenceEnd =
  /&(?:#(?:[xX][\dA-Fa-f]+|\d+)|[A-Za-z][\dA-Za-z]*)\\;/u;

/**
 * @returns {Extension}
 */
function preserveEscapedCharacterReference() {
  return {
    exit: {
      definitionDestinationString: onExitDestinationString,
      resourceDestinationString: onExitDestinationString,
    },
  };
}

/**
 * @this {CompileContext}
 * @type {Handle}
 */
function onExitDestinationString(token) {
  const url = this.resume();
  const rawUrl = this.sliceSerialize(token);
  const node = this.stack.at(-1);

  // Removing this escape would let the next parse decode the character reference.
  // @ts-expect-error -- Destination strings are only used by nodes with URLs.
  node.url = escapedCharacterReferenceEnd.test(rawUrl) ? rawUrl : url;
}

export { preserveEscapedCharacterReference };
