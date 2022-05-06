export default function esbuildPluginStripNodeProtocol() {
  return {
    name: "strip-node-protocol",
    setup(build) {
      build.onResolve({ filter: /^node:/ }, ({ path }) =>
        build.resolve(path.slice(5))
      );
    },
  };
}
