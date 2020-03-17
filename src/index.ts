export type ExperimentFunction<TParams extends any[], TResult> = (
  ...args: TParams
) => TResult;

export type ExperimentAsyncFunction<
  TParams extends any[],
  TResult
> = ExperimentFunction<TParams, Promise<TResult>>;

export interface Results<TParams extends any[], TResult> {
  experimentName: string;
  experimentArguments: TParams;
  controlResult?: TResult;
  candidateResult?: TResult;
  controlError?: any;
  candidateError?: any;
}

export interface Options<TParams extends any[], TResult> {
  publish?: (results: Results<TParams, TResult>) => void;
  enabled?: (...args: TParams) => boolean;
}

function defaultPublish<TParams extends any[], TResult>(
  results: Results<TParams, TResult>
): void {
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
          experimentArguments: args,
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

export function experimentAsync<TParams extends any[], TResult>({
  name,
  control,
  candidate,
  options = defaultOptions
}: {
  name: string;
  control: ExperimentAsyncFunction<TParams, TResult>;
  candidate: ExperimentAsyncFunction<TParams, TResult>;
  options?: Options<TParams, TResult>;
}): ExperimentAsyncFunction<TParams, TResult> {
  const publish = options.publish || defaultPublish;

  return async (...args): Promise<TResult> => {
    let controlResult: TResult | undefined;
    let candidateResult: TResult | undefined;
    let controlError: any;
    let candidateError: any;
    const isEnabled: boolean = !options.enabled || options.enabled(...args);

    function publishResults(): void {
      if (isEnabled) {
        publish({
          experimentName: name,
          experimentArguments: args,
          controlResult,
          candidateResult,
          controlError,
          candidateError
        });
      }
    }

    if (isEnabled) {
      // Run in parallel
      [candidateResult, controlResult] = await Promise.all([
        candidate(...args).catch(e => {
          candidateError = e;
          return undefined;
        }),
        control(...args).catch(e => {
          controlError = e;
          return undefined;
        })
      ]);
    } else {
      controlResult = await control(...args).catch(e => {
        controlError = e;
        return undefined;
      });
    }

    publishResults();

    if (controlError) {
      throw controlError;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return controlResult!;
  };
}
