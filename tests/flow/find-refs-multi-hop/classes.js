// @flow

class Superclass {
  foo() {}
}

class Middleclass extends Superclass {
  foo() {}
}

class Subclass extends Middleclass {
  foo() {}
}

type Unrelated = {
  foo(): void,
}

type RelatedToSuper = {
  foo(): void,
}
(new Superclass(): RelatedToSuper);

type RelatedToMiddle = {
  foo(): void,
}
(new Middleclass(): RelatedToMiddle);

type RelatedToSub = {
  foo(): void,
}
(new Subclass(): RelatedToSub);
