import fs from "node:fs";
import path from "node:path";

import createEsmUtils from "esm-utils";

import { projectRoot } from "../env.js";
import jestPathSerializer from "../path-serializer.js";

const { __dirname } = createEsmUtils(import.meta);

expect.addSnapshotSerializer(jestPathSerializer);

const runCliWithoutGitignore = (dir, args, options) =>
  runCli(dir, [...args, "--ignore-path", ".prettierignore"], options);

// ESLint-like behavior
//
// https://github.com/prettier/prettier/pull/6639#issuecomment-548949954
//
// Since 3.0: https://github.com/prettier/prettier/pull/15155#issuecomment-1723654981
//
// 1. `prettier dir1 dir2` – prettify all files with supported extensions inside `dir1` and `dir2`.
//
// 2. `prettier dir1 "dir2/**/*"` – prettify all files with supported extensions inside `dir1`
//     as well as all files matched by the `dir2/**/*` glob.
//     Unsupported files are ignored as with `--ignore-unknown`.
//
// 3. `prettier non-exists-dir "dir2/**/*""` – log an error that `non-exists-dir` resulted in 0 files
//     and prettify all files matched by the `dir2/**/*` glob.
//     Unsupported files are ignored as with `--ignore-unknown`.
//     (Note: ESLint just prints an error and doesn't process anything.)
//
// 4. `prettier . "dir2/**/*"` – prettify all files with supported extensions in `.`
//     and all files matched by the `dir2/**/*` glob.
//     Unsupported files are ignored as with `--ignore-unknown`.
//
// (*) That error ("No parser could be inferred for file") doesn't affect the error code.

testPatterns("1", ["dir1", "dir2"]);
testPatterns("1a - with *.foo plugin", [
  "dir1",
  "dir2",
  "--plugin=../../plugins/extensions/plugin.cjs",
]);
testPatterns("1b - special characters in dir name", ["dir1", "!dir"], {
  stdout: expect.stringMatching(/!dir[/\\]a\.js/),
});
testPatterns("1c", ["dir1", "empty"], { status: 1 });

testPatterns("2", ["dir1", "dir2/**/*"], { status: 1 });

testPatterns("3", ["nonexistent-dir", "dir2/**/*"], { status: 2 });

testPatterns("4", [".", "dir2/**/*"], { status: 1 });

describe("Trailing slash", () => {
  testPatterns("1", ["./"], { status: 1, stderr: "" });
  testPatterns("2", [".//"], { status: 1, stderr: "" });
  testPatterns("3", ["dir1/"], { status: 1, stderr: "" });
  testPatterns("4", ["dir1//"], { status: 1, stderr: "" });
  testPatterns("5", [".//dir2/..//./dir1//"], { status: 1, stderr: "" });
  testPatterns(
    "run in sub dir 1",
    [".."],
    { status: 1, stderr: "" },
    "cli/patterns-dirs/dir2",
  );
  testPatterns(
    "run in sub dir 2",
    ["../"],
    { status: 1, stderr: "" },
    "cli/patterns-dirs/dir2",
  );
  testPatterns(
    "run in sub dir 3",
    ["../dir1"],
    { status: 1, stderr: "" },
    "cli/patterns-dirs/dir2",
  );
  testPatterns(
    "run in sub dir 4",
    ["../dir1/"],
    { status: 1, stderr: "" },
    "cli/patterns-dirs/dir2",
  );
});

describe("Negative patterns", () => {
  testPatterns("1", ["dir1", "!dir1/nested1"]);
  testPatterns("1a", ["dir1", "!dir1/nested1/*"]);
  testPatterns("2", [".", "!dir1/nested1"]);
  testPatterns("3", [".", "!dir1/nested1/an1.js"]);
  testPatterns("4", ["!nonexistent-dir1 !nonexistent-dir2"], { status: 2 });
  testPatterns("with explicit files", ["dir1/a1.js", "dir2/a2.js", "!dir1/*"], {
    status: 2,
  });
});

testPatterns("Exclude yarn.lock when expanding directories", ["."], {
  stdout: expect.not.stringContaining("yarn.lock"),
});

