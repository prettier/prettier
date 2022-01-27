import fs from "node:fs/promises";
import { visualizer as esbuildVisualizer } from "esbuild-visualizer/dist/plugin/index.js";

export default function esbuildPluginVisualizer() {
  return {
    name: "visualizer",
    setup(build) {
      const { initialOptions: esbuildConfig } = build;
      esbuildConfig.metafile = true;

      build.onEnd(async ({ metafile }) => {
        const files = Object.keys(metafile.outputs);

        if (files.length !== 1) {
          throw new Error("Unexpected `outputs`.");
        }

        const html = await esbuildVisualizer(metafile, {
          title: files[0],
        });

        await fs.writeFile(`${esbuildConfig.outfile}.report.html`, html);
      });
    },
  };
}
