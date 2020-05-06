//@flow

declare var x: React$AbstractComponent<any, any>;
declare var y: string;
x[y]; // Ok
x[y] = y; // Ok
