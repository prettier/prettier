"use strict";

const crypto = require("crypto");
const fs = require("fs");

// Generates a hash of the input string.
function hash(data) {
  return crypto
    .createHash("sha1")
    .update(data)
    .digest("base64");
}

// Generates the cache key using the file path, options and the support info.
function calcKey(supportInfoHash, path, options) {
  return hash(path + supportInfoHash + JSON.stringify(options));
}

class ChangedCache {
  // Initializes the in-memory cache data from the configured location.
  // Also calculates the support info hash used to compute file keys.
  // A missing cache file is not treated as an error because it is expected on first run.
  constructor(location, context, supportInfo) {
    this.location = location;
    this.context = context;
    this.cache = {};
    this.supportInfoHash = hash(JSON.stringify(supportInfo));

    if (fs.existsSync(location)) {
      let contents;
      try {
        contents = fs.readFileSync(location);
      } catch (err) {
        context.logger.error(`Could not read cache file: ${err}`);
        return;
      }

      try {
        this.cache = JSON.parse(contents);
      } catch (err) {
        this.context.logger.error(`Could not parse cache contents: ${err}`);
      }
    }
  }

  // Writes the in-memory cache data to the configured file.
  // Previous file contents are overwritten.
  close() {
    let contents;
    try {
      contents = JSON.stringify(this.cache);
    } catch (err) {
      this.context.logger.error(`Could not serialize cache: ${err}`);
      return;
    }

    try {
      fs.writeFileSync(this.location, contents);
    } catch (err) {
      this.context.logger.error(`Could not write cache to file: ${err}`);
    }
  }

  // Checks if the last-modified time of the file path matches the in-memory data.
  // Defaults to true if an error occurs.
  hasChanged(path, options) {
    const stored = this.cache[calcKey(this.supportInfoHash, path, options)];
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
  update(path, options) {
    let changed;
    try {
      changed = fs.statSync(path).mtimeMs;
    } catch (err) {
      return;
    }

    this.cache[calcKey(this.supportInfoHash, path, options)] = changed;
  }
}

module.exports = ChangedCache;
