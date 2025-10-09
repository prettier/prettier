/**
 * @template {*} T
 * @param {T[]} array
 * @param {number} size
 * @returns {T[][]}
 */
function chunk(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export { chunk };
