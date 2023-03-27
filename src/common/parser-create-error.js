function createError(message, options) {
  // TODO: Use `Error.prototype.cause` when we drop support for Node.js<18.7.0

  // Construct an error similar to the ones thrown by Babel.
  const error = new SyntaxError(
    message +
      " (" +
      options.loc.start.line +
      ":" +
      options.loc.start.column +
      ")"
  );

  return Object.assign(error, options);
}

export default createError;
