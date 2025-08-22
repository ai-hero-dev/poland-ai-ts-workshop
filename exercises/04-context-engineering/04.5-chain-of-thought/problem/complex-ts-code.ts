type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type EventMap = {
  login: {
    username: string;
    password: string;
  };
  logout: {};
  updateUsername: {
    newUsername: string;
  };
};

export type EventAsDiscriminatedUnion = {
  [K in keyof EventMap]: Prettify<
    {
      type: K;
    } & EventMap[K]
  >;
}[keyof EventMap];
