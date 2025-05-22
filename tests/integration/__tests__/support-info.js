import prettier from "../../config/prettier-entry.js";

test("API getSupportInfo()", async () => {
  expect(await getCoreInfo()).toMatchSnapshot();
});

describe("CLI --support-info", () => {
  runCli("cli", "--support-info").test({ status: 0 });
});

async function getCoreInfo() {
  const supportInfo = await prettier.getSupportInfo();
  const languages = Object.fromEntries(
    supportInfo.languages.map(({ name, parsers }) => [name, parsers]),
  );

  const options = Object.fromEntries(
    supportInfo.options.map((option) => [
      option.name,
      {
        type: option.type,
        default: option.default,
        ...(option.type === "int"
          ? { range: option.range }
          : option.type === "choice"
            ? { choices: option.choices.map((choice) => choice.value) }
            : null),
      },
    ]),
  );

  return { languages, options };
}
