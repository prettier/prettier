const flat = foo.bar().baz() as { value: string };
const plain = value as { value: string };

const conditional = foo.first().second().third() as {
  value: string;
  nested: { value: number };
};

const forced = values
  .map((value) => ({
    value,
  }))
  .filter((value) => value) as {
  value: string;
  nested: { value: number };
};

const satisfies = values
  .map((value) => ({
    value,
  }))
  .filter((value) => value) satisfies {
  value: string;
};

const optional = values
  ?.map((value) => ({
    value,
  }))
  ?.filter((value) => value) as {
  value: string;
};

const member = (values
  .map((value) => ({
    value,
  }))
  .filter((value) => value) as { value: string }).value;

const union = values
  .map((value) => ({
    value,
  }))
  .filter((value) => value) as { value: string } | { value: number };

const commented = values
  .map((value) => ({
    value,
  }))
  .filter((value) => value) as
  // A type comment.
  {
    value: string;
  };

const trailingMember = values
  .map((value) => ({
    value,
  }))
  .filter((value) => value).result as {
  value: string;
};
