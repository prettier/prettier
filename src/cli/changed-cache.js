"use strict";

const crypto = require("crypto");

// Generates a hash of the input string.
function hash(data) {
  return crypto
    .createHash("sha1")
    .update(data)
    .digest("base64");
}

// Generates the cache key using the file path, options and the support info hash.
function calcKey(path, options, supportInfoHash) {
  return hash(path + JSON.stringify(options) + supportInfoHash);
}

class ChangedCache {
  // Initializes the in-memory cache data from the configured location.
  // Also calculates the static support info hash used to compute file keys.
  // A missing cache file is not treated as an error because it is expected on first run.
  constructor(options) {
    this.location = options.location;
    this.readFile = options.readFile;
    this.writeFile = options.writeFile;
    this.context = options.context;
    this.supportInfoHash = hash(JSON.stringify(options.supportInfo));

    this.cache = {};

    let contents;
    try {
      contents = this.readFile(this.location, "utf8");
    } catch (err) {
      if (err.code !== "ENOENT") {
        this.context.logger.error(`Could not read cache file: ${err}`);
      }
      return;
    }

    try {
      this.cache = JSON.parse(contents);
    } catch (err) {
      this.context.logger.error(`Could not parse cache contents: ${err}`);
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
      this.writeFile(this.location, contents, "utf8");
    } catch (err) {
      this.context.logger.error(`Could not write cache to file: ${err}`);
    }
  }

  // Checks if the expected contents of the file path match the in-memory data.
  notChanged(path, options, content) {
    return (
      this.cache[calcKey(path, options, this.supportInfoHash)] === hash(content)
    );
  }

  // Updates the expected contents of the file path in the in-memory data.
  update(path, options, content) {
    this.cache[calcKey(path, options, this.supportInfoHash)] = hash(content);
  }
}

module.exports = ChangedCache;
