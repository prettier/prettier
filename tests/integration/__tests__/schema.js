import { generateSchemaData } from "../../../scripts/utils/generate-schema.js";
import prettier from "../../config/prettier-entry.js";

test("schema", async () => {
  const { options } = await prettier.getSupportInfo();
  const schema = generateSchemaData(options);

  expect(schema).toMatchSnapshot();
});
