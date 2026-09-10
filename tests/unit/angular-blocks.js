import "../../src/language-html/parse/parse.js";

import { SUPPORTED_ANGULAR_BLOCKS } from "angular-html-parser";

// Snapshot to notify changes (includes blocks Prettier registers on parse)
test("angular blocks", () => {
  expect(SUPPORTED_ANGULAR_BLOCKS).toMatchSnapshot();
});
