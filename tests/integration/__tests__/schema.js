import prettier from "prettier-local";
import generateSchema from "../../../scripts/utils/generate-schema.mjs";

test("schema", () => {
  expect(generateSchema(prettier.getSupportInfo().options)).toMatchSnapshot();
});
