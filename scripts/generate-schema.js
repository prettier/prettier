#!/usr/bin/env node

import { format } from "../index.js";
import { getSupportInfo } from "../src/main/support.js";
import generateSchema from "./utils/generate-schema.js";

console.log(
  await format(JSON.stringify(generateSchema(getSupportInfo().options)), {
    parser: "json",
  }),
);
