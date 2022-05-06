#!/usr/bin/env node

import { format, getSupportInfo } from "../index.js";
import generateSchema from "./utils/generate-schema.mjs";

console.log(
  format(JSON.stringify(generateSchema(getSupportInfo().options)), {
    parser: "json",
  })
);
