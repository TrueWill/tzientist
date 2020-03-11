export type ExperimentFunction<TParams extends any[], TResult> = (
  ...args: TParams
) => TResult;

export interface Results<TResult> {
  experimentName: string;
  controlResult?: TResult;
  candidateResult?: TResult;
  controlError?: any;
  candidateError?: any;
}

export interface Options<TParams extends any[], TResult> {
  publish?: (results: Results<TResult>) => void;
  enabled?: (...args: TParams) => boolean;
}

function defaultPublish<TResult>(results: Results<TResult>): void {
  if (
    results.candidateResult !== results.controlResult ||
    (results.candidateError && !results.controlError) ||
    (!results.candidateError && results.controlError)
  ) {
    console.warn(`Experiment ${results.experimentName}: difference found`);
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
  options?: Options<TParams, TResult>;
}): ExperimentFunction<TParams, TResult> {
  const publish = options.publish || defaultPublish;

  return (...args): TResult => {
    let controlResult: TResult | undefined;
    let candidateResult: TResult | undefined;
    let controlError: any;
    let candidateError: any;
    const isEnabled: boolean = !options.enabled || options.enabled(...args);

    function publishResults(): void {
      if (isEnabled) {
        publish({
          experimentName: name,
          controlResult,
          candidateResult,
          controlError,
          candidateError
        });
      }
    }

    if (isEnabled) {
      try {
        candidateResult = candidate(...args);
      } catch (e) {
        candidateError = e;
      }
    }

    try {
      controlResult = control(...args);
    } catch (e) {
      controlError = e;
      publishResults();
      throw e;
    }

    publishResults();
    return controlResult;
  };
}
