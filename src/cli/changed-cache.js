"use strict";

const fs = require("fs");

const location = process.env.PRETTIER_CACHE_LOCATION || ".prettiercache";
let cache = {};

// Overwrites the in-memory cache data from the configured location.
// Missing file is not treated as an error because it is expected on first run.
// Errors in file reading or parsing will not touch the in-memory data.
function open(context) {
  if (fs.existsSync(location)) {
    let contents;
    try {
      contents = fs.readFileSync(location);
    } catch (err) {
      context.logger.error(`Could not read cache file: ${err}`);
      return;
    }

    try {
      cache = JSON.parse(contents);
    } catch (err) {
      context.logger.error(`Could not parse cache contents: ${err}`);
    }
  }
}

// Writes the in-memory cache data to the configured file.
// Previous file contents are overwritten.
function close(context) {
  let contents;
  try {
    contents = JSON.stringify(cache);
  } catch (err) {
    context.logger.error(`Could serialize cache: ${err}`);
    return;
  }

  try {
    fs.writeFileSync(location, contents);
  } catch (err) {
    context.logger.error(`Could not write cache to file: ${err}`);
  }
}

// Checks if the last-modified time of the file path matches the in-memory data.
// Defaults to true if an error occurs.
function hasChanged(path) {
  let changed;
  try {
    changed = fs.statSync(path).mtimeMs;
  } catch (err) {
    return true;
  }

  // TODO account for config/options changes
  return cache[path] !== changed;
}

// Updates the last-modified time of the file path in the in-memory data.
// Value is not changed if an error occurs.
function update(path) {
  let changed;
  try {
    changed = fs.statSync(path).mtimeMs;
  } catch (err) {
    return;
  }

  // TODO account for config/options changes
  cache[path] = changed;
}

module.exports = {
  close,
  hasChanged,
  open,
  update
};
