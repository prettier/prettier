"use strict";

/**
 * @template Element
 * @param {Array<Element>} array
 * @param {(value: Element) => boolean} predicate
 * @returns {[Array<Element>, Array<Element>]}
 */
function partition(array, predicate) {
  /** @type {[Array<Element>, Array<Element>]} */
  const result = [[], []];

  for (const value of array) {
    result[predicate(value) ? 0 : 1].push(value);
  }

  return result;
}

module.exports = partition;
