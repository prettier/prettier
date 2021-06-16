#!/usr/bin/env node

import fs from "node:fs/promises";
import execa from "execa";

const CSPELL_CONFIG_FILE = new URL("../cspell.json", import.meta.url);
const updateConfig = (config) =>
  fs.writeFile(CSPELL_CONFIG_FILE, JSON.stringify(config, undefined, 4));
const runSpellcheck = () => execa("yarn", ["lint:spellcheck"]);

(async () => {
  console.log("Empty words ...");
  const config = JSON.parse(await fs.readFile(CSPELL_CONFIG_FILE, "utf8"));
  const oldWords = config.words;
  await updateConfig({ ...config, words: [] });

  console.log("Running spellcheck with empty words ...");
  try {
    await runSpellcheck();
  } catch ({ stdout }) {
    let words = [...stdout.matchAll(/ - Unknown word \((.*?)\)/g)].map(
      ([, word]) => word
    );
    // Unique
    words = [...new Set(words)];
    // Remove upper case word, if lower case one already exists
    words = words.filter((word) => {
      const lowerCased = word.toLowerCase();
      return lowerCased === word || !words.includes(lowerCased);
    });
    // Compare function from https://github.com/streetsidesoftware/vscode-spell-checker/blob/2fde3bc5c658ee51da5a56580aa1370bf8174070/packages/client/src/settings/CSpellSettings.ts#L78
    words = words.sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
    config.words = words;
  }

  const newWords = config.words;
  const removed = oldWords.filter((word) => !newWords.includes(word));
  if (removed.length > 0) {
    console.log(
      `${removed.length} words removed: \n${removed
        .map((word) => ` - ${word}`)
        .join("\n")}`
    );
  }
  const added = newWords.filter((word) => !oldWords.includes(word));
  if (added.length > 0) {
    console.log(
      `${added.length} words added: \n${added
        .map((word) => ` - ${word}`)
        .join("\n")}`
    );
  }

  console.log("Updating words ...");
  await updateConfig(config);

  console.log("Running spellcheck with new words ...");
  const subprocess = runSpellcheck();
  subprocess.stdout.pipe(process.stdout);
  await subprocess;

  console.log("CSpell config file updated.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
