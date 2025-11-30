/**
 * @param {unknown} object
 * @returns {object is Array<any>}
 */
function isNonEmptyArray(object) {
  return Array.isArray(object) && object.length > 0;
}

export default isNonEmptyArray;
