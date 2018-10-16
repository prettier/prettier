"use strict";

const {
  builders: { concat, group, line, join, softline, indent }
} = require("../doc");

/**
 *     NgFor ::
 *         '*ngFor="' NgForValue '"'
 *
 *     NgForValue ::
 *         NgForLetOf ( ';' ( NgForLetEqual | NgForColon | NgForAs ) )*
 */
const IDENTIFIER_PATTERN = "[a-zA-Z_][a-zA-Z0-9_]*";
/**
 *     NgForLetOf ::
 *         'let' Identifier 'of' Expression
 */
const NG_FOR_LET_OF_PATTERN = `^let\\s+(${IDENTIFIER_PATTERN})\\s+of\\b\\s*([\\s\\S]+)$`;
/**
 *     NgForLetEqual ::
 *         'let' Identifier '=' Identifier
 */
const NG_FOR_LET_EQUAL_PATTERN = `^let\\s+(${IDENTIFIER_PATTERN})\\s*=\\s*(${IDENTIFIER_PATTERN})$`;
/**
 *     NgForColon ::
 *         Identifier ':' Expression
 */
const NG_FOR_COLON_PATTERN = `^(${IDENTIFIER_PATTERN})\\s*:?\\s*([\\s\\S]+)$`;
/**
 *     NgForAs ::
 *         Identifier 'as' Identifier
 */
const NG_FOR_AS_PATTERN = `^(${IDENTIFIER_PATTERN})\\s+as\\s+(${IDENTIFIER_PATTERN})$`;
/**
 *     *ngFor="let hero of heroes"
 *     *ngFor="let hero of heroes; let i=index"
 *     *ngFor="let hero of heroes; trackBy: trackByHeroes"
 *     *ngFor="let item of items; index as i; trackBy: trackByFn"
 */
function printNgFor(data, textToDoc) {
  return group(
    concat([
      indent(
        concat([
          softline,
          join(
            concat([";", line]),
            data
              .split(";")
              .map(subData => subData.trim())
              .map(
                (subData, index) =>
                  index === 0
                    ? printNgForLetOf(subData, textToDoc)
                    : /^let\s/.test(subData)
                      ? printNgForLetEqual(subData, textToDoc)
                      : /\sas\s/.test(subData)
                        ? printNgForAs(subData, textToDoc)
                        : printNgForColon(subData, textToDoc)
              )
          )
        ])
      ),
      softline
    ])
  );
}

function printNgForLetOf(data, textToDoc) {
  const [, identifier, expression] = data.match(
    new RegExp(NG_FOR_LET_OF_PATTERN)
  );
  return concat([
    "let ",
    identifier,
    " of ",
    group(textToDoc(expression, { parser: "__js_expression" }))
  ]);
}

function printNgForLetEqual(data /*, textToDoc */) {
  const [, identifier1, identifier2] = data.match(NG_FOR_LET_EQUAL_PATTERN);
  return concat(["let ", identifier1, "=", identifier2]);
}

function printNgForColon(data, textToDoc) {
  const [, identifier, expression] = data.match(NG_FOR_COLON_PATTERN);
  return concat([
    identifier,
    ": ",
    group(textToDoc(expression, { parser: "__js_expression" }))
  ]);
}

function printNgForAs(data /*, textToDoc */) {
  const [, identifier1, identifier2] = data.match(NG_FOR_AS_PATTERN);
  return concat([identifier1, " as ", identifier2]);
}

module.exports = {
  printNgFor
};
