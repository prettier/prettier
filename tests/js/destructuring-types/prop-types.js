// destructured props type all on one line (small enough for one line):
const Component1 = (props: { first: String }) => abc()

// multi-line destructured props type, small enough for one line:
const Component2 = (props: {
  first: String
}) => abc()

// multi-line destructured props type - not small enough for one line:
const Component3 = (props: {
  firstProperty: String,
  secondProperty: String,
  thirdProperty: String
}) => abc()
