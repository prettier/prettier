const { flatten } = require("lodash");

const urls = [
  "http://www.example.com:80/_a",
  "http://www.example.com:80/_a_",
  "http://www.example.com:80/_a__",
  "http://www.example.com:80/_a_b",
  "http://www.example.com:80/_a_/",
  "http://www.example.com:80/_a_/_",
  "http://www.example.com:80/*a",
  "http://www.example.com:80/*a*",
  "http://www.example.com:80/*a**",
  "http://www.example.com:80/*a*b",
  "http://www.example.com:80/*a*/",
  "http://www.example.com:80/*a*/*",
  "http://www.example.com:80/_a*",
  "http://www.example.com:80/_a_*",
  "http://www.example.com:80/_a*b",
  "http://www.example.com:80/_a*/",
  "http://www.example.com:80/_a_/*",
];

const brokenTests = new Set([
  // v2.0.5 broken cases, fixed in #8140
  // "*http://www.example.com:80/_a_*",
  // "*http://www.example.com:80/_a_ *",
  // "*http://www.example.com:80/_a__*",
  // "*http://www.example.com:80/_a_/*",
  // "*http://www.example.com:80/_a_/ *",
  // "*http://www.example.com:80/_a_/_*",
  // "*http://www.example.com:80/_a_/_ *",
  // "*http://www.example.com:80/_a_* *",
  // "*http://www.example.com:80/_a_/* *",

  // #8140 broken cases
  "_http://www.example.com:80/*a_",
  "_http://www.example.com:80/*a _",
  "_http://www.example.com:80/*a*_",
  "_http://www.example.com:80/*a* _",
  "_http://www.example.com:80/*a**_",
  "_http://www.example.com:80/*a** _",
  "_http://www.example.com:80/*a*b_",
  "_http://www.example.com:80/*a*b _",
  "_http://www.example.com:80/*a*/_",
  "_http://www.example.com:80/*a*/ _",
  "_http://www.example.com:80/*a*/*_",
  "_http://www.example.com:80/*a*/* _",
  "_http://www.example.com:80/_a*_",
  "_http://www.example.com:80/_a* _",
  "_http://www.example.com:80/_a*b_",
  "_http://www.example.com:80/_a*b _",
  "_http://www.example.com:80/_a*/_",
  "_http://www.example.com:80/_a*/ _",
]);

run_spec(
  {
    dirname: __dirname,
    snippets: flatten(
      urls.map((url) => [
        url,
        `_${url}_`,
        `*${url}*`,
        `_${url}*`,
        `_ ${url}_`,
        `* ${url}*`,
        `_ ${url}*`,
        `_${url} _`,
        `*${url} *`,
        `_${url} *`,
        `_ ${url} _`,
        `* ${url} *`,
        `_ ${url} *`,
      ])
    )
      .filter((code) => !brokenTests.has(code))
      .map((code) => ({ code, name: code })),
  },
  ["markdown"]
);
