import * as scientist from './index';

describe('Experiment', () => {
  const publishMock: jest.Mock<void, [scientist.Results<any>]> = jest.fn<
    void,
    [scientist.Results<any>]
  >();

  afterEach(() => {
    publishMock.mockClear();
  });

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

    it('should publish results', () => {
      const experiment = scientist.experiment({
        name: 'equivalent2',
        control: sum,
        candidate: sum2,
        options: {
          publish: publishMock
        }
      });

      experiment(1, 2);

      expect(publishMock.mock.calls.length).toBe(1);
      const results = publishMock.mock.calls[0][0];
      expect(results.experimentName).toBe('equivalent2');
      expect(results.controlResult).toBe(3);
      expect(results.candidateResult).toBe(3);
      expect(results.controlError).toBeUndefined();
      expect(results.candidateError).toBeUndefined();
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
        candidate: candi,
        options: {
          publish: publishMock
        }
      });

      const result: string = experiment('C');

      expect(result).toBe('Ctrl+C');
    });

    it('should publish results', () => {
      const experiment = scientist.experiment({
        name: 'differ2',
        control: ctrl,
        candidate: candi,
        options: {
          publish: publishMock
        }
      });

      experiment('C');

      expect(publishMock.mock.calls.length).toBe(1);
      const results = publishMock.mock.calls[0][0];
      expect(results.experimentName).toBe('differ2');
      expect(results.controlResult).toBe('Ctrl+C');
      expect(results.candidateResult).toBe('C');
      expect(results.controlError).toBeUndefined();
      expect(results.candidateError).toBeUndefined();
    });
  });

  describe('when candidate throws', () => {
    function ctrl(): string {
      return 'Everything is under control';
    }

    function candi(): string {
      throw new Error("Candy I can't let you go");
    }

    it('should return result of control', () => {
      const experiment = scientist.experiment({
        name: 'throw1',
        control: ctrl,
        candidate: candi,
        options: {
          publish: publishMock
        }
      });

      const result: string = experiment();

      expect(result).toBe('Everything is under control');
    });

    it('should publish results', () => {
      const experiment = scientist.experiment({
        name: 'throw2',
        control: ctrl,
        candidate: candi,
        options: {
          publish: publishMock
        }
      });

      experiment();

      expect(publishMock.mock.calls.length).toBe(1);
      const results = publishMock.mock.calls[0][0];
      expect(results.experimentName).toBe('throw2');
      expect(results.controlResult).toBe('Everything is under control');
      expect(results.candidateResult).toBeUndefined();
      expect(results.controlError).toBeUndefined();
      expect(results.candidateError).toBeDefined();
      expect(results.candidateError.message).toBe("Candy I can't let you go");
    });
  });

  describe('when control throws', () => {
    function ctrl(): string {
      throw new Error('Kaos!');
    }

    function candi(): string {
      return 'Kane';
    }

    it('should throw', () => {
      const experiment = scientist.experiment({
        name: 'cthrow1',
        control: ctrl,
        candidate: candi,
        options: {
          publish: publishMock
        }
      });

      expect(() => experiment()).toThrowError('Kaos!');
    });

    it('should publish results', () => {
      const experiment = scientist.experiment({
        name: 'cthrow2',
        control: ctrl,
        candidate: candi,
        options: {
          publish: publishMock
        }
      });

      try {
        experiment();
      } catch {
        // swallow error
      }

      expect(publishMock.mock.calls.length).toBe(1);
      const results = publishMock.mock.calls[0][0];
      expect(results.experimentName).toBe('cthrow2');
      expect(results.controlResult).toBeUndefined();
      expect(results.candidateResult).toBe('Kane');
      expect(results.controlError).toBeDefined();
      expect(results.controlError.message).toBe('Kaos!');
      expect(results.candidateError).toBeUndefined();
    });
  });
});
