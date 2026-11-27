import prettier from "../../config/prettier-entry.js";

function rangeOf(text, snippet, fromIndex = 0) {
  const start = text.indexOf(snippet, fromIndex);
  if (start === -1) {
    throw new Error(`Snippet not found: ${snippet}`);
  }
  return [start, start + snippet.length];
}

function createAttribute(text, keyText, valueText, fromIndex = 0) {
  const keyRange = rangeOf(text, keyText, fromIndex);
  const valueRange = rangeOf(text, valueText, keyRange[1]);
  return {
    type: "ImportAttribute",
    key: {
      type: "Identifier",
      name: keyText,
      range: keyRange,
    },
    value: {
      type: "Literal",
      value: JSON.parse(valueText),
      raw: valueText,
      range: valueRange,
    },
    range: [keyRange[0], valueRange[1]],
  };
}

function createAmbientModuleProgram(
  text,
  idRaw,
  {
    attributes,
    bodyStatements = [],
    bodyStartOffset,
    comments,
    hasBody = true,
  } = {},
) {
  const idRange = rangeOf(text, idRaw);
  let body = null;
  if (hasBody) {
    const bodyRange = rangeOf(
      text,
      "{",
      bodyStartOffset ?? attributes?.at(-1)?.range[1] ?? idRange[1],
    );
    body = {
      type: "TSModuleBlock",
      body: bodyStatements,
      range: [bodyRange[0], text.length],
    };
  }

  return {
    type: "Program",
    sourceType: "module",
    range: [0, text.length],
    ...(comments ? { comments } : {}),
    body: [
      {
        type: "TSModuleDeclaration",
        kind: "module",
        declare: true,
        id: {
          type: "Literal",
          value: JSON.parse(idRaw),
          raw: idRaw,
          range: idRange,
        },
        ...(attributes !== undefined ? { attributes } : {}),
        body,
        range: [0, text.length],
      },
    ],
  };
}

function formatWithCustomParser(code, buildAst, options = {}) {
  const plugin = {
    parsers: {
      "ts-ambient-module-attributes": {
        astFormat: "estree",
        locStart: (node) => node.range[0],
        locEnd: (node) => node.range[1],
        parse: buildAst,
      },
    },
  };

  return prettier.format(code, {
    plugins: [plugin],
    parser: "ts-ambient-module-attributes",
    ...options,
  });
}

describe("TypeScript ambient module declaration import attributes", () => {
  test("prints `with` import attributes on ambient module declarations", async () => {
    const code = 'declare module "*.txt" with { type: "text" } {}';
    const result = await formatWithCustomParser(code, (text) => {
      const idRange = rangeOf(text, '"*.txt"');
      return createAmbientModuleProgram(text, '"*.txt"', {
        attributes: [createAttribute(text, "type", '"text"', idRange[1])],
      });
    });

    expect(result).toBe('declare module "*.txt" with { type: "text" } {}\n');
  });

  test("preserves `assert` keyword when used in source", async () => {
    const code = 'declare module "*.json" assert { type: "json" } {}';
    const result = await formatWithCustomParser(code, (text) => {
      const idRange = rangeOf(text, '"*.json"');
      return createAmbientModuleProgram(text, '"*.json"', {
        attributes: [createAttribute(text, "type", '"json"', idRange[1])],
      });
    });

    expect(result).toBe('declare module "*.json" assert { type: "json" } {}\n');
  });

  test("collapses multiline single type attribute to a single line", async () => {
    const code = [
      'declare module "*.txt" with {',
      '  type: "text",',
      "} {}",
    ].join("\n");

    const result = await formatWithCustomParser(
      code,
      (text) => {
        const idRange = rangeOf(text, '"*.txt"');
        return createAmbientModuleProgram(text, '"*.txt"', {
          attributes: [createAttribute(text, "type", '"text"', idRange[1])],
        });
      },
      { objectWrap: "preserve" },
    );

    expect(result).toBe('declare module "*.txt" with { type: "text" } {}\n');
  });

  test("wraps multiple attributes and supports comments inside attributes", async () => {
    const code = [
      'declare module "*.json" with {',
      '  /* kind */ type: "json",',
      '  integrity: "sha384-abc",',
      "} {}",
    ].join("\n");

    const result = await formatWithCustomParser(code, (text) => {
      const idRange = rangeOf(text, '"*.json"');
      const commentRange = rangeOf(text, "/* kind */", idRange[1]);
      const attr1 = createAttribute(text, "type", '"json"', commentRange[1]);
      const attr2 = createAttribute(
        text,
        "integrity",
        '"sha384-abc"',
        attr1.range[1],
      );

      return createAmbientModuleProgram(text, '"*.json"', {
        attributes: [attr1, attr2],
        comments: [{ type: "Block", value: " kind ", range: commentRange }],
      });
    });

    expect(result).toBe(
      [
        'declare module "*.json" with {',
        '  /* kind */ type: "json",',
        '  integrity: "sha384-abc",',
        "} {}",
        "",
      ].join("\n"),
    );
  });

  test("preserves empty attributes with `with {}`", async () => {
    const code = 'declare module "*.txt" with {} {}';
    const result = await formatWithCustomParser(code, (text) => {
      const idRange = rangeOf(text, '"*.txt"');
      const attrBlockEnd = text.indexOf("}", idRange[1]) + 1;

      return createAmbientModuleProgram(text, '"*.txt"', {
        attributes: [],
        bodyStartOffset: attrBlockEnd,
      });
    });

    expect(result).toBe('declare module "*.txt" with {} {}\n');
  });

  test("leaves declarations without attributes unchanged", async () => {
    const code = 'declare module "with-helper" { const value = 1; }';
    const result = await formatWithCustomParser(code, (text) => {
      const declRange = rangeOf(text, "const value = 1;");
      const identRange = rangeOf(text, "value", declRange[0]);
      const initRange = rangeOf(text, "1", identRange[1]);

      return createAmbientModuleProgram(text, '"with-helper"', {
        bodyStatements: [
          {
            type: "VariableDeclaration",
            kind: "const",
            declarations: [
              {
                type: "VariableDeclarator",
                id: { type: "Identifier", name: "value", range: identRange },
                init: { type: "Literal", value: 1, raw: "1", range: initRange },
                range: [identRange[0], initRange[1]],
              },
            ],
            range: declRange,
          },
        ],
      });
    });

    expect(result).toBe(
      ['declare module "with-helper" {', "  const value = 1;", "}", ""].join(
        "\n",
      ),
    );
  });

  test("handles shorthand ambient module declarations without body or attributes", async () => {
    const code = 'declare module "*.css";';
    const result = await formatWithCustomParser(code, (text) =>
      createAmbientModuleProgram(text, '"*.css"', { hasBody: false }),
    );

    expect(result).toBe('declare module "*.css";\n');
  });
});
