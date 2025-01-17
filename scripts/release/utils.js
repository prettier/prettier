import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import url from "node:url";
import { execa } from "execa";
import styleText from "node-style-text";
import outdent from "outdent";
import getFormattedDate from "./get-formatted-date.js";

readline.emitKeypressEvents(process.stdin);

const statusConfig = [
  { color: "bgGreen", text: "DONE" },
  { color: "bgRed", text: "FAIL" },
  { color: "bgGray", text: "SKIPPED" },
];
const maxLength = Math.max(...statusConfig.map(({ text }) => text.length)) + 2;
const padStatusText = (text) => {
  while (text.length < maxLength) {
    text = text.length % 2 ? `${text} ` : ` ${text}`;
  }
  return text;
};
const status = {};
for (const { color, text } of statusConfig) {
  status[text] = styleText[color].black(padStatusText(text));
}

function fitTerminal(input, suffix = "") {
  const columns = Math.min(process.stdout.columns || 40, 80);
  const WIDTH = columns - maxLength + 1;
  if (input.length < WIDTH) {
    const repeatCount = Math.max(WIDTH - input.length - 1 - suffix.length, 0);
    input += styleText.dim(".").repeat(repeatCount) + suffix;
  }
  return input;
}

async function logPromise(name, promiseOrAsyncFunction, shouldSkip = false) {
  process.stdout.write(fitTerminal(name));

  if (shouldSkip) {
    process.stdout.write(`${status.SKIPPED}\n`);
    return;
  }

  try {
    const result = await (typeof promiseOrAsyncFunction === "function"
      ? promiseOrAsyncFunction()
      : promiseOrAsyncFunction);
    process.stdout.write(`${status.DONE}\n`);
    return result;
  } catch (error) {
    process.stdout.write(`${status.FAIL}\n`);
    throw error;
  }
}

async function runYarn(args, options) {
  args = Array.isArray(args) ? args : [args];

  try {
    return await execa("yarn", [...args], options);
  } catch (error) {
    throw new Error(`\`yarn ${args.join(" ")}\` failed\n${error.stdout}`);
  }
}

function runGit(args, options) {
  args = Array.isArray(args) ? args : [args];
  return execa("git", args, options);
}

function waitForEnter() {
  console.log();
  console.log(styleText.gray("Press ENTER to continue."));

  process.stdin.setRawMode(true);

  return new Promise((resolve, reject) => {
    process.stdin.on("keypress", listener);
    process.stdin.resume();

    function listener(ch, key) {
      if (key.name === "return") {
        process.stdin.setRawMode(false);
        process.stdin.removeListener("keypress", listener);
        process.stdin.pause();
        resolve();
      } else if (key.ctrl && key.name === "c") {
        reject(new Error("Process terminated by the user"));
      }
    }
  });
}

function readJson(filename) {
  return JSON.parse(fs.readFileSync(filename));
}

function writeJson(file, content) {
  writeFile(file, JSON.stringify(content, null, 2) + "\n");
}

const toPath = (urlOrPath) =>
  urlOrPath instanceof URL ? url.fileURLToPath(urlOrPath) : urlOrPath;
function writeFile(file, content) {
  try {
    fs.mkdirSync(path.dirname(toPath(file)), { recursive: true });
  } catch {
    // noop
  }

  fs.writeFileSync(file, content);
}

function processFile(filename, fn) {
  const content = fs.readFileSync(filename, "utf8");
  fs.writeFileSync(filename, fn(content));
}

async function fetchText(url) {
  const response = await fetch(url);
  return response.text();
}

function getBlogPostInfo(version) {
  const { year, month, day } = getFormattedDate();

  return {
    file: `website/blog/${year}-${month}-${day}-${version}.md`,
    path: `blog/${year}/${month}/${day}/${version}.html`,
  };
}

function getChangelogContent({ version, previousVersion, body }) {
  return outdent`
    [diff](https://github.com/prettier/prettier/compare/${previousVersion}...${version})

    ${body}
  `;
}

export {
  fetchText,
  getBlogPostInfo,
  getChangelogContent,
  logPromise,
  processFile,
  readJson,
  runGit,
  runYarn,
  waitForEnter,
  writeFile,
  writeJson,
};
