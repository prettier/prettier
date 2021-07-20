import { createRequire } from "node:module";
import prettier from "../index.js";

const require = createRequire(import.meta.url);

const generateSchema = require("./utils/generate-schema");

console.log(
  prettier.format(
    JSON.stringify(generateSchema(prettier.getSupportInfo().options)),
    { parser: "json" }
  )
);
