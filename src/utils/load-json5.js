import json5 from "json5";

function loadJson5(filePath, content) {
  try {
    return json5.parse(content);
  } catch (error) {
    error.message = `JSON5 Error in ${filePath}:\n${error.message}`;
    throw error;
  }
}

export default loadJson5;
