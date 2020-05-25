const urls = [
  "http://www.example.com:80/_a",
  "http://www.example.com:80/_a_",
  "http://www.example.com:80/_a__",
  "http://www.example.com:80/_a_b",
  "http://www.example.com:80/_a_/",
  "http://www.example.com:80/_a_/_",
];

run_spec(
  {
    dirname: __dirname,
    snippets: [
      ...urls,
      ...urls.map((url) => `_${url}_`),
      ...urls.map((url) => `*${url}*`),
      ...urls.map((url) => `_${url}*`),
    ],
  },
  ["markdown"]
);
