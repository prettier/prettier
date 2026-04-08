#!/usr/bin/env node

import { generateSchema } from "./utilities/generate-schema.js";

console.log(await generateSchema());
