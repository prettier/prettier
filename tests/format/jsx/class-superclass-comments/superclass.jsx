class Leading extends (/* leading */ <Component />) {}

class Trailing extends (<Component /> /* trailing */) {}

class Both extends (/* before */ <Component /> /* after */) {}

class LeadingLine extends (
  // leading line
  <Component />
) {}

class TrailingLine extends (
  <Component /> // trailing line
) {}

class Fragment extends (/* fragment */ <>child</>) {}

let Expression = class extends (<Component /> /* expression */) {};

Expression = class extends (/* assignment */ <Component />) {};

class Nested extends (
  /* nested */ <Component><Child /></Component> /* end */
) {
  method() {}
}

class Ordinary extends (/* ordinary */ createClass()) {}

class Ignored extends (/* prettier-ignore */ <Component  unformatted = "value" />) {}

Expression = class extends (/* long before */ <Component attribute="a long attribute that wraps at narrow widths"><Child /></Component> /* long after */) {
  method() {}
};
