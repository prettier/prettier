// Copied from https://github.com/helmetjs/content-security-policy-parser/blob/main/mod.ts

const ASCII_WHITESPACE_CHARS = "\t\n\f\r ";
const ASCII_WHITESPACE = new RegExp(`[${ASCII_WHITESPACE_CHARS}]+`, "u");
const ASCII_WHITESPACE_AT_START = new RegExp(`^[${ASCII_WHITESPACE_CHARS}]+`, "u");
const ASCII_WHITESPACE_AT_END = new RegExp(`[${ASCII_WHITESPACE_CHARS}]+$`, "u");

// eslint-disable-next-line no-control-regex
const ASCII = /^[\x00-\x7f]*$/u;

export default function parseContentSecurityPolicy(
  policy,
) {
  const result = [];

  for (let token of policy.split(";")) {
    token = token
      .replace(ASCII_WHITESPACE_AT_START, "")
      .replace(ASCII_WHITESPACE_AT_END, "");

    if (!token || !ASCII.test(token)) {
      continue;
    }

    const [rawDirectiveName, ...directiveValue] = token.split(ASCII_WHITESPACE);
    const directiveName = rawDirectiveName.toLowerCase();

    result.push({ name: directiveName, value: directiveValue });
  }

  return result;
}
