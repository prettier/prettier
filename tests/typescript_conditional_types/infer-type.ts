type TestReturnType<T extends (...args: any[]) => any> = T extends (...args: any[]) => infer R ? R : any;
