import { runYarn } from "../utilities.js";

const lintFiles = () => runYarn("lint");

export default lintFiles;
