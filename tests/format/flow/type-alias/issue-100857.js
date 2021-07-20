type FieldLayoutWith<
  T : string,
  S : unknown = { xxxxxxxx: number; y: string; }
> = {
  type: T;
  code: string;
  size: S;
};

type FieldLayoutWith<
  T : string,
  S : unknown,
> = {
  type: T;
  code: string;
  size: S;
};

type FieldLayoutWith<
  T : string,
> = {
  type: T;
  code: string;
  size: S;
};

type FieldLayoutWith<
  T : stringgggggggggggggggggg,
  S : stringgggggggggggggggggg
> = {
  type: T;
  code: string;
  size: S;
};
