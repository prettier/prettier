import prettier from "../../config/prettier-entry.js";

const angularTemplate = "`<div>@if(ready){<span>{{name}}</span>}</div>`";
const storybookImport = 'import { Meta } from "@storybook/angular";';

const format = (source, parser) => prettier.format(source, { parser });

test.each(["babel", "typescript"])(
  "formats a Storybook CSF render template with %s",
  async (parser) => {
    const source = `
${storybookImport}
export const Default = {
  render: (args) => ({
    props: args,
    template: ${angularTemplate},
  }),
};
`;
    const formatted = await format(source, parser);

    expect(formatted).toContain("@if (ready)");
    expect(formatted).toContain("{{ name }}");
    expect(await format(formatted, parser)).toBe(formatted);
  },
);

test("formats templates returned from a block-bodied render arrow", async () => {
  const source = `
${storybookImport}
export const Default = {
  render: () => {
    return { template: ${angularTemplate} };
  },
};
`;
  const formatted = await format(source, "typescript");

  expect(formatted).toContain("@if (ready)");
  expect(formatted).toContain("{{ name }}");
  expect(await format(formatted, "typescript")).toBe(formatted);
});

test("ignores render templates in non-Angular Storybook modules", async () => {
  const source = `
import { Meta } from "@storybook/react";
export const Default = {
  render: () => ({ template: ${angularTemplate} }),
};
`;
  const formatted = await format(source, "typescript");

  expect(formatted).toContain("@if(ready)");
  expect(formatted).toContain("{{name}}");
});

test("does not format unrelated template properties in Storybook modules", async () => {
  const source = `
${storybookImport}
const config = { template: ${angularTemplate} };
export const Default = { render: () => ({ props: config }) };
`;
  const formatted = await format(source, "typescript");

  expect(formatted).toContain("@if(ready)");
  expect(formatted).toContain("{{name}}");
});

test("keeps Angular component template formatting", async () => {
  const source = `
@Component({
  template: ${angularTemplate},
})
class Example {}
`;
  const formatted = await format(source, "typescript");

  expect(formatted).toContain("@if (ready)");
  expect(formatted).toContain("{{ name }}");
});
