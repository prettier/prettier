// `singleDollarTextMath` is off so `$FOO` / `$BAR` stay ordinary text
// (issue #20135). Genuine TeX still uses `$...$`, and with the option off
// CommonMark then treats `*` / `_` inside those spans as emphasis, so
// `$\alpha^*$` is reprinted as `$\alpha^_$` and a subscript `_` inside
// `**...**` is escaped. Spans that contain a backslash and no code span
// are the TeX that 3.9.8 left untouched; lift just those back to
// `inlineMath`, which prints the original source.

const TEX_SPAN = /(?<!\$)\$(?![\t\n $])[^$\n`]*\\[^$\n`]*\$(?!\$)/g;

const REWRITE_PARENTS = new Set([
  "paragraph",
  "heading",
  "tableCell",
  "emphasis",
  "strong",
  "delete",
  "link",
  "linkReference",
]);

const ATOMIC = new Set([
  "inlineCode",
  "code",
  "html",
  "math",
  "inlineMath",
  "image",
  "imageReference",
  "break",
  "liquidNode",
  "wikiLink",
  "footnoteReference",
  "esComment",
]);

/**
 * @param {any} ast
 * @param {string} source
 */
function preserveSingleDollarTex(ast, source) {
  rewrite(ast, source);
}

/**
 * @param {any} node
 * @param {string} source
 */
function rewrite(node, source) {
  if (!node?.children) {
    return;
  }

  for (const child of node.children) {
    rewrite(child, source);
  }

  if (!REWRITE_PARENTS.has(node.type) || node.children.length === 0) {
    return;
  }

  const first = node.children[0];
  const last = node.children.at(-1);
  if (!first.position || !last.position) {
    return;
  }

  const regionStart = first.position.start.offset;
  const regionEnd = last.position.end.offset;
  const spans = findTexSpans(
    source.slice(regionStart, regionEnd),
    regionStart,
  ).filter(
    (span) =>
      !isEscaped(source, span.start) &&
      coveredByChildren(node, span) &&
      !overlapsAtomic(node, span) &&
      !alreadyInlineMath(node, span),
  );

  if (spans.length === 0) {
    return;
  }

  /** @type {any[]} */
  const nextChildren = [];
  let cursor = regionStart;

  for (const span of spans) {
    if (span.start < cursor) {
      continue;
    }
    if (span.start > cursor) {
      nextChildren.push(
        ...extractRange(node.children, cursor, span.start, source),
      );
    }
    nextChildren.push(makeInlineMath(source, span.start, span.end));
    cursor = span.end;
  }

  if (cursor < regionEnd) {
    nextChildren.push(
      ...extractRange(node.children, cursor, regionEnd, source),
    );
  }

  node.children = nextChildren;
}

/**
 * @param {string} source
 * @param {number} base
 */
function findTexSpans(source, base) {
  return Array.from(source.matchAll(TEX_SPAN), (match) => ({
    start: base + match.index,
    end: base + match.index + match[0].length,
  }));
}

/**
 * Opening `$` escaped with a backslash is not a math delimiter.
 * @param {string} source
 * @param {number} index
 */
function isEscaped(source, index) {
  let slashes = 0;
  for (
    let cursor = index - 1;
    cursor >= 0 && source[cursor] === "\\";
    cursor--
  ) {
    slashes++;
  }
  return slashes % 2 === 1;
}

/**
 * @param {any} node
 * @param {{start: number, end: number}} span
 */
function coveredByChildren(node, span) {
  let cursor = span.start;
  const children = node.children
    .filter((child) => child.position)
    .toSorted((a, b) => a.position.start.offset - b.position.start.offset);

  for (const child of children) {
    const start = child.position.start.offset;
    const end = child.position.end.offset;
    if (end <= cursor) {
      continue;
    }
    if (start > cursor) {
      return false;
    }
    cursor = Math.max(cursor, end);
    if (cursor >= span.end) {
      return true;
    }
  }

  return cursor >= span.end;
}

/**
 * @param {any} node
 * @param {{start: number, end: number}} span
 */
function overlapsAtomic(node, span) {
  if (!node?.position) {
    return false;
  }

  const start = node.position.start.offset;
  const end = node.position.end.offset;
  if (!(start < span.end && end > span.start)) {
    return false;
  }

  if (ATOMIC.has(node.type)) {
    return true;
  }

  if (!node.children?.length) {
    return false;
  }

  return node.children.some((child) => overlapsAtomic(child, span));
}

/**
 * @param {any} node
 * @param {{start: number, end: number}} span
 */
function alreadyInlineMath(node, span) {
  if (!node?.position) {
    return false;
  }

  if (
    node.type === "inlineMath" &&
    node.position.start.offset === span.start &&
    node.position.end.offset === span.end
  ) {
    return true;
  }

  return (node.children || []).some((child) => alreadyInlineMath(child, span));
}

/**
 * Keep children wholly inside [from, to). A child that crosses the boundary
 * was split by a `*` inside the TeX span; print the original text instead.
 * @param {any[]} children
 * @param {number} from
 * @param {number} to
 * @param {string} source
 */
function extractRange(children, from, to, source) {
  if (from >= to) {
    return [];
  }

  /** @type {any[]} */
  const contained = [];
  let straddles = false;

  for (const child of children) {
    if (!child.position) {
      continue;
    }
    const start = child.position.start.offset;
    const end = child.position.end.offset;
    if (end <= from || start >= to) {
      continue;
    }
    if (start < from || end > to) {
      straddles = true;
      continue;
    }
    contained.push(child);
  }

  if (straddles) {
    return [makeText(source, from, to)];
  }

  return contained;
}

/**
 * @param {string} source
 * @param {number} start
 * @param {number} end
 */
function makeText(source, start, end) {
  return {
    type: "text",
    value: source.slice(start, end),
    position: {
      start: offsetToPoint(source, start),
      end: offsetToPoint(source, end),
    },
  };
}

/**
 * @param {string} source
 * @param {number} start
 * @param {number} end
 */
function makeInlineMath(source, start, end) {
  return {
    type: "inlineMath",
    value: source.slice(start + 1, end - 1),
    position: {
      start: offsetToPoint(source, start),
      end: offsetToPoint(source, end),
    },
  };
}

/**
 * @param {string} source
 * @param {number} offset
 */
function offsetToPoint(source, offset) {
  let line = 1;
  let column = 1;
  for (let index = 0; index < offset && index < source.length; index++) {
    if (source.charCodeAt(index) === 10) {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return { line, column, offset };
}

export { preserveSingleDollarTex };
