// @ts-nocheck
// This file is generated automatically
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/temp-dir/index.js
var require_temp_dir = __commonJS({
  "node_modules/temp-dir/index.js"(exports, module2) {
    "use strict";
    var fs2 = require("fs");
    var os = require("os");
    var tempDirectorySymbol = Symbol.for("__RESOLVED_TEMP_DIRECTORY__");
    if (!global[tempDirectorySymbol]) {
      Object.defineProperty(global, tempDirectorySymbol, {
        value: fs2.realpathSync(os.tmpdir())
      });
    }
    module2.exports = global[tempDirectorySymbol];
  }
});

// node_modules/tempy/index.js
var tempy_exports = {};
__export(tempy_exports, {
  rootTemporaryDirectory: () => import_temp_dir2.default,
  temporaryDirectory: () => temporaryDirectory,
  temporaryDirectoryTask: () => temporaryDirectoryTask,
  temporaryFile: () => temporaryFile,
  temporaryFileTask: () => temporaryFileTask,
  temporaryWrite: () => temporaryWrite,
  temporaryWriteSync: () => temporaryWriteSync,
  temporaryWriteTask: () => temporaryWriteTask
});
module.exports = __toCommonJS(tempy_exports);
var import_node_fs = __toESM(require("fs"), 1);
var import_promises = __toESM(require("fs/promises"), 1);
var import_node_path = __toESM(require("path"), 1);
var import_node_stream = __toESM(require("stream"), 1);
var import_node_util = require("util");

// node_modules/crypto-random-string/index.js
var import_util = require("util");
var import_crypto = __toESM(require("crypto"), 1);
var randomBytesAsync = (0, import_util.promisify)(import_crypto.default.randomBytes);
var urlSafeCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~".split("");
var numericCharacters = "0123456789".split("");
var distinguishableCharacters = "CDEHKMPRTUWXY012458".split("");
var asciiPrintableCharacters = "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~".split("");
var alphanumericCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
var generateForCustomCharacters = (length, characters) => {
  const characterCount = characters.length;
  const maxValidSelector = Math.floor(65536 / characterCount) * characterCount - 1;
  const entropyLength = 2 * Math.ceil(1.1 * length);
  let string = "";
  let stringLength = 0;
  while (stringLength < length) {
    const entropy = import_crypto.default.randomBytes(entropyLength);
    let entropyPosition = 0;
    while (entropyPosition < entropyLength && stringLength < length) {
      const entropyValue = entropy.readUInt16LE(entropyPosition);
      entropyPosition += 2;
      if (entropyValue > maxValidSelector) {
        continue;
      }
      string += characters[entropyValue % characterCount];
      stringLength++;
    }
  }
  return string;
};
var generateForCustomCharactersAsync = async (length, characters) => {
  const characterCount = characters.length;
  const maxValidSelector = Math.floor(65536 / characterCount) * characterCount - 1;
  const entropyLength = 2 * Math.ceil(1.1 * length);
  let string = "";
  let stringLength = 0;
  while (stringLength < length) {
    const entropy = await randomBytesAsync(entropyLength);
    let entropyPosition = 0;
    while (entropyPosition < entropyLength && stringLength < length) {
      const entropyValue = entropy.readUInt16LE(entropyPosition);
      entropyPosition += 2;
      if (entropyValue > maxValidSelector) {
        continue;
      }
      string += characters[entropyValue % characterCount];
      stringLength++;
    }
  }
  return string;
};
var generateRandomBytes = (byteLength, type, length) => import_crypto.default.randomBytes(byteLength).toString(type).slice(0, length);
var generateRandomBytesAsync = async (byteLength, type, length) => {
  const buffer = await randomBytesAsync(byteLength);
  return buffer.toString(type).slice(0, length);
};
var allowedTypes = /* @__PURE__ */ new Set([
  void 0,
  "hex",
  "base64",
  "url-safe",
  "numeric",
  "distinguishable",
  "ascii-printable",
  "alphanumeric"
]);
var createGenerator = (generateForCustomCharacters2, generateRandomBytes2) => ({ length, type, characters }) => {
  if (!(length >= 0 && Number.isFinite(length))) {
    throw new TypeError("Expected a `length` to be a non-negative finite number");
  }
  if (type !== void 0 && characters !== void 0) {
    throw new TypeError("Expected either `type` or `characters`");
  }
  if (characters !== void 0 && typeof characters !== "string") {
    throw new TypeError("Expected `characters` to be string");
  }
  if (!allowedTypes.has(type)) {
    throw new TypeError(`Unknown type: ${type}`);
  }
  if (type === void 0 && characters === void 0) {
    type = "hex";
  }
  if (type === "hex" || type === void 0 && characters === void 0) {
    return generateRandomBytes2(Math.ceil(length * 0.5), "hex", length);
  }
  if (type === "base64") {
    return generateRandomBytes2(Math.ceil(length * 0.75), "base64", length);
  }
  if (type === "url-safe") {
    return generateForCustomCharacters2(length, urlSafeCharacters);
  }
  if (type === "numeric") {
    return generateForCustomCharacters2(length, numericCharacters);
  }
  if (type === "distinguishable") {
    return generateForCustomCharacters2(length, distinguishableCharacters);
  }
  if (type === "ascii-printable") {
    return generateForCustomCharacters2(length, asciiPrintableCharacters);
  }
  if (type === "alphanumeric") {
    return generateForCustomCharacters2(length, alphanumericCharacters);
  }
  if (characters.length === 0) {
    throw new TypeError("Expected `characters` string length to be greater than or equal to 1");
  }
  if (characters.length > 65536) {
    throw new TypeError("Expected `characters` string length to be less or equal to 65536");
  }
  return generateForCustomCharacters2(length, characters.split(""));
};
var cryptoRandomString = createGenerator(generateForCustomCharacters, generateRandomBytes);
cryptoRandomString.async = createGenerator(generateForCustomCharactersAsync, generateRandomBytesAsync);
var crypto_random_string_default = cryptoRandomString;

