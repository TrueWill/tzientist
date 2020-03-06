export type ExperimentFunction<TParams extends any[], TResult> = (
  ...args: TParams
) => TResult;

export interface Result<TResult> {
  experimentName: string;
  controlResult?: TResult;
  candidateResult?: TResult;
  controlError?: any;
  candidateError?: any;
}

export interface Options<TResult> {
  publish: (result: Result<TResult>) => void;
}

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
        if (result.controlResult !== result.candidateResult)
          console.log(`Experiment ${result.experimentName}: difference found`);
      }
    };
  }

  return (...args): TResult => {
    let controlResult: TResult | undefined;
    let candidateResult: TResult | undefined;
    let hasCandidateResult = false;
    let controlError: any;
    let candidateError: any;

    try {
      candidateResult = candidate(...args);
      hasCandidateResult = true;
    } catch (e) {
      candidateError = e;
    }

    try {
      controlResult = control(...args);
    } catch (e) {
      controlError = e;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      options!.publish({
        experimentName: name,
        controlResult,
        candidateResult,
        controlError
      });

      throw e;
    }

    if (hasCandidateResult) {
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
        controlError,
        candidateError
      });
    }

    return controlResult;
  };
}
