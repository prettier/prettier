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

test("does not add blank lines to AngularJS one-time bindings (#13226)", async () => {
  const input = [
    "<div>",
    "({{:: aaaaaaaaaaaaaaaaaaaa.bbbbbbbbbbbbbbbbbbbb.cccccccccccccccccccc.dddddddddddddddddddd }})",
    "</div>",
  ].join("\n");

  const options = {
    parser: "angular",
    embeddedLanguageFormatting: "off",
  };

  const { output: first } = await format(input, options);
  const { output: second } = await format(first, options);
  const { output: third } = await format(second, options);

  expect(first).toContain("{{::");
  expect(second).toBe(first);
  expect(third).toBe(first);
});
