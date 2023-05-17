type T = {
  (): void;
  second: string;
};

type T = {
  (): void; // prettier-ignore
  second: string;
};

type T = {
  first: string;
  (): void;
};

type T = {
  first: string;
  (): void; // prettier-ignore
};

interface I {
  (): void;
  second: string;
}

interface I {
  (): void; // prettier-ignore
  second: string;
}

interface I {
  first: string;
  (): void;
}

interface I {
  first: string;
  (): void; // prettier-ignore
}
