import vm from "node:vm";
import fs from "node:fs";

function createSandBox({ files }) {
  const source = files.map((file) => fs.readFileSync(file, "utf8")).join(";");
  const sandbox = vm.createContext();

  vm.runInContext(source, sandbox);

  return sandbox;
}

export default createSandBox;
