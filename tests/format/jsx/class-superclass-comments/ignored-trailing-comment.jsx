class A extends (/* prettier-ignore */ <Tag  raw = "value" /> // trailing
) {}

class Fragment extends (/* prettier-ignore */ <>{/* inside */}<Tag  raw = "value" /></> // fragment
) {}

let Expression = class extends (/* prettier-ignore */ <Tag  raw = "value" /> // expression
) {};

Expression = class extends (/* prettier-ignore */ <Tag  raw = "value" /> // assignment
) {
  method() {}
};

class LeadingLine extends (
  // prettier-ignore
  <Tag  raw = "value" />
) {}

class InternalComments extends (/* prettier-ignore */ <Tag  raw = {/* inside */ value} />) {}

class Mixed extends (/* before */ /* prettier-ignore */ <Tag  raw = "value" /> /* after */) {}

const IgnoredFragment = class extends (/* prettier-ignore */ <>  raw text  </> /* after */) {};
