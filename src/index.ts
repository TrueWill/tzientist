// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExperimentFunction<T> = (...args: any[]) => T;

export function experiment<T>({
  name,
  use,
  check
}: {
  name: string;
  use: ExperimentFunction<T>;
  check: ExperimentFunction<T>;
}): ExperimentFunction<T> {
  return (...args): T => {
    const checkResult: T = check(...args);
    const useResult: T = use(...args);

    if (useResult !== checkResult) {
      console.log(`Experiment ${name}: difference found`);
    }

    return useResult;
  };
}
