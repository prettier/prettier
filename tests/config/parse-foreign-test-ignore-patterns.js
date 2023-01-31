import fs from "node:fs";

const ROOT_DIR_PREFIX = "<rootDir>/";

function* parseForeignTestIgnorePatterns(file) {
  if (!fs.existsSync(file)) {
    return;
  }

  let content = "";
  try {
    content = fs.readFileSync(file, "utf8");
  } catch {
    return;
  }

  for (let pattern of content.split("\n")) {
    pattern = pattern.trim();

    if (pattern.startsWith("/")) {
      pattern = pattern.slice(1);
    }

    if (!pattern.startsWith("tests/")) {
      continue;
    }

    yield ROOT_DIR_PREFIX + pattern;
  }
}

export default parseForeignTestIgnorePatterns;
