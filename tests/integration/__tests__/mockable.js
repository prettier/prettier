import prettier from "../../config/prettier-entry.js";

const { mockable } = prettier.__debug;

test("isCI", () => {
  expect(typeof mockable.isCI()).toBe("boolean");
});
