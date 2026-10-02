class A extends (/* c */ <div />) {}

class B extends (<div /> /* c */) {}

class Both extends (/* before */ <div /> /* after */) {}

class Fragment extends (/* fragment */ <>child</>) {}

let Expression = class extends (<div /> /* expression */) {};

Expression = class extends (/* assignment */ <Component />) {};

class Ordinary extends (/* ordinary */ createClass()) {}

class Outside extends /* outside */ (<div />) {}

class Ignored extends (/* prettier-ignore */ <div  unformatted = "value" />) {}

class IgnoredTrailing extends (
  /* prettier-ignore */ <div  unformatted = "value" /> // trailing
) {}

class LeadingLine extends (
  // leading line
  <Component />
) {}

class TrailingLine extends (
  <Component /> // trailing line
) {}
