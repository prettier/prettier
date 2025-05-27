/**
 * @template {function} T
 * @param {T[]} combinations
 * @returns {ReturnType<T>}
 */
function tryCombinations(combinations) {
  const errors = [];
  for (const fn of combinations) {
    try {
      return fn();
    } catch (error) {
      errors.push(error);
    }
  }

  // TODO: Use `AggregateError` when we drop Node.js v14
  // throw new AggregateError(errors, "All combinations failed");
  throw Object.assign(new Error("All combinations failed"), { errors });
}

/**
 * @template {function} T
 * @param {T[]} combinations
 * @returns {Promise<ReturnType<T>>}
 */
async function tryCombinationsAsync(combinations) {
  const errors = [];
  for (const fn of combinations) {
    try {
      return await fn();
    } catch (error) {
      errors.push(error);
    }
  }

  // TODO: Use `AggregateError` when we drop Node.js v14
  // throw new AggregateError(errors, "All combinations failed");
  throw Object.assign(new Error("All combinations failed"), { errors });
}

export default tryCombinations;
export { tryCombinationsAsync };
