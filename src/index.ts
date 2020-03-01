// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExperimentFunction<TParams extends any[], TResult> = (
  ...args: TParams
) => TResult;

export interface Result<TResult> {
  experimentName: string;
  controlResult: TResult;
  candidateResult?: TResult;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  candidateError?: any;
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
    let candidateResult: TResult | undefined;
    let hasCandidateResult = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let candidateError: any;

    try {
      candidateResult = candidate(...args);
      hasCandidateResult = true;
    } catch (e) {
      candidateError = e;
    }

    const controlResult = control(...args);

    if (hasCandidateResult && controlResult !== candidateResult) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      options!.publish({
        experimentName: name,
        controlResult,
        candidateResult
      });
    } else if (!hasCandidateResult) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      options!.publish({
        experimentName: name,
        controlResult,
        candidateError
      });
    }

    return controlResult;
  };
}
