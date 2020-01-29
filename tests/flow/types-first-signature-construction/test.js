// @flow

import f1 from './file1';
(f1(""): string);
(f1(0): number);

import f2 from './file2';
(f2(""): string);
(f2(0): number);

import f3 from './file3';
(f3(""): string);
(f3(0): number);
(f3(true): boolean);

import c from './file4';
((new c).x: string);
((new c).x: number);

import f5 from './file5';
(f5: number);
(f5(): number);
