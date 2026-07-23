type Type<T> = { [K in keyof T]: /** Comment */ B };

type Type<T> = {
  [K in keyof T]: /** Comment */
    B;
};

type Type<T> = { [K in keyof T]: /** Comment */ | B };

type Type<T> = { [K in keyof T] /** Comment */: B | C };
