#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const execa = require("execa");

const CSPELL_CONFIG_FILE = path.join(__dirname, "../cspell.json");

const updateConfig = (config) =>
  fs.writeFileSync(CSPELL_CONFIG_FILE, JSON.stringify(config, undefined, 4));

(async () => {
  console.log("Empty words ...");
  const config = JSON.parse(fs.readFileSync(CSPELL_CONFIG_FILE, "utf8"));
  updateConfig({
    ...config,
    words: [],
  });

  console.log("Running spellcheck with empty words ...");
  try {
    await execa("yarn lint:spellcheck");
  } catch (error) {
    const { stdout } = error;
    const words = [
      ...stdout.matchAll(/ - Unknown word \((.*?)\)/g),
    ].map(([, word]) => word.toLowerCase());
    config.words = [...new Set(words)].sort();
  }
  updateConfig({
    ...config,
  });
  console.log("Updating words ...");
  console.log("Running spellcheck with new words ...");
  const subprocess = execa("yarn lint:spellcheck");
  subprocess.stdout.pipe(process.stdout);
  await subprocess;
  console.log("CSpell config file updated.");
})();
