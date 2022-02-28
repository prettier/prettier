const NODE_PROTOCOL = "node:";

export default function esbuildPluginStripNodeProtocol() {
  return {
    name: "strip-node-protocol",
    setup(build) {
      build.onResolve({ filter: /./ }, ({ path }) => {
        if (!path.startsWith(NODE_PROTOCOL)) {
          return;
        }

        return build.resolve(path.slice(NODE_PROTOCOL.length));
      });
    },
  };
}
