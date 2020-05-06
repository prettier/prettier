declare module M {
    declare module.exports: (x: string) => string;
}
declare module N {
    declare var x: number;
    declare var y: number;
    declare var z: number;
}
declare module Q {
    declare module.exports: $Exports<'M'>;
}
