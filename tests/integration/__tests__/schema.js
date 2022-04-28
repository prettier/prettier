
import prettier from "../../config/prettier-entry.js";
import generateSchema from "../../../scripts/utils/generate-schema.mjs";

test("schema", () => {
  expect(generateSchema(prettier.getSupportInfo().options)).toMatchSnapshot();
});
