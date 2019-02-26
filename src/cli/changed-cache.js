"use strict";

const crypto = require("crypto");
const fs = require("fs");

const location = process.env.PRETTIER_CACHE_LOCATION || ".prettiercache";

let cache = {};
let supportInfoHash = "";

// Generates a hash of the input string.
function hash(data) {
  return crypto
    .createHash("sha1")
    .update(data)
    .digest("base64");
}

// Generates the cache key using the file path, options and the support info.
function calcKey(path, options) {
  return hash(path + supportInfoHash + JSON.stringify(options));
}

// Overwrites the in-memory cache data from the configured location.
// Also calculates the support info hash used to compute file keys.
// Missing file is not treated as an error because it is expected on first run.
// Errors in file reading or parsing will not touch the in-memory data.
function open(context, supportInfo) {
  supportInfoHash = hash(JSON.stringify(supportInfo));

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
function hasChanged(path, options) {
  const stored = cache[calcKey(path, options)];
  if (stored === undefined) {
    return true;
  }

  let changed;
  try {
    changed = fs.statSync(path).mtimeMs;
  } catch (err) {
    return true;
  }

  return stored !== changed;
}

// Updates the last-modified time of the file path in the in-memory data.
// Value is not changed if an error occurs.
function update(path, options) {
  let changed;
  try {
    changed = fs.statSync(path).mtimeMs;
  } catch (err) {
    return;
  }

  cache[calcKey(path, options)] = changed;
}

module.exports = {
  close,
  hasChanged,
  open,
  update
};
