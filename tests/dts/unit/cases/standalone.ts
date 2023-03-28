import * as prettierStandalone from "../../../../src/standalone.js";

prettierStandalone.formatWithCursor(" 1", { cursorOffset: 2, parser: "babel" });
prettierStandalone.formatWithCursor(" 1", {
  cursorOffset: 2,
  parser: "babel",
  // @ts-expect-error
  rangeStart: 2,
});
prettierStandalone.formatWithCursor(" 1", {
  cursorOffset: 2,
  parser: "babel",
  // @ts-expect-error
  rangeEnd: 2,
});
prettierStandalone.format(" 1", { parser: "babel" });
prettierStandalone.check(" console.log(b)");
prettierStandalone.getSupportInfo();
