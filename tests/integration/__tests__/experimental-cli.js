import fs from "node:fs/promises";
import createEsmUtils from "esm-utils";

const { require } = createEsmUtils(import.meta);

function runExperimentalCli(args, options) {
  return runCli("cli/experimental-cli", [...args, "--no-cache"], {
    ...options,
    env: { ...options?.env, PRETTIER_EXPERIMENTAL_CLI: 1 },
  });
}

const code = 'console.log("Hello, world!");\n';
const unformatted = `
  console.log(
"Hello, world!"


  )
`;

describe("experimental cli", () => {
  const expectedVersion =
    process.env.NODE_ENV === "production"
      ? require("../../../package.json").version
      : require("../../../node_modules/prettier/package.json").version;

  runExperimentalCli(["--version"]).test({
    stderr: "",
    status: 0,
    write: [],
    stdout: expectedVersion,
  });

  runExperimentalCli(["--version", "--experimental-cli"]).test({
    stderr: "",
    status: 0,
    write: [],
    stdout: expectedVersion,
  });

  // Stdin format
  runExperimentalCli(["--parser=meriyah"], { input: "foo(   )" }).test({
    stderr: "",
    status: 0,
    write: [],
  });

  for (const [index, args] of [
    // File check
    ["--check"],
    // File format
    ["--write"],
  ]
    .flatMap((args) => [args, [...args, "--no-parallel"]])
    .entries()) {
    test(`'${args.join(" ")}'`, async () => {
      // Since we are not able to mock file write, so we just let the CLI actually write it
      const directory = new URL(
        `../cli/experimental-cli/test-${index}/`,
        import.meta.url,
      );
      const fileShouldNotFormat = new URL("./should-not-format.js", directory);
      const fileShouldFormat = new URL("./should-format.js", directory);
      await fs.rm(directory, { force: true, recursive: true });
      await fs.mkdir(directory);
      await fs.writeFile(fileShouldNotFormat, code);
      await fs.writeFile(fileShouldFormat, unformatted);

      const result = await runExperimentalCli([
        `./test-${index}`,
        ...args,
        "--ignore-path=do-not-ignore",
        "--no-cache",
      ]);

      {
        const content = await fs.readFile(fileShouldNotFormat, "utf8");
        expect(content).toBe(code);
      }
      {
        const content = await fs.readFile(fileShouldFormat, "utf8");
        expect(content).toBe(args.includes("--write") ? code : unformatted);
      }

      expect(result).toMatchSnapshot();
    });
  }
});
