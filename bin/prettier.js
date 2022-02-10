#!/usr/bin/env node

import * as cli from "../src/cli/index.js";

export const cliResult = cli.run(process.argv.slice(2));
