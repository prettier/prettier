export default function esbuildPluginStripNodeProtocol() {
  return {
    name: "strip-node-protocol",
    setup(build) {
      build.onResolve({ filter: /^node:/ }, ({ path, kind }) =>
        build.resolve(path.slice(5), { kind }),
      );
    },
  };
}
