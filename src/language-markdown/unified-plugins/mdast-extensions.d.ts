import { StaticPhrasingContentMap } from "mdast";

declare module "mdast" {
  interface LiquidNode extends Literal {
    type: "liquidNode";
    children: [];
  }
  interface WikiLink extends Literal {
    type: "wikiLink";
    children: [];
  }
  interface StaticPhrasingContentMap {
    liquidNode: LiquidNode;
  }
}
