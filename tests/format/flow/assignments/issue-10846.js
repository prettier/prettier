const foo1 =
  call<{
    prop1: string;
    prop2: string;
    prop3: string;
  }>();

export const CallRecorderContext1 =
  createContext<{
    deleteRecording: (id: string) => void;
    deleteAll: () => void;
  } | null>(null);

export const CallRecorderContext2 = createContext<{
  deleteRecording: (id: string) => void;
  deleteAll: () => void;
} | null>(null, "useless");

const foo2 =
  call<Foooooo, Foooooo, Foooooo, Foooooo, Foooooo, Foooooo, Foooooo>();

const foo3 =
  call<
    | Foooooooooooo
    | Foooooooooooo
    | Foooooooooooo
    | Foooooooooooo
    | Foooooooooooo
  >();

const foo4 =
  call<
    Foooooooooooo &
      Foooooooooooo &
      Foooooooooooo &
      Foooooooooooo &
      Foooooooooooo
  >();
