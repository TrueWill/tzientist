// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExperimentFunction<TParams extends any[], TResult> = (
  ...args: TParams
) => TResult;

export interface Result<TResult> {
  experimentName: string;
  controlResult: TResult;
  candidateResult: TResult;
}

export interface Options<TResult> {
  publish: (result: Result<TResult>) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function experiment<TParams extends any[], TResult>({
  name,
  control,
  candidate,
  options
}: {
  name: string;
  control: ExperimentFunction<TParams, TResult>;
  candidate: ExperimentFunction<TParams, TResult>;
  options?: Options<TResult>;
}): ExperimentFunction<TParams, TResult> {
  if (!options) {
    options = {
      publish: (result): void => {
        console.log(`Experiment ${result.experimentName}: difference found`);
      }
    };
  }

  return (...args): TResult => {
    const candidateResult = candidate(...args);
    const controlResult = control(...args);

    if (controlResult !== candidateResult) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      options!.publish({
        experimentName: name,
        controlResult,
        candidateResult
      });
    }

    return controlResult;
  };
}
