type Type<T> = { [K in keyof T]: /** Comment */ B };

type Type<T> = {
  [K in keyof T]: /** Comment */
    B;
};

type Type<T> = { [K in keyof T]: /** Comment */ | B };

type Type<T> = { [K in keyof T] /** Comment */: B | C };

type Type<T> = { [K in keyof T as `get${K}`]: /** Comment */ B };

type Type<T> = { [K in keyof T as `get${K}`]: /** Comment */ | B };

type Type<T> = { [K in keyof T as K extends string ? K : never]: /** Comment */ B };

type Type<T> = {
  [K in keyof T as K extends string ? K : never] /** Comment */: B | C;
};
