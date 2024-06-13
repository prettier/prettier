const chalk = new Proxy(String, { get: () => chalk });

export default chalk;
