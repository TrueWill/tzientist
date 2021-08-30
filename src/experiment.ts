import { defaultOptions, defaultPublish, Options, PerformanceApi } from ".";

export type ExperimentSyncFunction<TParams extends any[], TResult> = (
  ...args: TParams
) => TResult;


export interface ExperimentSyncParams<TParams extends any[], TResult> {
  name: string;
  control: ExperimentSyncFunction<TParams, TResult>;
  candidate: ExperimentSyncFunction<TParams, TResult>;
  options?: Options<TParams, TResult>;
}

/**
 * A factory that creates an experiment function.
 *
 * @param name - The name of the experiment, typically for use in publish.
 * @param control - The legacy function you are trying to replace.
 * @param candidate - The new function intended to replace the control.
 * @param [options] - Options for the experiment. You will usually want to specify a publish function.
 * @returns A function that acts like the control while also running the candidate and publishing results.
 */

export function unconfiguredExperimentSync({
  performance
}: {
  performance: PerformanceApi
}) {
  return function <TParams extends any[], TResult>({
    name,
    control,
    candidate,
    options = defaultOptions
  }: ExperimentSyncParams<TParams, TResult>): ExperimentSyncFunction<TParams, TResult> {
    const publish = options.publish || defaultPublish;

    return (...args): TResult => {
      let controlResult: TResult | undefined;
      let candidateResult: TResult | undefined;
      let controlError: any;
      let candidateError: any;
      let controlTimeMs: number;
      let candidateTimeMs: number;
      const isEnabled: boolean = !options.enabled || options.enabled(...args);

      function publishResults(): void {
        if (isEnabled) {
          publish({
            experimentName: name,
            experimentArguments: args,
            controlResult,
            candidateResult,
            controlError,
            candidateError,
            controlTimeMs,
            candidateTimeMs
          });
        }
      }

      if (isEnabled) {
        try {
          // Not using bigint version of hrtime for Node 8 compatibility
          const candidateStartTime = performance.now()
          candidateResult = candidate(...args);
          const candidateStopTime = performance.now()
          candidateTimeMs = candidateStopTime - candidateStartTime
        } catch (e) {
          candidateError = e;
        }
      }

      try {
        const controlStartTime = performance.now()
        controlResult = control(...args);
        const controlStopTime = performance.now()
        controlTimeMs = controlStopTime - controlStartTime
      } catch (e) {
        controlError = e;
        publishResults();
        throw e;
      }

      publishResults();
      return controlResult;
    };
  }
}