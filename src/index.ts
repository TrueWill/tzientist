import { unconfiguredExperimentSync } from "./experiment";
import { unconfiguredExperimentAsync } from "./experimentAsync";

declare const window: any; // Used to detect usage in a browser
declare const self: any; // Used to detect usage in a web worker
declare const perf_hooks: any; // Used to detect usage in node

/**
 * Returns the performance API object depending of the current execution context ; 
 * - Browsers & Web Workers: https://developer.mozilla.org/en-US/docs/Web/API/Performance
 * - Node : https://nodejs.org/api/perf_hooks.html#perf_hooks_perf_hooks_performance
 * 
 * @returns an instance of the performance API 
 */
function getPerformanceApi() {
  if (typeof window !== 'undefined') {
    return window.performance
  }
  if (typeof self !== 'undefined') {
    return self.performance
  }
  if (typeof perf_hooks !== 'undefined') {
    return perf_hooks.performance
  }

  throw new Error('No performance API found')
}

/**
 * Common interface for the performance Api we retrieve for different execution context
 */
export interface PerformanceApi {
  now: () => number
}

export interface Results<TParams extends any[], TResult> {
  experimentName: string;
  experimentArguments: TParams;
  controlResult?: TResult;
  candidateResult?: TResult;
  controlError?: any;
  candidateError?: any;
  controlTimeMs?: number;
  candidateTimeMs?: number;
}

export interface Options<TParams extends any[], TResult> {
  publish?: (results: Results<TParams, TResult>) => void;
  enabled?: (...args: TParams) => boolean;
}

export function hrtimeToMs(hrtime: [number, number]): number {
  const MS_PER_SEC = 1000;
  const NS_PER_MS = 1e6;
  const [seconds, nanoseconds] = hrtime;
  return seconds * MS_PER_SEC + nanoseconds / NS_PER_MS;
}

export function defaultPublish<TParams extends any[], TResult>(
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

export const defaultOptions = {
  publish: defaultPublish
};

export const experiment = unconfiguredExperimentSync({ performance: getPerformanceApi() })
export const experimentAsync = unconfiguredExperimentAsync({ performance: getPerformanceApi() })