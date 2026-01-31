// node_modules/@babel/code-frame/lib/common-BO7XIBW3.js
var NEWLINE = /\r\n|[\n\r\u2028\u2029]/;
function getMarkerLines(loc, source, opts, startLineBaseZero) {
  const startLoc = {
    column: 0,
    line: -1,
    ...loc.start
  };
  const endLoc = {
    ...startLoc,
    ...loc.end
  };
  const {
    linesAbove = 2,
    linesBelow = 3
  } = opts || {};
  const startLine = startLoc.line - startLineBaseZero;
  const startColumn = startLoc.column;
  const endLine = endLoc.line - startLineBaseZero;
  const endColumn = endLoc.column;
  let start = Math.max(startLine - (linesAbove + 1), 0);
  let end = Math.min(source.length, endLine + linesBelow);
  if (startLine === -1) {
    start = 0;
  }
  if (endLine === -1) {
    end = source.length;
  }
  const lineDiff = endLine - startLine;
  const markerLines = {};
  if (lineDiff) {
    for (let i = 0; i <= lineDiff; i++) {
      const lineNumber = i + startLine;
      if (!startColumn) {
        markerLines[lineNumber] = true;
      } else if (i === 0) {
        const sourceLength = source[lineNumber - 1].length;
        markerLines[lineNumber] = [startColumn, sourceLength - startColumn + 1];
      } else if (i === lineDiff) {
        markerLines[lineNumber] = [0, endColumn];
      } else {
        const sourceLength = source[lineNumber - i].length;
        markerLines[lineNumber] = [0, sourceLength];
      }
    }
  } else {
    if (startColumn === endColumn) {
      if (startColumn) {
        markerLines[startLine] = [startColumn, 0];
      } else {
        markerLines[startLine] = true;
      }
    } else {
      markerLines[startLine] = [startColumn, endColumn - startColumn];
    }
  }
  return {
    start,
    end,
    markerLines
  };
}
function _codeFrameColumns(rawLines, loc, opts = {}, colorOpts) {
  const {
    defs,
    highlight: highlight2
  } = colorOpts || {
    defs: {
      gutter: String,
      marker: String,
      message: String,
      reset: String
    },
    highlight: String
  };
  const startLineBaseZero = (opts.startLine || 1) - 1;
  const lines = rawLines.split(NEWLINE);
  const {
    start,
    end,
    markerLines
  } = getMarkerLines(loc, lines, opts, startLineBaseZero);
  const hasColumns = loc.start && typeof loc.start.column === "number";
  const numberMaxWidth = String(end + startLineBaseZero).length;
  const highlightedLines = highlight2(rawLines);
  let frame = highlightedLines.split(NEWLINE, end).slice(start, end).map((line, index) => {
    const number = start + 1 + index;
    const paddedNumber = ` ${number + startLineBaseZero}`.slice(-numberMaxWidth);
    const gutter = ` ${paddedNumber} |`;
    const hasMarker = markerLines[number];
    const lastMarkerLine = !markerLines[number + 1];
    if (hasMarker) {
      let markerLine = "";
      if (Array.isArray(hasMarker)) {
        const markerSpacing = line.slice(0, Math.max(hasMarker[0] - 1, 0)).replace(/[^\t]/g, " ");
        const numberOfMarkers = hasMarker[1] || 1;
        markerLine = ["\n ", defs.gutter(gutter.replace(/\d/g, " ")), " ", markerSpacing, defs.marker("^").repeat(numberOfMarkers)].join("");
        if (lastMarkerLine && opts.message) {
          markerLine += " " + defs.message(opts.message);
        }
      }
      return [defs.marker(">"), defs.gutter(gutter), line.length > 0 ? ` ${line}` : "", markerLine].join("");
    } else {
      return ` ${defs.gutter(gutter)}${line.length > 0 ? ` ${line}` : ""}`;
    }
  }).join("\n");
  if (opts.message && !hasColumns) {
    frame = `${" ".repeat(numberMaxWidth + 1)}${opts.message}
${frame}`;
  }
  return defs.reset(frame);
}

// node_modules/@babel/code-frame/lib/browser.js
var deprecationWarningShown = false;
function codeFrameColumns(rawLines, loc, opts = {}) {
  return _codeFrameColumns(rawLines, loc, opts);
}
function browser(rawLines, lineNumber, colNumber, opts = {}) {
  if (!deprecationWarningShown) {
    deprecationWarningShown = true;
    const message = "Passing lineNumber and colNumber is deprecated to @babel/code-frame. Please use `codeFrameColumns`.";
    const deprecationError = new Error(message);
    deprecationError.name = "DeprecationWarning";
    console.warn(new Error(message));
  }
  colNumber = Math.max(colNumber, 0);
  const location = {
    start: {
      column: colNumber,
      line: lineNumber
    }
  };
  return codeFrameColumns(rawLines, location, opts);
}
function highlight(code) {
  return code;
}
export {
  codeFrameColumns,
  browser as default,
  highlight
};
