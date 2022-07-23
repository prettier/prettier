import rollupPluginLicense from "rollup-plugin-license";

export default function esbuildPluginLicense(options) {
  const plugin = rollupPluginLicense(options);

  return {
    name: "license",

    setup(build) {
      build.initialOptions.metafile = true;

      build.onEnd((result) => {
        if (result.errors.length > 0) {
          return;
        }

        const files = Object.keys(result.metafile.inputs);
        const chunk = {
          modules: Object.fromEntries(
            files.map((file) => [file, { renderedLength: 1 }])
          ),
        };
        plugin.renderChunk("", chunk);
        plugin.generateBundle();
      });
    },
  };
}
