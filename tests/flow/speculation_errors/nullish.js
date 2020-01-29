/**
 * @format
 * @flow
 */

(42: string | null | void); // Error: should only show string
(42: {} | null | void); // Error: should only show object
(42: [] | null | void); // Error: should only show array
({}: string | null | void); // Error: should only show string
({}: {p: empty} | null | void); // Error: should only show object
({}: [] | null | void); // Error: should only show array
([]: string | null | void); // Error: should only show string
([]: {} | null | void); // Error: should only show object
([]: [empty] | null | void); // Error: should only show array
