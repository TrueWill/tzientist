import * as scientist from './index';

describe('Experiment', () => {
  describe('when functions are equivalent', () => {
    function sum(a: number, b: number): number {
      return a + b;
    }

    function sum2(a: number, b: number): number {
      return b + a;
    }

    it('should return result', () => {
      const experiment = scientist.experiment({
        name: 'equivalent1',
        control: sum,
        candidate: sum2
      });

      const result: number = experiment(1, 2);

      expect(result).toBe(3);
    });
  });

  describe('when function results differ', () => {
    function ctrl(s: string): string {
      return `Ctrl+${s}`;
    }

    function candi(s: string): string {
      return s;
    }

    it('should return result of control', () => {
      const experiment = scientist.experiment({
        name: 'differ1',
        control: ctrl,
        candidate: candi
      });

      const result: string = experiment('C');

      expect(result).toBe('Ctrl+C');
    });
  });
});
