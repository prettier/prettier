import path from "node:path";
import prettier from "../index.js";

async function logResolvedConfigPathOrDie(context) {
  const file = context.argv.findConfigPath;
  const configFile = await prettier.resolveConfigFile(file);
  if (configFile) {
    context.logger.log(path.relative(process.cwd(), configFile));
  } else {
    throw new Error(`Can not find configure file for "${file}"`);
  }
}

export default logResolvedConfigPathOrDie;
