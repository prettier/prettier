// @flow

('yo': $Values<boolean>); // Error: `boolean` is not an object and so has no
                          // properties.
(123: $Values<boolean>); // Error: `boolean` is not an object and so has no
                         // properties.
(true: $Values<boolean>); // Error: `boolean` is not an object and so has no
                          // properties.
