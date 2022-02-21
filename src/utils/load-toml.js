import parse from "@iarna/toml/parse-string.js";

function loadToml(filePath, content) {
  try {
    return parse(content);
  } catch (error) {
    error.message = `TOML Error in ${filePath}:\n${error.message}`;
    throw error;
  }
}

export default loadToml;
