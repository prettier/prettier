function stringify(value) {
  if (
    value !== null &&
    !["boolean", "number", "string", "undefined"].includes(typeof value)
  ) {
    throw Object.assign(new TypeError("value not allowed"), { value });
  }

  return value === undefined ? "undefined" : JSON.stringify(value);
}

/*
Non-primitive value will cause esbuild inject a function call in every file
only primitive values are allowed to use.
*/
export default function esbuildPluginPrimitiveDefine(define) {
  return {
    name: "primitive-define",
    setup(build) {
      const esbuildConfig = build.initialOptions;
      if (esbuildConfig.define) {
        throw new Error(
          "Use `esbuildPluginPrimitiveDefine(define)` instead of 'define' option",
        );
      }

      esbuildConfig.define = Object.fromEntries(
        Object.entries(define).map(([key, value]) => [key, stringify(value)]),
      );
    },
  };
}
