import path from "node:path";
import { FORMAT_TEST_DIRECTORY } from "./constants.js";

const normalizeDirectory = (directory) => path.normalize(directory + path.sep);

const isLanguage = (dirname, language) =>
  normalizeDirectory(dirname).startsWith(
    normalizeDirectory(path.join(FORMAT_TEST_DIRECTORY, language)),
  );

const isErrorTest = (dirname) => {
  normalizeDirectory(dirname).includes(`${path.sep}_errors_${path.sep}`);
};

export { isErrorTest, isLanguage, normalizeDirectory };
