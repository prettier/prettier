import toFastProperties from "to-fast-properties";
import throwOnMissingVisitorKeys from "../../utils/throw-on-missing-visitor-keys.js"
import visitorKeys from "./visitor-keys.evaluate.js";

toFastProperties(visitorKeys);

export default throwOnMissingVisitorKeys((node) => visitorKeys[node.type]);
