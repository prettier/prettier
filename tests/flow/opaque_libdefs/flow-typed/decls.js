declare export opaque type Queue;
declare function new_queue(): Queue;
declare function enqueue(q: Queue, x: any): Queue;
declare function dequeue(q: Queue): any;

declare export opaque type Counter: number;
declare function init_counter(): Counter;
declare function counter_to_number(c: Counter): number;

declare export opaque type PolyStack<T>;
declare function new_stack<T>(x: T): PolyStack<T>;
declare function push<T>(x: T, y: PolyStack<T>): PolyStack<T>;
declare function pop<T>(x: PolyStack<T>): T;

declare export opaque type Contra<-T>;
