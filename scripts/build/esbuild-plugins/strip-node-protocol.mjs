export default function esbuildPluginStripNodeProtocol({ target }) {
  return {
    name: "strip-node-protocol",
    setup(build) {
      build.onResolve({ filter: /^node:/ }, ({ path }) =>
        target === "universal"
          ? { external: true, path }
          : build.resolve(path.slice(5))
      );
    },
  };
}