const uppercaseRocksPlugin = path.join(
  projectRoot,
  "tests/config/prettier-plugins/prettier-plugin-uppercase-rocks/index.js",
);
describe("plugins `.`", () => {
  runCliWithoutGitignore("cli/dirs/plugins", [
    ".",
    "-l",
    "--plugin",
    uppercaseRocksPlugin,
  ]).test({
    write: [],
    stderr: "",
    status: 1,
  });
});
describe("plugins `*`", () => {
  runCliWithoutGitignore("cli/dirs/plugins", [
    "*",
    "-l",
    "--plugin",
    uppercaseRocksPlugin,
  ]).test({
    write: [],
    status: 1,
  });
});

if (path.sep === "/") {
  // Don't use snapshots in these tests as they're conditionally executed on non-Windows only.

  const base = path.resolve(__dirname, "../cli/patterns-dirs");

  describe("Backslashes in names", () => {
    // We can't commit these dirs without causing problems on Windows.

    beforeAll(() => {
      fs.mkdirSync(path.resolve(base, "test-a\\"));
      fs.writeFileSync(path.resolve(base, "test-a\\", "test.js"), "x");
      fs.mkdirSync(path.resolve(base, String.raw`test-b\?`));
      fs.writeFileSync(
        path.resolve(base, String.raw`test-b\?`, "test.js"),
        "x",
      );
    });

    afterAll(() => {
      fs.unlinkSync(path.resolve(base, "test-a\\", "test.js"));
      fs.rmdirSync(path.resolve(base, "test-a\\"));
      fs.unlinkSync(path.resolve(base, String.raw`test-b\?`, "test.js"));
      fs.rmdirSync(path.resolve(base, String.raw`test-b\?`));
    });

    testPatterns("", [String.raw`test-a\/test.js`], {
      stdout: String.raw`test-a\/test.js`,
    });
    testPatterns("", ["test-a\\"], { stdout: String.raw`test-a\/test.js` });
    testPatterns("", ["test-a*/*"], { stdout: String.raw`test-a\/test.js` });

    testPatterns("", [String.raw`test-b\?/test.js`], {
      stdout: String.raw`test-b\?/test.js`,
    });
    testPatterns("", [String.raw`test-b\?`], {
      stdout: String.raw`test-b\?/test.js`,
    });
    testPatterns("", ["test-b*/*"], { stdout: String.raw`test-b\?/test.js` });
  });
}

function isSymlinkSupported() {
  if (process.platform !== "win32") {
    return true;
  }

  const target = path.join(
    __dirname,
    "../cli/patterns-symlinks/test-symlink-feature-detect",
  );
  fs.rmSync(target, { force: true, recursive: true });
  fs.mkdirSync(target);
  const symlink = path.join(target, "symlink");
  try {
    fs.symlinkSync(target, symlink);
  } catch {
    return false;
  }
  return fs.lstatSync(symlink).isSymbolicLink();
}

