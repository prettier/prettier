// @flow

('yo': $Values<any>); // OK: `any` is a blackhole.
(123: $Values<any>); // OK: `any` is a blackhole.
(true: $Values<any>); // OK: `any` is a blackhole.
