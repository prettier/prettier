//@flow

var q: Queue = new_queue();
enqueue(q, 3);
dequeue(q);

function flowsQueueToAny(q: Queue): any { return q; }
function flowsSomethingToQueue(x: number): Queue { return x; } // Error number ~> Queue
function flowsQueueToSomething(q: Queue): number {return q; } // Error Queue ~> number

var c = init_counter();
var y = c + 1; // Fine, since Counter is a number.
counter_to_number(y); // Error: number ~> Counter

var s = new_stack(3);
s = push(4, s);
var z = pop(s);
(s: PolyStack<number>);
(z: number);

function convertNumberToString(x: PolyStack<number>): PolyStack<string> {
    return x; // Error: string ~> number, number ~> string
}

function contraOk(x: Contra<number | string>): Contra<number> {return x;}
function contraBad(x: Contra<number>): Contra<number | string> {
    return x; // Error string ~> number
}
