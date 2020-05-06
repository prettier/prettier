// @flow

export opaque type Box<T> = [T];
export opaque type Container<T> = Box<T>;

function test1(x : Box<string>) : Box<number> { // Error: string ~> number
    return x;
}

function test2(x : Box<string>) : Box<string> {
    return x;
}

function test3(x : Container<string>) : Container<number> { // Error: string ~> number
    return x;
}

function test4(x : Container<string>) : Container<string> {
    return x;
}

function test5(x : Container<string>) : Box<string> {
    return x;
}

function test6(x : Box<string>) : Container<string> {
    return x;
}
