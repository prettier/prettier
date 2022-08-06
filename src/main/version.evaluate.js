import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { version } = require("../../package.json");

export default version;
