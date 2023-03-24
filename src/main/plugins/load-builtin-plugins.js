let builtinPlugins;

async function loadBuiltinPlugins() {
  builtinPlugins ??= await Promise.all([
    import("../../plugins/estree.js"),
    import("../../plugins/babel.js"),
    import("../../plugins/flow.js"),
    import("../../plugins/typescript.js"),
    import("../../plugins/acorn.js"),
    import("../../plugins/meriyah.js"),
    import("../../plugins/angular.js"),
    import("../../plugins/postcss.js"),
    import("../../plugins/graphql.js"),
    import("../../plugins/markdown.js"),
    import("../../plugins/glimmer.js"),
    import("../../plugins/html.js"),
    import("../../plugins/yaml.js"),
  ]);

  return builtinPlugins;
}

export default loadBuiltinPlugins;
