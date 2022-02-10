#!/usr/bin/env node

import * as cli from "../src/cli/index.js";

export const promise = cli.run(process.argv.slice(2));
