import createParsers from "../utils/create-parsers.js";

const parsers = createParsers([[() => import("./parser-yaml.js"), ["yaml"]]]);

export default parsers;
