const colors = /* @__PURE__ */ new Proxy(String, { get: () => colors });

export default colors;
export const createColors = () => colors;
