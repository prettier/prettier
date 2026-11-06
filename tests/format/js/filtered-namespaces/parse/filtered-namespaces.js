import { a, b } as ns1 from "x";
import defer { a, "b c" } as ns2 from "x";
import d, { default } as ns3 from "x";
import {} as ns4 from "x";
export { a, b } as ns5 from "y";
export defer { a, "b c" } as "ns 6" from "y" with { type: "json" };
