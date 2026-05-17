import fs from "node:fs/promises";

// `.js` files are ignored in `.gitignore`
const files = [
  "ignored-by-customignore.js",
  "ignored-by-gitignore.js",
  "ignored-by-prettierignore.js",
].map(
  (file) =>
    new URL(`../cli/ignore-path/ignore-path-test/${file}`, import.meta.url),
);
const ignoredDirectory = new URL(
  "../cli/ignore-path/ignore-path-test/ignored-directory/",
  import.meta.url,
);
const clean = () =>
  Promise.all([
    ...files.map((file) => fs.rm(file, { force: true })),
    fs.rm(ignoredDirectory, { force: true, recursive: true }),
  ]);
const setup = async () => {
  await Promise.all(files.map((file) => fs.writeFile(file, "   a+   b")));
  await fs.mkdir(new URL("nested/", ignoredDirectory), { recursive: true });
  await fs.writeFile(
    new URL("nested/unformatted.js", ignoredDirectory),
    "   a+   b",
  );
};

beforeAll(async () => {
  await clean();
  await setup();
});
afterAll(clean);

const getUnformattedFiles = async (args) => {
  const { stdout } = await runCli("cli/ignore-path/ignore-path-test/", [
    "**/*.js",
    "-l",
    ...args,
  ]);
  return stdout ? stdout.split("\n").sort() : [];
};

test("custom ignore path", async () => {
  expect(
    await getUnformattedFiles(["--ignore-path", ".customignore"]),
  ).toStrictEqual([
    "ignored-by-gitignore.js",
    "ignored-by-prettierignore.js",
    "ignored-directory/nested/unformatted.js",
  ]);
});

test("ignore files by .prettierignore and .gitignore by default", async () => {
  expect(
    await getUnformattedFiles(["--ignore-path", ".non-exists-ignore-file"]),
  ).toStrictEqual([
    "ignored-by-customignore.js",
    "ignored-by-gitignore.js",
    "ignored-by-prettierignore.js",
    "ignored-directory/nested/unformatted.js",
  ]);
  expect(await getUnformattedFiles([])).toStrictEqual([]);
});

runCli(
  "cli/ignore-path/ignore-path-test/",
  ["ignored-directory/**/*.js", "-l"],
  {
    title: "ignored directory-only matches do not report unmatched pattern",
  },
).test({
  status: 0,
  stderr: "",
  stdout: "",
  write: [],
});

describe("ignore file when using --debug-check", () => {
  runCli("cli/ignore-path/ignore-path-test/", [
    "**/*.js",
    "--debug-check",
    "--ignore-path",
    ".prettierignore",
  ]).test({
    status: 0,
    stderr: "",
    stdout: ["ignored-by-customignore.js", "ignored-by-gitignore.js"].join(
      "\n",
    ),
    write: [],
  });
});

test("multiple `--ignore-path`", async () => {
  expect(
    await getUnformattedFiles([
      "--ignore-path",
      ".customignore",
      "--ignore-path",
      ".prettierignore",
      "--ignore-path",
      ".non-exists-ignore-file",
    ]),
  ).toStrictEqual(["ignored-by-gitignore.js"]);
});
