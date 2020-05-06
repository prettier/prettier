/**
 * @format
 * @flow
 */

declare var any: any;

((any: ?number): number);
((any: ?number): null);
((any: ?number): void);

((any: number): ?number);
((any: null): ?number);
((any: void): ?number);

((any: ?number): number | null);
((any: ?number): number | void);

((any: number | null): ?number);
((any: number | void): ?number);
