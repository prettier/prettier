"use strict";

/**
 * modified from https://github.com/zestedesavoir/zmarkdown/blob/master/packages/remark-abbr
 *
 * Copyright (c) Zeste de Savoir (https://zestedesavoir.com)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

const ABBR_TAG = "abbr";
const ABBR_LOCATOR = "*[";
const ABBR_REGEX = /^\*\[\s*([^\]]+)\s*]\s*:\s*([^\n]*)/;

function abbr() {
  const proto = this.Parser.prototype;
  const methods = proto.inlineMethods;
  methods.splice(0, 0, ABBR_TAG);
  proto.inlineTokenizers.abbr = tokenizer;

  function tokenizer(eat, value) {
    const match = value.match(ABBR_REGEX);

    if (match) {
      return eat(match[0])({
        type: ABBR_TAG,
        abbr: match[1],
        title: match[2]
      });
    }
  }
  tokenizer.locator = function(value, fromIndex) {
    return value.indexOf(ABBR_LOCATOR, fromIndex);
  };
}

module.exports = abbr;
