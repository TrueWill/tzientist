import { defaultOptions, defaultPublish, Options, PerformanceApi } from ".";
import { ExperimentSyncFunction } from "./experiment";

export type ExperimentAsyncFunction<TParams extends any[], TResult> =
  ExperimentSyncFunction<TParams, Promise<TResult>>;


export interface ExperimentAsyncParams<TParams extends any[], TResult> {
  name: string;
  control: ExperimentAsyncFunction<TParams, TResult>;
  candidate: ExperimentAsyncFunction<TParams, TResult>;
  options?: Options<TParams, TResult>;
}

async function executeAndTime<TParams extends any[], TResult>(
  performance: PerformanceApi,
  controlOrCandidate: ExperimentAsyncFunction<TParams, TResult>,
  args: TParams
): Promise<[TResult, number]> {
  // Not using bigint version of hrtime for Node 8 compatibility
  const startTime = performance.now()
  const result = await controlOrCandidate(...args);
  const stopTime = performance.now()
  const timeMs = stopTime - startTime
  return [result, timeMs];
}

/**
 * A factory that creates an asynchronous experiment function.
 *
 * @param name - The name of the experiment, typically for use in publish.
 * @param control - The legacy async function you are trying to replace.
 * @param candidate - The new async function intended to replace the control.
 * @param [options] - Options for the experiment. You will usually want to specify a publish function.
 * @returns An async function that acts like the control while also running the candidate and publishing results.
 */
export function unconfiguredExperimentAsync({
  performance
}: {
  performance: PerformanceApi
}) {
  return function<TParams extends any[], TResult> ({
    name,
    control,
    candidate,
    options = defaultOptions
  }: ExperimentAsyncParams<TParams, TResult>): ExperimentAsyncFunction<TParams, TResult> {
    const publish = options.publish || defaultPublish;

    return async (...args): Promise<TResult> => {
      let controlResult: TResult | undefined;
      let candidateResult: TResult | undefined;
      let controlError: any;
      let candidateError: any;
      let controlTimeMs: number | undefined;
      let candidateTimeMs: number | undefined;
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
        // Run in parallel
        [[candidateResult, candidateTimeMs], [controlResult, controlTimeMs]] =
          await Promise.all([
            executeAndTime(performance, candidate, args).catch((e) => {
              candidateError = e;
              return [undefined, undefined];
            }),
            executeAndTime(performance, control, args).catch((e) => {
              controlError = e;
              return [undefined, undefined];
            })
          ]);
      } else {
        controlResult = await control(...args).catch((e) => {
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
}