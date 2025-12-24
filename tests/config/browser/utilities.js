function deserializeErrorInNode(serialized) {
  const error = new Error(serialized.message);

  Object.assign(error, serialized);

  if (serialized.cause) {
    error.cause = deserializeErrorInNode(serialized.cause);
  }

  return error;
}

function deserializeResponseInNode(response) {
  if (response.status === "fulfilled") {
    return response;
  }

  return {
    status: response.status,
    reason: deserializeErrorInNode(response.serializedError),
  };
}

function serializeResponseInBrowser(response) {
  if (response.status === "fulfilled") {
    return response;
  }

  return {
    status: response.status,
    serializedError: serializeErrorInBrowser(response.reason),
  };
}

function serializeErrorInBrowser(originalError) {
  const error = { message: originalError.message, ...originalError };
  delete error.cause;
  if (originalError.cause instanceof Error) {
    error.cause = serializeErrorInBrowser(originalError.cause);
  }
  return error;
}

const POSITIVE_INFINITY_PLACEHOLDER = "[[Number.POSITIVE_INFINITY]]";

function serializeOptionsInNode(options = {}) {
  if (options.printWidth === Number.POSITIVE_INFINITY) {
    return {
      ...options,
      printWidth: POSITIVE_INFINITY_PLACEHOLDER,
    };
  }

  return options;
}

function deserializeOptionsInBrowser(options = {}) {
  if (options.printWidth === POSITIVE_INFINITY_PLACEHOLDER) {
    options.printWidth = Number.POSITIVE_INFINITY;
  }

  return options;
}

export {
  deserializeOptionsInBrowser,
  deserializeResponseInNode,
  serializeOptionsInNode,
  serializeResponseInBrowser,
};
