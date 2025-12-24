function responseInBrowser(function_, context) {
  const { accessPath, optionsIndex, browser } = context;

  function resolve(value) {
    // Comments in `graphql` can't be serialized, and we are not using it in format test
    if (accessPath === "formatWithCursor") {
      value.comments = [];
    }

    // `BigInt` can't be serialized in chrome
    if (accessPath === "__debug.parse" && browser === "chrome") {
      value.ast = serializeAst(value.ast);
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
    // `Infinity` can't be serialized in chrome
    if (browser === "chrome") {
      const options = deserializeOptions(arguments_[optionsIndex]);
      arguments_[optionsIndex] = options;
    }

    try {
      return resolve(await function_(...arguments_));
    } catch (error) {
      return reject(error);
    }
  };
}

function requestFromNode(function_, context) {
  const { accessPath, optionsIndex, browser } = context;

  function resolve({ value }) {
    // `BigInt` can't be serialized in chrome
    if (accessPath === "__debug.parse" && browser === "chrome") {
      value.ast = deserializeAst(value.ast);
    }

    return value;
  }

  function reject(response) {
    const error = deserializeError(response.serializedError);
    throw error;
  }

  return async function (...arguments_) {
    // `Infinity` can't be serialized in chrome
    if (browser === "chrome") {
      const options = arguments_[optionsIndex];
      arguments_[optionsIndex] = serializeOptions(options);
    }

    const response = await function_(...arguments_);

    if (response.status === "rejected") {
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

function serializeOptions(options = {}) {
  return {
    ...options,
    printWidth: serializeValue(options?.printWidth),
  };
}

function deserializeOptions(options = {}) {
  return {
    ...options,
    printWidth: deserializeValue(options?.printWidth),
  };
}

function serializeAst(ast) {
  let shouldSerialize = false;

  const serialized = JSON.stringify(ast, (_, value) => {
    const serialized = serializeValue(value);
    if (serialized !== value) {
      shouldSerialize ||= true;
    }
    return serialized;
  });

  return shouldSerialize ? serialized : ast;
}

function deserializeAst(ast) {
  if (typeof ast !== "string") {
    return ast;
  }

  return JSON.parse(ast, (_, value) => deserializeValue(value));
}

const INTERNAL_VALUE_KIND = "[[INTERNAL_VALUE_KIND]]";
function deserializeValue(value) {
  switch (value?.[INTERNAL_VALUE_KIND]) {
    case "Number.POSITIVE_INFINITY":
      return Number.POSITIVE_INFINITY;
    case "bigint":
      return BigInt(value.bigint);
  }

  return value;
}

function serializeValue(value) {
  if (value === Number.POSITIVE_INFINITY) {
    return { [INTERNAL_VALUE_KIND]: "Number.POSITIVE_INFINITY" };
  }

  if (typeof value === "bigint") {
    return { [INTERNAL_VALUE_KIND]: "bigint", bigint: String(value) };
  }

  return value;
}

const ensurePromise = (value) => {
  if (!(value instanceof Promise)) {
    throw new TypeError("Expected value to be a 'Promise'.");
  }

  return value;
};

export { ensurePromise, requestFromNode, responseInBrowser };
