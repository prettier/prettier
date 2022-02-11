import { pathToFileURL } from "node:url";
import path from "node:path";

const entry = pathToFileURL(path.join(process.env.PRETTIER_DIR, "index.js"));

const getPrettier = async () => {
  const { default: prettier } = await import(entry);

  return prettier;
};

export default getPrettier;
