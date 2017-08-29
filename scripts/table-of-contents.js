#!/usr/bin/env node

"use strict";

const fs = require("fs");
const toc = require("markdown-toc");
const path = require("path");

const readmeFilename = path.resolve(__dirname, "../README.md");
const oldReadme = fs.readFileSync(readmeFilename, "utf8");
const newReadme = toc.insert(oldReadme, { maxdepth: 3, bullets: ["*", "+"] });

fs.writeFileSync(readmeFilename, newReadme);
