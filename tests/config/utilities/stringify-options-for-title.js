function stringifyOptions(options) {
  const string = JSON.stringify(options || {}, (key, value) => {
    if (key === "plugins" || key === "errors") {
      return;
    }

    if (value === Number.POSITIVE_INFINITY) {
      return "Infinity";
    }

    return value;
  });

  return string === "{}" ? "" : string;
}

export default stringifyOptions;
