const urls = [
  "https://www.example.com:80/_a",
  "https://www.example.com:80/_a_",
  "https://www.example.com:80/_a__",
  "https://www.example.com:80/_a_b",
  "https://www.example.com:80/_a_/",
  "https://www.example.com:80/_a_/_",
  "https://www.example.com:80/*a",
  "https://www.example.com:80/*a*",
  "https://www.example.com:80/*a**",
  "https://www.example.com:80/*a*b",
  "https://www.example.com:80/*a*/",
  "https://www.example.com:80/*a*/*",
  "https://www.example.com:80/_a*",
  "https://www.example.com:80/_a_*",
  "https://www.example.com:80/_a*b",
  "https://www.example.com:80/_a*/",
  "https://www.example.com:80/_a_/*",
];

const wrappers = [
  (url) => url,

  (url) => `_${url}_`,
  (url) => `*${url}*`,
  (url) => `_${url}*`,
  (url) => `*${url}_`,
  // (url) => `__${url}__`,
  // (url) => `**${url}**`,
  // (url) => `*_${url}_*`,
  // (url) => `_*${url}*_`,
  // (url) => `*_${url}*_`,
  // (url) => `_*${url}_*`,

  (url) => `_ ${url}_`,
  (url) => `* ${url}*`,
  (url) => `_ ${url}*`,
  (url) => `* ${url}_`,
  // (url) => `__ ${url}__`,
  // (url) => `** ${url}**`,
  // (url) => `*_ ${url}_*`,
  // (url) => `_* ${url}*_`,
  // (url) => `*_ ${url}*_`,
  // (url) => `_* ${url}_*`,

  (url) => `_${url} _`,
  (url) => `*${url} *`,
  (url) => `_${url} *`,
  (url) => `*${url} _`,
  // (url) => `__${url} __`,
  // (url) => `**${url} **`,
  // (url) => `*_${url} _*`,
  // (url) => `_*${url} *_`,
  // (url) => `*_${url} *_`,
  // (url) => `_*${url} _*`,

  (url) => `_ ${url} _`,
  (url) => `* ${url} *`,
  (url) => `_ ${url} *`,
  (url) => `* ${url} _`,
  // (url) => `__ ${url} __`,
  // (url) => `** ${url} **`,
  // (url) => `*_ ${url} _*`,
  // (url) => `_* ${url} *_`,
  // (url) => `*_ ${url} *_`,
  // (url) => `_* ${url} _*`,
];

const cases = urls.flatMap((url) => wrappers.map((fn) => fn(url)));

runFormatTest(
  {
    importMeta: import.meta,
    snippets: cases.map((code) => ({ code, name: code })),
  },
  ["markdown"],
);
