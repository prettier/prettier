import createPathSerializer from "./create-path-serializer.js";

export default createPathSerializer({
  replacements: {
    [process.cwd()]: "<cwd>",
  },
});
