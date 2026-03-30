/**
 * @template {function} T
 * @param {T[]} combinations
 * @returns {ReturnType<T>}
 */
function tryCombinationsSync(combinations) {
  const errors = [];
  for (const fn of combinations) {
    try {
      return fn();
    } catch (error) {
      errors.push(error);
    }
  }

  throw new AggregateError(errors, "All combinations failed");
}

export { tryCombinationsSync };
