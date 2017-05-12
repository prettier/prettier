async function *f(){ await (yield x); }

async function f(){ await (() => {}); }
