import prettier from "../../config/prettier-entry.js";
import createPlugin from "../../config/utils/create-plugin.cjs";

test("plugins can override builtin plugins", async () => {
  const outputWithoutPlugin = await prettier.format("foo()", {
    parser: "babel",
  });
  const outputWithPlugin = await prettier.format("foo()", {
    parser: "babel",
    plugins: [
      createPlugin({ name: "babel", print: () => "fake-babel-output" }),
    ],
  });

  expect(outputWithoutPlugin).not.toBe(outputWithPlugin);
  expect(outputWithPlugin).toBe("fake-babel-output\n");
});
