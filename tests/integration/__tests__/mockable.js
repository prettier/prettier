import url from "node:url";
import { prettierCliMockableEntry } from "../env.js";

async function getCliMockable() {
  const cli = await import(url.pathToFileURL(prettierCliMockableEntry));
  return cli.mockable;
}

test("isCI", async () => {
  const mockable = await getCliMockable();
  expect(typeof mockable.implementations.isCI()).toBe("boolean");
});
