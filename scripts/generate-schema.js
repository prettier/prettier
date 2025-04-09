#!/usr/bin/env node

import { generateSchema } from "./utils/generate-schema.js";

console.log(await generateSchema());
