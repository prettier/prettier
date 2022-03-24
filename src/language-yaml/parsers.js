/* BUNDLE_REMOVE_START */
import yamlParser from "./parser-yaml.js";
/* BUNDLE_REMOVE_END */

const parsers = {
  get yaml() {
    return /* require("./parser-yaml.js") */ yamlParser.parsers.yaml;
  },
};

export default parsers;
