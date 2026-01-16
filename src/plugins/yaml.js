/*
Be careful when changing this file,
when bundle UMD version
build script will change the file content
to remove the `__parsePrettierYamlConfig` export.
*/
export * from "../language-yaml/index.js";

// Exposed to parser prettier yaml config
import YAML from "yaml";
export const __parsePrettierYamlConfig = YAML.parse;
