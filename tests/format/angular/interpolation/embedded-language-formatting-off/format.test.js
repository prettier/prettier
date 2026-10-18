import { format } from "../../../../config/format-test/run-prettier.js";

runFormatTest(import.meta, ["angular"], { embeddedLanguageFormatting: "off" });

test("does not add blank lines on repeated formatting (#17428)", async () => {
  const input = [
    "(there is no {{`",
    "${activityType === '' ? 'activity' : ''}",
    "${activityType === '' && costCenter === '' ? ' or ' : ''}",
    "${costCenter === '' ? 'cost center' : ''}",
    "`}})",
  ].join("");

  const options = {
    parser: "angular",
    embeddedLanguageFormatting: "off",
  };

  const { output: first } = await format(input, options);
  const { output: second } = await format(first, options);
  const { output: third } = await format(second, options);

  expect(second).toBe(first);
  expect(third).toBe(first);
});
