import { pathToFileURL } from "node:url";
import { mockable } from "../env.js";

test("isCI", async () => {
  const {
    default: { isCI },
  } = await import(pathToFileURL(mockable));
  expect(typeof isCI()).toBe("boolean");
});
