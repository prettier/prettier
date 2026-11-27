import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prettierCliEntry } from "../env.js";

const preload = fileURLToPath(
  new URL("../cli/write/mock-write-error.cjs", import.meta.url),
);
const unformatted = "const a={b:1}\n";
const formatted = "const a = { b: 1 };\n";

test.each([
  [
    "retries a transient Windows UNKNOWN open error",
    "win32",
    "UNKNOWN",
    "open",
    2,
    0,
  ],
  [
    "reports a persistent Windows UNKNOWN open error",
    "win32",
    "UNKNOWN",
    "open",
    null,
    2,
  ],
  [
    "does not retry a Windows EACCES open error",
    "win32",
    "EACCES",
    "open",
    1,
    2,
  ],
  [
    "does not retry a Windows UNKNOWN write error",
    "win32",
    "UNKNOWN",
    "write",
    1,
    2,
  ],
  [
    "does not retry a Linux UNKNOWN open error",
    "linux",
    "UNKNOWN",
    "open",
    1,
    2,
  ],
])("--write %s", (_, platform, code, syscall, failures, expectedStatus) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "prettier-write-"));
  const file = path.join(directory, "mapped.ts");
  const sibling = path.join(directory, "sibling.ts");
  try {
    fs.writeFileSync(file, unformatted);
    fs.writeFileSync(sibling, unformatted);
    const { error, status, stderr } = spawnSync(
      process.execPath,
      [
        "--require",
        preload,
        prettierCliEntry,
        "--no-config",
        "--write",
        "mapped.ts",
        "sibling.ts",
      ],
      {
        cwd: directory,
        encoding: "utf8",
        env: {
          ...process.env,
          NO_COLOR: "1",
          PRETTIER_EXPERIMENTAL_CLI: "",
          PRETTIER_TEST_WRITE_ERROR: JSON.stringify([
            platform,
            code,
            syscall,
            failures,
          ]),
        },
        timeout: 10_000,
      },
    );
    if (error) {
      throw error;
    }

    expect({
      status,
      stderr,
      content: fs.readFileSync(file, "utf8"),
      siblingContent: fs.readFileSync(sibling, "utf8"),
    }).toStrictEqual({
      status: expectedStatus,
      stderr:
        expectedStatus === 0
          ? ""
          : expect.stringContaining(
              `[error] Unable to write file "mapped.ts":\n[error] ${code}:`,
            ),
      content: expectedStatus === 0 ? formatted : unformatted,
      siblingContent: formatted,
    });
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
