import prettier from "../../config/prettier-entry.js";
import generateSchema from "../../../scripts/utils/generate-schema.mjs";

test("schema", async () => {
  const { options } = await prettier.getSupportInfo();
  const schema = generateSchema(options);

  expect(schema).toMatchSnapshot();
});
