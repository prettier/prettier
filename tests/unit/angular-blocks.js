import { SUPPORTED_ANGULAR_BLOCKS } from "angular-html-parser";

// Snapshot to notify changes
test("angular blocks", () => {
  expect(SUPPORTED_ANGULAR_BLOCKS).toMatchSnapshot();
});
