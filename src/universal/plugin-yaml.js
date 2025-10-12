export * from "../language-yaml/index.js";

// Exposed to parser prettier yaml config
// Only available in Node.js
import YAML from "yaml";
export const __parsePrettierYamlConfig = YAML.parse;
