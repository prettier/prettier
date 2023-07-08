/**
 * @param {ReadonlyArray<import('@typescript-eslint/visitor-keys').VisitorKeys>} all
 * @returns {import('@typescript-eslint/visitor-keys').VisitorKeys}
 */
function unionVisitorKeys(all) {
  /** @type {Record<string,readonly string[] | undefined>} */
  const result = {};

  for (const [type, keys] of all.flatMap((keys) => Object.entries(keys))) {
    result[type] = [...new Set([...(result[type] ?? []), ...keys])];
  }

  return result;
}

export default unionVisitorKeys;
