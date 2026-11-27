const fs = require("node:fs/promises");
const path = require("node:path");

const [platform, code, syscall, failures] = JSON.parse(
  process.env.PRETTIER_TEST_WRITE_ERROR,
);
const writeFile = fs.writeFile;
let attempts = 0;

fs.writeFile = (file, ...args) => {
  if (
    path.basename(file) === "mapped.ts" &&
    attempts++ < (failures ?? Infinity)
  ) {
    Object.defineProperty(process, "platform", { value: platform });
    const description =
      code === "UNKNOWN" ? "unknown error" : "permission denied";
    return Promise.reject(
      Object.assign(
        new Error(`${code}: ${description}, ${syscall} '${file}'`),
        {
          code,
          syscall,
          path: file,
        },
      ),
    );
  }
  return writeFile(file, ...args);
};
