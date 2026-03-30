function createError(message, options) {
  const { cause, ...restOptions } = options;
  const errorOptions = cause ? { cause } : undefined;

  // Construct an error similar to the ones thrown by Babel.
  const error = new SyntaxError(
    message +
      " (" +
      options.loc.start.line +
      ":" +
      options.loc.start.column +
      ")",
    errorOptions,
  );

  return Object.assign(error, restOptions);
}

export default createError;
