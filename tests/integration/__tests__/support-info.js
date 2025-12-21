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
    supportInfo.options.map((rawOption) => {
      const option = {
        type: rawOption.type,
        default: rawOption.default,
      };

      if (rawOption.type === "int") {
        option.range = rawOption.range;
      } else if (rawOption.type === "choice") {
        option.choices = rawOption.choices.map((choice) => choice.value);
      }

      return [rawOption.name, option];
    }),
  );

  return { languages, options };
}
