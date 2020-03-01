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

    let publishMock: jest.Mock<void, [scientist.Result<string>]>;

    beforeEach(() => {
      publishMock = jest.fn<void, [scientist.Result<string>]>();
    });

    it('should return result of control', () => {
      const experiment = scientist.experiment({
        name: 'differ1',
        control: ctrl,
        candidate: candi,
        options: {
          publish: publishMock
        }
      });

      const result: string = experiment('C');

      expect(result).toBe('Ctrl+C');
    });

    it('should publish result', () => {
      const experiment = scientist.experiment({
        name: 'differ1',
        control: ctrl,
        candidate: candi,
        options: {
          publish: publishMock
        }
      });

      experiment('C');

      expect(publishMock.mock.calls.length).toBe(1);
      const result = publishMock.mock.calls[0][0];
      expect(result.experimentName).toBe('differ1');
      expect(result.controlResult).toBe('Ctrl+C');
      expect(result.candidateResult).toBe('C');
    });
  });
});
