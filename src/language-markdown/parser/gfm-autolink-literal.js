// Based on `mdast-util-gfm-autolink-literal` (MIT):
// https://github.com/syntax-tree/mdast-util-gfm-autolink-literal/blob/ba83f42e2d6e7bafbb213b2bf94ec533891a6d82/lib/index.js
// Vendored to keep behavior stable and add position preservation for fallback transforms.

/**
 * @import {RegExpMatchObject, ReplaceFunction} from 'mdast-util-find-and-replace'
 * @import {CompileContext, Extension as FromMarkdownExtension, Handle as FromMarkdownHandle, Transform as FromMarkdownTransform} from 'mdast-util-from-markdown'
 * @import {ConstructName, Options as ToMarkdownExtension} from 'mdast-util-to-markdown'
 * @import {Link, PhrasingContent} from 'mdast'
 */

import { ccount } from "ccount";
import { ok as assert } from "devlop";
import { findAndReplace } from "mdast-util-find-and-replace";
import {
  unicodePunctuation,
  unicodeWhitespace,
} from "micromark-util-character";

/** @type {ConstructName} */
const inConstruct = "phrasing";
/** @type {Array<ConstructName>} */
const notInConstruct = ["autolink", "link", "image", "label"];

/**
 * Create an extension for `mdast-util-from-markdown` to enable GFM autolink
 * literals in markdown.
 *
 * @returns {FromMarkdownExtension}
 *   Extension for `mdast-util-to-markdown` to enable GFM autolink literals.
 */
export function gfmAutolinkLiteralFromMarkdown() {
  return {
    transforms: [transformGfmAutolinkLiterals],
    enter: {
      literalAutolink: enterLiteralAutolink,
      literalAutolinkEmail: enterLiteralAutolinkValue,
      literalAutolinkHttp: enterLiteralAutolinkValue,
      literalAutolinkWww: enterLiteralAutolinkValue,
    },
    exit: {
      literalAutolink: exitLiteralAutolink,
      literalAutolinkEmail: exitLiteralAutolinkEmail,
      literalAutolinkHttp: exitLiteralAutolinkHttp,
      literalAutolinkWww: exitLiteralAutolinkWww,
    },
  };
}

/**
 * Create an extension for `mdast-util-to-markdown` to enable GFM autolink
 * literals in markdown.
 *
 * @returns {ToMarkdownExtension}
 *   Extension for `mdast-util-to-markdown` to enable GFM autolink literals.
 */
export function gfmAutolinkLiteralToMarkdown() {
  return {
    unsafe: [
      {
        character: "@",
        before: String.raw`[+\-.\w]`,
        after: String.raw`[\-.\w]`,
        inConstruct,
        notInConstruct,
      },
      {
        character: ".",
        before: "[Ww]",
        after: String.raw`[\-.\w]`,
        inConstruct,
        notInConstruct,
      },
      {
        character: ":",
        before: "[ps]",
        after: String.raw`\/`,
        inConstruct,
        notInConstruct,
      },
    ],
  };
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function enterLiteralAutolink(token) {
  this.enter({ type: "link", title: null, url: "", children: [] }, token);
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function enterLiteralAutolinkValue(token) {
  this.config.enter.autolinkProtocol.call(this, token);
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function exitLiteralAutolinkHttp(token) {
  this.config.exit.autolinkProtocol.call(this, token);
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function exitLiteralAutolinkWww(token) {
  this.config.exit.data.call(this, token);
  const node = this.stack.at(-1);
  assert(node.type === "link");
  node.url = "http://" + this.sliceSerialize(token);
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function exitLiteralAutolinkEmail(token) {
  this.config.exit.autolinkEmail.call(this, token);
}

/**
 * @this {CompileContext}
 * @type {FromMarkdownHandle}
 */
function exitLiteralAutolink(token) {
  this.exit(token);
}

/** @type {FromMarkdownTransform} */
function transformGfmAutolinkLiterals(tree) {
  findAndReplace(
    tree,
    [
      [/(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/gi, findUrl],
      [
        /(?<=^|[\s\p{Punctuation}\p{Symbol}])([-.\w+]+)@([-\w]+(?:\.[-\w]+)+)/gu,
        findEmail,
      ],
    ],
    { ignore: ["link", "linkReference"] },
  );
}

/**
 * @type {ReplaceFunction}
 * @param {string} _
 * @param {string} protocol
 * @param {string} domain
 * @param {string} path
 * @param {RegExpMatchObject} match
 * @returns {Array<PhrasingContent> | Link | false}
 */

function findUrl(_, protocol, domain, path, match) {
  let prefix = "";

  // Not an expected previous character.
  if (!previous(match)) {
    return false;
  }

  // Treat `www` as part of the domain.
  if (/^w/i.test(protocol)) {
    domain = protocol + domain;
    protocol = "";
    prefix = "http://";
  }

  if (!isCorrectDomain(domain)) {
    return false;
  }

  const parts = splitUrl(domain + path);

  if (!parts[0]) {
    return false;
  }

  /** @type {Link} */
  const result = {
    type: "link",
    title: null,
    url: prefix + protocol + parts[0],
    children: [{ type: "text", value: protocol + parts[0] }],
  };

  if (parts[1]) {
    return [result, { type: "text", value: parts[1] }];
  }

  return result;
}

/**
 * @type {ReplaceFunction}
 * @param {string} _
 * @param {string} atext
 * @param {string} label
 * @param {RegExpMatchObject} match
 * @returns {Link | false}
 */
function findEmail(_, atext, label, match) {
  if (
    // Not an expected previous character.
    !previous(match, true) ||
    // Label ends in not allowed character.
    /[-\d_]$/.test(label)
  ) {
    return false;
  }

  return {
    type: "link",
    title: null,
    url: "mailto:" + atext + "@" + label,
    children: [{ type: "text", value: atext + "@" + label }],
  };
}

/**
 * @param {string} domain
 * @returns {boolean}
 */
function isCorrectDomain(domain) {
  const parts = domain.split(".");

  if (
    parts.length < 2 ||
    (parts.at(-1) &&
      (/_/.test(parts.at(-1)) || !/[a-z\d]/i.test(parts.at(-1)))) ||
    (parts.at(-2) && (/_/.test(parts.at(-2)) || !/[a-z\d]/i.test(parts.at(-2))))
  ) {
    return false;
  }

  return true;
}

/**
 * @param {string} url
 * @returns {[string, string | undefined]}
 */
function splitUrl(url) {
  const trailExec = /[!"&'),.:;<>?\]}]+$/.exec(url);

  if (!trailExec) {
    return [url, undefined];
  }

  url = url.slice(0, trailExec.index);

  let trail = trailExec[0];
  let closingParenIndex = trail.indexOf(")");
  const openingParens = ccount(url, "(");
  let closingParens = ccount(url, ")");

  while (closingParenIndex !== -1 && openingParens > closingParens) {
    url += trail.slice(0, closingParenIndex + 1);
    trail = trail.slice(closingParenIndex + 1);
    closingParenIndex = trail.indexOf(")");
    closingParens++;
  }

  return [url, trail];
}

/**
 * @param {RegExpMatchObject} match
 * @param {boolean | null | undefined} [email=false]
 * @returns {boolean}
 */
function previous(match, email) {
  const code = match.input.charCodeAt(match.index - 1);

  return (
    (match.index === 0 ||
      unicodeWhitespace(code) ||
      unicodePunctuation(code)) &&
    // If it’s an email, the previous character should not be a slash.
    (!email || code !== 47)
  );
}
