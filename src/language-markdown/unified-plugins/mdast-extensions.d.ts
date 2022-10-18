import { StaticPhrasingContentMap } from "mdast";

declare module "mdast" {
  interface LiquidNode extends Literal {
    type: "liquidNode";
    children: [];
  }
  interface StaticPhrasingContentMap {
    liquidNode: LiquidNode;
  }
}
