function tryCombinations(combinations) {
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

export default tryCombinations;
