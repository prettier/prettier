import { format } from "../../../config/format-test/run-prettier.js";

runFormatTest(import.meta, ["typescript"], { trailingComma: "none" });
runFormatTest(import.meta, ["typescript"], { trailingComma: "es5" });

test.each(["babel", "typescript"])(
  "formats Angular control flow in explicitly marked template literals (%s)",
  async (parser) => {
    const input = [
      "const template = /* Angular */ `",
      "  <div>",
      "    @if(first){<span>Hello {{name}}</span>}@else if(second){<span>Second</span>}@else{<span>Fallback</span>}",
      "    @if(third){<span>Third</span>}",
      "  </div>",
      "`;",
    ].join("\n");

    const options = { parser };
    const { output } = await format(input, options);
    const { output: repeated } = await format(output, options);

    expect(output).toContain("@if (first) {");
    expect(output).toContain("} @else if (second) {");
    expect(output).toContain("} @else {");
    expect(output).toContain("{{ name }}");
    expect(output).toMatch(/@if \(first\) \{\n\s+<span>Hello/);
    expect(repeated).toBe(output);
  },
);

test("preserves embedded JavaScript expressions", async () => {
  const input = [
    "const template = /* Angular */ `",
    "@if (visible) {",
    "  <span>${value}</span>",
    "}",
    "`;",
  ].join("\n");

  const { output } = await format(input, { parser: "babel" });

  expect(output).toContain("${value}");
  expect(output).toContain("@if (visible) {");
  expect((await format(output, { parser: "babel" })).output).toBe(output);
});

test("preserves HTML and unmarked template formatting", async () => {
  const options = { parser: "typescript" };
  const html = "const t = /* HTML */ `<DIV>@if(x){<SPAN>Hi</SPAN>}</DIV>`;";
  const unmarked = "const t = `<DIV>@if(x){<SPAN>Hi</SPAN>}</DIV>`;";

  const { output: htmlOutput } = await format(html, options);
  const { output: unmarkedOutput } = await format(unmarked, options);

  expect(htmlOutput).toContain("<div>");
  expect(htmlOutput).toContain("@if(x)");
  expect(unmarkedOutput).toContain("<DIV>@if(x){<SPAN>Hi</SPAN>}</DIV>");
});
