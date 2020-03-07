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

function defaultPublish<TResult>(result: Result<TResult>): void {
  if (
    result.candidateResult !== result.controlResult ||
    (result.candidateError && !result.controlError) ||
    (!result.candidateError && result.controlError)
  ) {
    console.warn(`Experiment ${result.experimentName}: difference found`);
  }
}

const defaultOptions = {
  publish: defaultPublish
};

export function experiment<TParams extends any[], TResult>({
  name,
  control,
  candidate,
  options = defaultOptions
}: {
  name: string;
  control: ExperimentFunction<TParams, TResult>;
  candidate: ExperimentFunction<TParams, TResult>;
  options?: Options<TResult>;
}): ExperimentFunction<TParams, TResult> {
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

      options.publish({
        experimentName: name,
        controlResult,
        candidateResult,
        controlError
      });

      throw e;
    }

    if (hasCandidateResult) {
      options.publish({
        experimentName: name,
        controlResult,
        candidateResult
      });
    } else if (!hasCandidateResult) {
      options.publish({
        experimentName: name,
        controlResult,
        controlError,
        candidateError
      });
    }

    return controlResult;
  };
}