// node_modules/unique-string/index.js
function uniqueString() {
  return crypto_random_string_default({ length: 32 });
}

// node_modules/tempy/index.js
var import_temp_dir = __toESM(require_temp_dir(), 1);

// node_modules/is-stream/index.js
function isStream(stream2) {
  return stream2 !== null && typeof stream2 === "object" && typeof stream2.pipe === "function";
}

// node_modules/tempy/index.js
var import_temp_dir2 = __toESM(require_temp_dir(), 1);
var pipeline = (0, import_node_util.promisify)(import_node_stream.default.pipeline);
var getPath = (prefix = "") => import_node_path.default.join(import_temp_dir.default, prefix + uniqueString());
var writeStream = async (filePath, data) => pipeline(data, import_node_fs.default.createWriteStream(filePath));
async function runTask(temporaryPath, callback) {
  try {
    return await callback(temporaryPath);
  } finally {
    await import_promises.default.rm(temporaryPath, { recursive: true, force: true });
  }
}
function temporaryFile({ name, extension } = {}) {
  if (name) {
    if (extension !== void 0 && extension !== null) {
      throw new Error("The `name` and `extension` options are mutually exclusive");
    }
    return import_node_path.default.join(temporaryDirectory(), name);
  }
  return getPath() + (extension === void 0 || extension === null ? "" : "." + extension.replace(/^\./, ""));
}
var temporaryFileTask = async (callback, options) => runTask(temporaryFile(options), callback);
function temporaryDirectory({ prefix = "" } = {}) {
  const directory = getPath(prefix);
  import_node_fs.default.mkdirSync(directory);
  return directory;
}
var temporaryDirectoryTask = async (callback, options) => runTask(temporaryDirectory(options), callback);
async function temporaryWrite(fileContent, options) {
  const filename = temporaryFile(options);
  const write = isStream(fileContent) ? writeStream : import_promises.default.writeFile;
  await write(filename, fileContent);
  return filename;
}
var temporaryWriteTask = async (fileContent, callback, options) => runTask(await temporaryWrite(fileContent, options), callback);
function temporaryWriteSync(fileContent, options) {
  const filename = temporaryFile(options);
  import_node_fs.default.writeFileSync(filename, fileContent);
  return filename;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  rootTemporaryDirectory,
  temporaryDirectory,
  temporaryDirectoryTask,
  temporaryFile,
  temporaryFileTask,
  temporaryWrite,
  temporaryWriteSync,
  temporaryWriteTask
});
