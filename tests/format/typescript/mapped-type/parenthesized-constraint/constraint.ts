type MyObject = {
  required: string;
  readonly optional?: number;
};

type BooleanValues = {
  [key in (keyof MyObject)]: boolean;
};

const bv: BooleanValues = { required: true };

type Unparenthesized = { [key in keyof MyObject]: boolean };
type NestedParentheses = { [key in (((keyof MyObject)))]: boolean };
type ParenthesizedOperand = { [key in keyof (MyObject)]: boolean };
type ParenthesizedConstraintAndOperand = { [key in (keyof (MyObject))]: boolean };
type EmptyObject = { [key in (keyof {})]: boolean };
type Remapped = { [key in (keyof MyObject) as `get_${key}`]: boolean };
type ExplicitModifiers = { -readonly [key in (keyof MyObject)]+?: boolean };

type Generic<T> = { [key in (keyof T)]: T[key] };
type GenericUnparenthesized<T> = { [key in keyof T]: T[key] };
type LongConstraint = {
  [key in (keyof ATypeWhoseVeryLongNameForcesTheMappedTypeConstraintToBreak)]: boolean;
};

type CommentBefore = { [key in /* comment */ (keyof MyObject)]: boolean };
type CommentInside = { [key in (/* comment */ keyof MyObject)]: boolean };
type CommentAfter = { [key in (keyof MyObject /* comment */)]: boolean };
type LineComment = { [key in (keyof // comment
  MyObject)]: boolean };
type CommentWithParentheses = { [key in /* (comment) */ keyof MyObject]: boolean };

type OtherConstraint = { [key in (Keys)]: boolean };
type UnionConstraint = { [key in ((keyof MyObject) | "extra")]: boolean };
type IntersectionConstraint = { [key in ((keyof MyObject) & string)]: boolean };
type OutsideMappedType = (keyof MyObject);
