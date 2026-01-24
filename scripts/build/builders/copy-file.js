import path from "node:path";
import { copyFile } from "../../utilities/index.js";

const copyFileBuilder = ({ packageConfig, file }) =>
  copyFile(
    path.isAbsolute(file.input)
      ? file.input
      : path.join(packageConfig.sourceDirectory, file.input),
    path.join(packageConfig.distDirectory, file.output),
  );

export { copyFileBuilder };
