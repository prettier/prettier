const flat = require("lodash/flatten");

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

run_spec(
  {
    dirname: __dirname,
    snippets: flat(
      urls.map((url) => [
        url,

        `_${url}_`,
        `*${url}*`,
        `_${url}*`,
        `*${url}_`,

        `_ ${url}_`,
        `* ${url}*`,
        `_ ${url}*`,
        `* ${url}_`,

        `_${url} _`,
        `*${url} *`,
        `_${url} *`,
        `*${url} _`,

        `_ ${url} _`,
        `* ${url} *`,
        `_ ${url} *`,
        `* ${url} _`,
      ])
    ).map((code) => ({ code, name: code })),
  },
  ["markdown"]
);
