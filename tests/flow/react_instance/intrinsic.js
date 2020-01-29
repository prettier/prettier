// @flow

declare var any: any;

(any: React$ElementRef<'foo'>).yep1; // OK
(any: React$ElementRef<'foo'>).yep2; // Error
(any: React$ElementRef<'foo'>).nope; // Error
(any: React$ElementRef<'bar'>).yep1; // Error
(any: React$ElementRef<'bar'>).yep2; // OK
(any: React$ElementRef<'bar'>).nope; // Error
