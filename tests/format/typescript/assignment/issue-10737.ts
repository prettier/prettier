const foo = call<{
  prop1: string;
  prop2: string;
  prop3: string;
}>();

export const CallRecorderContext =
  createContext<{
    deleteRecording: (id: string) => void;
    deleteAll: () => void;
  } | null>(null);

export const CallRecorderContext =
  createContext<{
    deleteRecording: (id: string) => void;
    deleteAll: () => void;
  } | null>(null, "useless");
