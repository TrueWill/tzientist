// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExperimentFunction<TParams extends any[], TResult> = (
  ...args: TParams
) => TResult;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function experiment<TParams extends any[], TResult>({
  name,
  control,
  candidate
}: {
  name: string;
  control: ExperimentFunction<TParams, TResult>;
  candidate: ExperimentFunction<TParams, TResult>;
}): ExperimentFunction<TParams, TResult> {
  return (...args): TResult => {
    const candidateResult = candidate(...args);
    const controlResult = control(...args);

    if (controlResult !== candidateResult) {
      console.log(`Experiment ${name}: difference found`);
    }

    return controlResult;
  };
}
