/**
 * @param {unknown} object
 * @returns {object is NonNullable<object>}
 */
function isObject(object) {
  return object !== null && typeof object === "object";
}

export default isObject;
