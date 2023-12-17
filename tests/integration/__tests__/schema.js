import generateSchema from "../../../scripts/utils/generate-schema.js";
import prettier from "../../config/prettier-entry.js";

test("schema", async () => {
  const { options } = await prettier.getSupportInfo();
  const schema = generateSchema(options);

  expect(schema).toMatchSnapshot();
});
