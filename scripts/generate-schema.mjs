#!/usr/bin/env node

import prettier from "../index.js";
import generateSchema from "./utils/generate-schema.js";

console.log(
  prettier.format(
    JSON.stringify(generateSchema(prettier.getSupportInfo().options)),
    { parser: "json" }
  )
);
