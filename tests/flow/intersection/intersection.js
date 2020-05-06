function bar(x: Error & {type:number}): number {
    return x.type;
}
