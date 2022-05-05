import {pathToFileURL} from "node:url"

async function loadJsConfig(filePath, ) {
  let config

  try {
    config = await import(pathToFileURL(filePath));
  } catch (error) {
    error.message = `JS Error in ${filePath}:\n${error.message}`;
    throw error;
  }

  return config?.default;
}

export default loadJsConfig;
