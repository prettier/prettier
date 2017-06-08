type f = (
  currentRequest: {a: number},
  // TODO this is a very very very very long comment that makes it go > 80 columns
) => number;

f = (
  currentRequest: {a: number},
  // TODO this is a very very very very long comment that makes it go > 80 columns
): number => {};

f = (
  currentRequest: {a: number},
  // TODO this is a very very very very long comment that makes it go > 80 columns
) => {};

f = function(
  currentRequest: {a: number},
  // TODO this is a very very very very long comment that makes it go > 80 columns
) {};

class X {
  f(
    currentRequest: {a: number},
    // TODO this is a very very very very long comment that makes it go > 80 columns
  ) {}
}

function f(
  a: number
// some comment here
): number {
  return a + 1;
}

var x = {
  getSectionMode(
    pageMetaData: PageMetaData,
    sectionMetaData: SectionMetaData
    /* $FlowFixMe This error was exposed while converting keyMirror
     * to keyMirrorRecursive */
  ): $Enum<SectionMode> {
  }
}

class X {
  getSectionMode(
    pageMetaData: PageMetaData,
    sectionMetaData: SectionMetaData = ['unknown']
    /* $FlowFixMe This error was exposed while converting keyMirror
     * to keyMirrorRecursive */
  ): $Enum<SectionMode> {
  }
}

class Foo {
  a(lol /*string*/) {}

  b(lol /*string*/
  ) {}

  d(
    lol /*string*/,
    lol2 /*string*/,
    lol3 /*string*/,
    lol4 /*string*/
  ) {}

  d(
    lol /*string*/,
    lol2 /*string*/,
    lol3 /*string*/,
    lol4 /*string*/
  ) /*string*/ {}

  // prettier-ignore
  c(lol /*string*/
  ) {}

  // prettier-ignore
  d(
    lol /*string*/,
    lol2 /*string*/,
    lol3 /*string*/,
    lol4 /*string*/
  ) {}

  // prettier-ignore
  e(
    lol /*string*/,
    lol2 /*string*/,
    lol3 /*string*/,
    lol4 /*string*/
  ) {} /* string*/
}
