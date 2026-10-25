export type QueriesDataService<T extends string> = {
  [key in T]: string;
};