(isSymlinkSupported() ? describe : describe.skip)("Ignore symlinks", () => {
  const base = path.join(__dirname, "../cli/patterns-symlinks");
  const directoryA = path.join(base, "test-a");
  const directoryB = path.join(base, "test-b");
  const clean = () => {
    fs.rmSync(directoryA, { force: true, recursive: true });
    fs.rmSync(directoryB, { force: true, recursive: true });
  };
  beforeAll(() => {
    clean();
    fs.mkdirSync(directoryA);
    fs.mkdirSync(directoryB);
    fs.writeFileSync(path.join(directoryA, "a.js"), "x");
    fs.writeFileSync(path.join(directoryB, "b.js"), "x");
    fs.symlinkSync(directoryA, path.join(directoryA, "symlink-to-directory-a"));
    fs.symlinkSync(directoryB, path.join(directoryA, "symlink-to-directory-b"));
    fs.symlinkSync(
      path.join(directoryA, "a.js"),
      path.join(directoryA, "symlink-to-file-a"),
    );
    fs.symlinkSync(
      path.join(directoryB, "b.js"),
      path.join(directoryA, "symlink-to-file-b"),
    );
  });
  afterAll(clean);

  test("file struct", async () => {
    const getFileStruct = async (directory) =>
      (await fs.promises.readdir(directory, { withFileTypes: true }))
        .map((dirent) => ({
          name: dirent.name,
          isSymbolicLink: dirent.isSymbolicLink(),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

    expect(await getFileStruct(directoryA)).toMatchInlineSnapshot(`
      [
        {
          "isSymbolicLink": false,
          "name": "a.js",
        },
        {
          "isSymbolicLink": true,
          "name": "symlink-to-directory-a",
        },
        {
          "isSymbolicLink": true,
          "name": "symlink-to-directory-b",
        },
        {
          "isSymbolicLink": true,
          "name": "symlink-to-file-a",
        },
        {
          "isSymbolicLink": true,
          "name": "symlink-to-file-b",
        },
      ]
    `);
    expect(await getFileStruct(directoryB)).toMatchInlineSnapshot(`
      [
        {
          "isSymbolicLink": false,
          "name": "b.js",
        },
      ]
    `);
  });

  testPatterns("", ["test-a/*"], { stdout: "test-a/a.js" }, base);
  testPatterns(
    "",
    ["test-a/symlink-to-directory-a"],
    {
      status: 2,
      stdout: "",
      stderr:
        '[error] Explicitly specified pattern "test-a/symlink-to-directory-a" is a symbolic link.',
    },
    base,
  );
  testPatterns(
    "",
    ["test-a/symlink-to-directory-b"],
    {
      status: 2,
      stdout: "",
      stderr:
        '[error] Explicitly specified pattern "test-a/symlink-to-directory-b" is a symbolic link.',
    },
    base,
  );
  testPatterns(
    "",
    ["test-a/symlink-to-file-a"],
    {
      status: 2,
      stdout: "",
      stderr:
        '[error] Explicitly specified pattern "test-a/symlink-to-file-a" is a symbolic link.',
    },
    base,
  );
  testPatterns(
    "",
    ["test-a/symlink-to-file-b"],
    {
      status: 2,
      stdout: "",
      stderr:
        '[error] Explicitly specified pattern "test-a/symlink-to-file-b" is a symbolic link.',
    },
    base,
  );
  testPatterns(
    "",
    ["test-a/symlink-*"],
    {
      status: 2,
      stdout: "",
      stderr:
        '[error] No files matching the pattern were found: "test-a/symlink-*".',
    },
    base,
  );
  testPatterns(
    "",
    ["test-a/*", "test-a/symlink-to-file-b"],
    {
      status: 2,
      stdout: "test-a/a.js",
      stderr:
        '[error] Explicitly specified pattern "test-a/symlink-to-file-b" is a symbolic link.',
    },
    base,
  );
  testPatterns(
    "",
    ["test-a/symlink-to-directory-b/*"],
    { stdout: "test-a/symlink-to-directory-b/b.js" },
    base,
  );

  testPatterns(
    "",
    [
      "test-a/symlink-to-file-b",
      "--no-error-on-unmatched-pattern",
      "--log-level",
      "debug",
    ],
    {
      status: 0,
      stdout: "",
      stderr:
        '[debug] normalized argv: {"":["test-a/symlink-to-file-b"],"cache":false,"color":true,"editorconfig":true,"errorOnUnmatchedPattern":false,"logLevel":"debug","ignorePath":[".prettierignore"],"configPrecedence":"cli-override","debugRepeat":0,"plugins":[],"listDifferent":true,"_":["test-a/symlink-to-file-b"],"__raw":{"_":["test-a/symlink-to-file-b"],"cache":false,"color":true,"editorconfig":true,"error-on-unmatched-pattern":false,"l":true,"log-level":"debug","ignore-path":".prettierignore","config-precedence":"cli-override","debug-repeat":0,"plugin":[]}}' +
        "\n" +
        '[debug] Skipping pattern "test-a/symlink-to-file-b", as it is a symbolic link.',
    },
    base,
  );
});

function testPatterns(
  namePrefix,
  cliArgs,
  expected = {},
  cwd = "cli/patterns-dirs",
) {
  const testName =
    (namePrefix ? namePrefix + ": " : "") +
    "prettier " +
    cliArgs
      .map((arg) => (/^[\w./=-]+$/.test(arg) ? arg : `'${arg}'`))
      .join(" ");

  describe(testName, () => {
    runCliWithoutGitignore(cwd, [...cliArgs, "-l"]).test({
      write: [],
      ...(!("status" in expected) && { stderr: "", status: 1 }),
      ...expected,
    });
  });
}
