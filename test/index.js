const fs = require("fs");
const { join } = require("path");
const glob = require("glob");

const jscodefmt = require("../");

glob("./fixtures/**/*.js", function(err, files) {
  if(err) { throw err };
  runFixtureTests(files.filter(file => !file.includes(".expected.js")));
});

function runFixtureTests(files) {
  files.forEach(file => {
    const expectedFile = file.replace(/\.js$/, ".expected.js");
    const src = fs.readFileSync(file);
    const formatted = jscodefmt.format(src, { printWidth: 60 });

    if(fs.existsSync(expectedFile)) {
      const expected = fs.readFileSync(expectedFile, "utf8");

      if(formatted !== expected) {
        throw new Error("Failure: " + file + "\n" + formatted + "\ndoes not equal\n" + expected);
      }
    }
    else {
      fs.writeFileSync(expectedFile, formatted, "utf8");
    }
  });
}
