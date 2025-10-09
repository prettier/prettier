import createGetVisitorKeys from "../utils/create-get-visitor-keys.js";
import visitorKeys from "./visitor-keys.js";

const getVisitorKeys = createGetVisitorKeys(visitorKeys, "sassType");

export default getVisitorKeys;
