/**
 * @format
 * @flow
 */

declare var any: any;

((any: (x: {p: number}) => void): (x: {p: string}) => void);

type X<-T> = mixed;
((any: X<{p: number}>): X<{p: string}>);
