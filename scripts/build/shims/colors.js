const colors = new Proxy(String, { get: () => colors });

export default colors;
