const path = require("path");

run_spec(__dirname, ["markdown"], { proseWrap: "always" });

run_spec(path.join(__dirname, "long"), ["markdown"], {
  proseWrap: "never"
});
