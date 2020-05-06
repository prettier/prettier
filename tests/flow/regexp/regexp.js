var patt=/Hello/g
var match:number = patt.test("Hello world!");

declare var regExp: RegExp;
(regExp[Symbol.matchAll]: (str: string) => Iterator<RegExp$matchResult>);
(regExp[Symbol.match]: (str: string) => Iterator<RegExp$matchResult>);
