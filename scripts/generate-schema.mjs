import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const prettier = require("..");
const generateSchema = require("./utils/generate-schema");

console.log(
  prettier.format(
    JSON.stringify(generateSchema(prettier.getSupportInfo().options)),
    { parser: "json" }
  )
);
