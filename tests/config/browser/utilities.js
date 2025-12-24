function responseInBrowser(function_, context) {
  const { accessPath, optionsIndex, browser } = context;

  function resolve(value, options) {
    // Comments in `graphql` can't be serialized, and we are not using it in format test
    if (accessPath === "formatWithCursor" && options.parser === "graphql") {
      value.comments = [];
    }

    return { status: "fulfilled", value };
  }

  function reject(error) {
    const response = { status: "rejected", reason: error };

    // Firefox can't serialize `Error`
    if (browser === "firefox") {
      delete response.reason;
    }

    response.serializedError = serializeError(error);
    return response;
  }

  return async function (...arguments_) {
    const options = deserializeOptions(arguments_[optionsIndex]);
    arguments_[optionsIndex] = options;

    try {
      return resolve(await function_(...arguments_), options);
    } catch (error) {
      return reject(error);
    }
  };
}

function requestFromNode(function_, context) {
  const {
    // accessPath,
    optionsIndex,
    // browser,
  } = context;

  function resolve(response) {
    return response.value;
  }

  function reject(response) {
    throw deserializeError(response.serializedError);
  }

  return async function (...arguments_) {
    arguments_[optionsIndex] = serializeOptions(arguments_[optionsIndex]);

    const response = await function_(...arguments_);
    if (response.status === "reject") {
      return reject(response);
    }

    return resolve(response);
  };
}

function deserializeError(serialized) {
  const error = new Error(serialized.message);

  Object.assign(error, serialized);

  if (serialized.cause) {
    error.cause = deserializeError(serialized.cause);
  }

  return error;
}

function serializeError(originalError) {
  const error = { message: originalError.message, ...originalError };
  delete error.cause;
  if (originalError.cause instanceof Error) {
    error.cause = serializeError(originalError.cause);
  }
  return error;
}

const POSITIVE_INFINITY_PLACEHOLDER = "[[Number.POSITIVE_INFINITY]]";

function serializeOptions(options = {}) {
  if (options.printWidth === Number.POSITIVE_INFINITY) {
    return {
      ...options,
      printWidth: POSITIVE_INFINITY_PLACEHOLDER,
    };
  }

  return options;
}

function deserializeOptions(options = {}) {
  if (options.printWidth === POSITIVE_INFINITY_PLACEHOLDER) {
    options = {
      ...options,
      printWidth: Number.POSITIVE_INFINITY,
    };
  }

  return options;
}

export { requestFromNode, responseInBrowser };
