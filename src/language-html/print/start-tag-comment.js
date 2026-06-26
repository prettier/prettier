import { replaceEndOfLine } from "../../document/index.js";

function printStartTagComment(path) {
  const {
    node: { value, type },
  } = path;

  if (type === "single") {
    return `//${value.trimEnd()}`;
  }

  return ["/*", replaceEndOfLine(value), "*/"];
}

export { printStartTagComment };
