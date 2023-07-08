/**
 * @template {{}} T
 * @template {keyof T} OmitKeys
 * @param {T} object
 * @param {ReadonlyArray<OmitKeys>} keys
 * @returns {Omit<T, keyof T>}
 */
function omit(object, keys) {
  const keySet = new Set(keys);
  // @ts-expect-error
  return Object.fromEntries(
    // @ts-expect-error
    Object.entries(object).filter(([key]) => !keySet.has(key)),
  );
}

export default omit;
