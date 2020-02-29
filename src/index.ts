// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExperimentFunction<TParams extends any[], TResult> = (
  ...args: TParams
) => TResult;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function experiment<TParams extends any[], TResult>({
  name,
  control: use,
  pilot: check
}: {
  name: string;
  control: ExperimentFunction<TParams, TResult>;
  pilot: ExperimentFunction<TParams, TResult>;
}): ExperimentFunction<TParams, TResult> {
  return (...args): TResult => {
    const checkResult = check(...args);
    const useResult = use(...args);

    if (useResult !== checkResult) {
      console.log(`Experiment ${name}: difference found`);
    }

    return useResult;
  };
}
