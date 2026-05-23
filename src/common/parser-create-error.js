function createError(message, options) {
  // Construct an error similar to the ones thrown by Babel.
  const error = new SyntaxError(
    message +
      " (" +
      options.loc.start.line +
      ":" +
      options.loc.start.column +
      ")",
    { cause: options.cause },
  );

  return Object.assign(error, options);
}

export default createError;
