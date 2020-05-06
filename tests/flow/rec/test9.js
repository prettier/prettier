// @flow

declare var o: {
  x: number,
  y: typeof o,
};

type O = {
  x: string;
  y: O;
}

(o: O);
(o.y: O);
