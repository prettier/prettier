import createPathSerializer from "./create-path-serializer.js";

export default createPathSerializer({
  replacements: new Map([
    [new URL("./cli/", import.meta.url), "<cli>/"],
    [new URL("./plugins/", import.meta.url), "<plugins>/"],
  ]),
});
