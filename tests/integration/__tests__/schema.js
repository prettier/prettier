import prettier from "prettier-local";
import generateSchema from "../../../scripts/utils/generate-schema.js";

test("schema", () => {
  expect(generateSchema(prettier.getSupportInfo().options)).toMatchSnapshot();
});
