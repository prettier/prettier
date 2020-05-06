// @flow

type React$Element<+ElementType> = {|
  +props: React$ElementProps<ElementType>,
|};

function test(
  transform: React$Element<*>,
): ?React$Element<*> {
  return transform;
}

module.exports = {test}; // Should not error
