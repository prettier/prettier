/*
Add these modules here, so we can mock during test
*/

import { cosmiconfig } from "cosmiconfig";
import { sync as findParentDir } from "find-parent-dir";
import getStdin from "get-stdin";
import { isCI } from "ci-info";

const thirdParty = {
  cosmiconfig,
  findParentDir,
  getStdin,
  isCI: () => isCI,
};

export default thirdParty;
