import createParsers from "../utils/create-parsers.js";
import parsersConfig from "./babel-parsers-config.js";

export const parsers = createParsers(parsersConfig);
export default { parsers };
