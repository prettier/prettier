const assert = new Proxy(() => {}, { get: () => assert });

export default assert;
