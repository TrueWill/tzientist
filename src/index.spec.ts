import * as scientist from './index';

function sum(a: number, b: number): number {
  return a + b;
}

function sum2(a: number, b: number): number {
  return b + a;
}

describe('Experiment', () => {
  it('should be identical when functions are equivalent', () => {
    const experiment = scientist.experiment({
      name: 'test',
      use: sum,
      check: sum2
    });

    const result: number = experiment(1, 2);

    expect(result).toBe(3);
  });
});
