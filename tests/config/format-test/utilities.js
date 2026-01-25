import path from "node:path";
import { FORMAT_TEST_DIRECTORY, TEST_STANDALONE } from "./constants.js";

const normalizeDirectory = (directory) => path.normalize(directory + path.sep);

const isLanguage = (dirname, language) =>
  normalizeDirectory(dirname).startsWith(
    normalizeDirectory(path.join(FORMAT_TEST_DIRECTORY, language)),
  );

const isErrorTest = (dirname) =>
  normalizeDirectory(dirname).includes(`${path.sep}_errors_${path.sep}`);

const ensurePromise = (value) => {
  const isPromise = TEST_STANDALONE
    ? // In standalone test, promise is from another context
      Object.prototype.toString.call(value) === "[object Promise]"
    : value instanceof Promise;

  if (!isPromise) {
    throw new TypeError("Expected value to be a 'Promise'.");
  }

  return value;
};

const shouldThrowOnFormat = ({ basename }, options, parser) => {
  const { errors = {} } = options;
  if (errors === true) {
    return true;
  }

  const files = errors[parser];

  if (files === true || (Array.isArray(files) && files.includes(basename))) {
    return true;
  }

  return false;
};

export {
  ensurePromise,
  isErrorTest,
  isLanguage,
  normalizeDirectory,
  shouldThrowOnFormat,
};
