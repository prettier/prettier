// @flow

type NoProps = $Values<{}>;
const noReadProps = { set a(value: number) { /* noop */ } };
type NoReadProps = $Values<typeof noReadProps>;
(123: NoProps); // Error: There are no props.
(345: NoReadProps); // Error: There are no props which can be read.

type OneProp = $Values<{ a: string }>;
('yo': OneProp); // OK: There is a property with the type of string.
(123: OneProp); // Error: There is no property with the type of number.
(true: OneProp); // Error: There is no property with the type of boolean.
(((null: any): OneProp): string | number); // OK: The values are a subset.
(((null: any): OneProp): number); // Error: There is no string in the final
                                  // union.

type ManyProps = $Values<{ a: string, b: string, c: number }>;
('yo': ManyProps); // OK: There is a property with the type of string.
(123: ManyProps); // OK: There is a property with the type of number.
(true: ManyProps); // Error: There is no property with the type of boolean.
(((null: any): ManyProps): string | number | boolean); // OK: The values are a
                                                       // subset.
(((null: any): ManyProps): string | boolean); // Error: There is no number in
                                              // the final union.

type DictProps = $Values<{ a: boolean, [key: string]: number }>;
('yo': DictProps); // Error: There is no property with the type of string.
(123: DictProps); // OK: There is a dictionary value with the type of number.
(true: DictProps); // OK: There is a property with the type of boolean.
(((null: any): DictProps): string | number | boolean); // OK: The values are a
                                                       // subset.
(((null: any): DictProps): string | boolean); // Error: There is no number in
                                              // the final union.

interface CallableProp { a: string; b: number; (): boolean }
('yo': $Values<CallableProp>); // OK: There is a property with the type of
                               // string.
(123: $Values<CallableProp>); // OK: There is a property with the type of
                              // number.
(true: $Values<CallableProp>); // Error: There is no property with the type of
                               // boolean even though the interface is callable
                               // and may return a boolean.
((() => true): $Values<CallableProp>); // Error: There is no property with a
                                       // function of this signature even though
                                       // the interface is callable with this
                                       // signature.

const Suite: {
  DIAMONDS: 'Diamonds',
  CLUBS: 'Clubs',
  HEARTS: 'Hearts',
  SPADES: 'Spades',
} = {
  DIAMONDS: 'Diamonds',
  CLUBS: 'Clubs',
  HEARTS: 'Hearts',
  SPADES: 'Spades',
};

type SuiteEnum = $Values<typeof Suite>;

const DIAMONDS: 'Diamonds' = 'Diamonds';

function magicTrick(suite: SuiteEnum) {
  // ...
}

('Diamonds': SuiteEnum); // OK: 'Diamonds' is a valid value.
(DIAMONDS: SuiteEnum); // OK: The value of `DIAMONDS` is the valid value
                       // 'Diamonds'.
('DIAMONDS': SuiteEnum); // Error: 'DIAMONDS' is a key, but not a value.
('Magic': SuiteEnum); // Error: 'Magic' is not a value.
(('Diamonds': string): SuiteEnum); // Error: the `string` type is to general and
                                   // not a value.

magicTrick('Diamonds'); // OK: 'Diamonds' is a valid value.
magicTrick(DIAMONDS); // OK: The value of `DIAMONDS` is the valid value
                      // 'Diamonds'.
magicTrick('DIAMONDS'); // Error: 'DIAMONDS' is a key, but not a value.
magicTrick('Magic'); // Error: 'Magic' is not a value.
magicTrick(('Diamonds': string)); // Error: the `string` type is to general and
                                  // not a value.
