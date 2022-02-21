import yamlParser from "./parser-yaml.js";

const parsers = {
  get yaml() {
    return yamlParser.parsers.yaml;
  },
};

export default parsers;
