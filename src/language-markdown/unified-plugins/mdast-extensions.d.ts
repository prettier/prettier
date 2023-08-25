import { StaticPhrasingContentMap } from "mdast";

declare module "mdast" {
  interface LiquidNode extends Literal {
    type: "liquidNode";
    children: [];
  }
  interface LiquidBlock extends Literal {
    type: "liquidBlock";
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
