import * as scientist from './index';

describe('experiment', () => {
  const publishMock: jest.Mock<void, [scientist.Results<any[], any>]> = jest.fn<
    void,
    [scientist.Results<any[], any>]
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
        candidate: sum2,
        options: {
          publish: publishMock
        }
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
      expect(results.experimentArguments).toEqual([1, 2]);
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
      expect(results.experimentArguments).toEqual(['C']);
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
      expect(results.experimentArguments).toEqual([]);
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
      expect(results.experimentArguments).toEqual([]);
      expect(results.controlResult).toBeUndefined();
      expect(results.candidateResult).toBe('Kane');
      expect(results.controlError).toBeDefined();
      expect(results.controlError.message).toBe('Kaos!');
      expect(results.candidateError).toBeUndefined();
    });
  });

  describe('when enabled option is specified', () => {
    const candidateMock: jest.Mock<string, [string]> = jest.fn<
      string,
      [string]
    >();

    afterEach(() => {
      candidateMock.mockClear();
    });

    describe('when control does not throw', () => {
      function ctrl(s: string): string {
        return `Ctrl+${s}`;
      }

      describe('when enabled returns false', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        function enabled(_: string): boolean {
          return false;
        }

        it('should not run candidate', () => {
          const experiment = scientist.experiment({
            name: 'disabled1',
            control: ctrl,
            candidate: candidateMock,
            options: {
              publish: publishMock,
              enabled
            }
          });

          experiment('C');

          expect(candidateMock.mock.calls.length).toBe(0);
        });

        it('should return result of control', () => {
          const experiment = scientist.experiment({
            name: 'disabled2',
            control: ctrl,
            candidate: candidateMock,
            options: {
              publish: publishMock,
              enabled
            }
          });

          const result: string = experiment('C');

          expect(result).toBe('Ctrl+C');
        });

        it('should not publish results', () => {
          const experiment = scientist.experiment({
            name: 'disabled3',
            control: ctrl,
            candidate: candidateMock,
            options: {
              publish: publishMock,
              enabled
            }
          });

          experiment('C');

          expect(publishMock.mock.calls.length).toBe(0);
        });
      });

      describe('when enabled returns true', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        function enabled(_: string): boolean {
          return true;
        }

        it('should run candidate', () => {
          const experiment = scientist.experiment({
            name: 'enabled1',
            control: ctrl,
            candidate: candidateMock,
            options: {
              publish: publishMock,
              enabled
            }
          });

          experiment('C');

          expect(candidateMock.mock.calls.length).toBe(1);
        });

        it('should return result of control', () => {
          const experiment = scientist.experiment({
            name: 'enabled2',
            control: ctrl,
            candidate: candidateMock,
            options: {
              publish: publishMock,
              enabled
            }
          });

          const result: string = experiment('C');

          expect(result).toBe('Ctrl+C');
        });

        it('should publish results', () => {
          const experiment = scientist.experiment({
            name: 'enabled3',
            control: ctrl,
            candidate: candidateMock,
            options: {
              publish: publishMock,
              enabled
            }
          });

          experiment('C');

          expect(publishMock.mock.calls.length).toBe(1);
        });
      });

      describe('when enabled function specified', () => {
        it('should pass experiment params to enabled', () => {
          const enabledMock: jest.Mock<boolean, [string]> = jest
            .fn<boolean, [string]>()
            .mockReturnValue(false);

          const experiment = scientist.experiment({
            name: 'paramsToEnabled',
            control: ctrl,
            candidate: candidateMock,
            options: {
              publish: publishMock,
              enabled: enabledMock
            }
          });

          experiment('myparam');

          expect(enabledMock.mock.calls.length).toBe(1);
          expect(enabledMock.mock.calls[0][0]).toBe('myparam');
        });
      });
    });

    describe('when control throws', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      function ctrl(_: string): string {
        throw new Error('Kaos!');
      }

      describe('when enabled returns false', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        function enabled(_: string): boolean {
          return false;
        }

        it('should throw', () => {
          const experiment = scientist.experiment({
            name: 'disabledthrow1',
            control: ctrl,
            candidate: candidateMock,
            options: {
              publish: publishMock,
              enabled
            }
          });

          expect(() => experiment('C')).toThrowError('Kaos!');
        });

        it('should not run candidate', () => {
          const experiment = scientist.experiment({
            name: 'disabledthrow2',
            control: ctrl,
            candidate: candidateMock,
            options: {
              publish: publishMock,
              enabled
            }
          });

          try {
            experiment('C');
          } catch {
            // swallow error
          }

          expect(candidateMock.mock.calls.length).toBe(0);
        });

        it('should not publish results', () => {
          const experiment = scientist.experiment({
            name: 'disabledthrow3',
            control: ctrl,
            candidate: candidateMock,
            options: {
              publish: publishMock,
              enabled
            }
          });

          try {
            experiment('C');
          } catch {
            // swallow error
          }

          expect(publishMock.mock.calls.length).toBe(0);
        });
      });
    });
  });

  describe('when default options are used', () => {
    function ctrl(): number {
      return 1;
    }

    function candi(): number {
      return 2;
    }

    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe('when no options are specified', () => {
      it('should use sensible defaults', () => {
        const experiment = scientist.experiment({
          name: 'no1',
          control: ctrl,
          candidate: candi
        });

        experiment();

        expect(consoleSpy.mock.calls.length).toBe(1);
        expect(consoleSpy.mock.calls[0][0]).toBe(
          'Experiment no1: difference found'
        );
      });
    });

    describe('when only publish option is specified', () => {
      it('should enable experiment', () => {
        const experiment = scientist.experiment({
          name: 'opt1',
          control: ctrl,
          candidate: candi,
          options: {
            publish: publishMock
          }
        });

        experiment();

        expect(publishMock.mock.calls.length).toBe(1);
        const results = publishMock.mock.calls[0][0];
        expect(results.controlResult).toBe(1);
        expect(results.candidateResult).toBe(2);
      });
    });

    describe('when only enabled option is specified', () => {
      it('should use default publish', () => {
        const experiment = scientist.experiment({
          name: 'opt2',
          control: ctrl,
          candidate: candi,
          options: {
            enabled: (): boolean => true
          }
        });

        experiment();

        expect(consoleSpy.mock.calls.length).toBe(1);
        expect(consoleSpy.mock.calls[0][0]).toBe(
          'Experiment opt2: difference found'
        );
      });

      it('should respect enabled', () => {
        const candidateMock: jest.Mock<number, []> = jest.fn<number, []>();

        const experiment = scientist.experiment({
          name: 'opt3',
          control: ctrl,
          candidate: candidateMock,
          options: {
            enabled: (): boolean => false
          }
        });

        experiment();

        expect(consoleSpy.mock.calls.length).toBe(0);
        expect(candidateMock.mock.calls.length).toBe(0);
      });
    });
  });
});

describe('experimentAsync', () => {
  const sleep = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

  describe('when functions are equivalent', () => {
    const publishMock: jest.Mock<
      void,
      [scientist.Results<[number, number], number>]
    > = jest.fn<void, [scientist.Results<[number, number], number>]>();

    afterEach(() => {
      publishMock.mockClear();
    });

    async function sum(a: number, b: number): Promise<number> {
      await sleep(250);
      return a + b;
    }

    async function sum2(a: number, b: number): Promise<number> {
      await sleep(125);
      return b + a;
    }

    it('should await result', async () => {
      const experiment = scientist.experimentAsync({
        name: 'async equivalent1',
        control: sum,
        candidate: sum2,
        options: {
          publish: publishMock
        }
      });

      const result: number = await experiment(1, 2);

      expect(result).toBe(3);
    });

    it('should publish results', async () => {
      const experiment = scientist.experimentAsync({
        name: 'async equivalent2',
        control: sum,
        candidate: sum2,
        options: {
          publish: publishMock
        }
      });

      await experiment(1, 2);

      expect(publishMock.mock.calls.length).toBe(1);
      const results = publishMock.mock.calls[0][0];
      expect(results.experimentName).toBe('async equivalent2');
      expect(results.experimentArguments).toEqual([1, 2]);
      expect(results.controlResult).toBe(3);
      expect(results.candidateResult).toBe(3);
      expect(results.controlError).toBeUndefined();
      expect(results.candidateError).toBeUndefined();
    });
  });

  describe('when function results differ', () => {
    const publishMock: jest.Mock<
      void,
      [scientist.Results<[string], string>]
    > = jest.fn<void, [scientist.Results<[string], string>]>();

    afterEach(() => {
      publishMock.mockClear();
    });

    async function ctrl(s: string): Promise<string> {
      await sleep(250);
      return `Ctrl+${s}`;
    }

    async function candi(s: string): Promise<string> {
      await sleep(125);
      return s;
    }

    it('should await result of control', async () => {
      const experiment = scientist.experimentAsync({
        name: 'async differ1',
        control: ctrl,
        candidate: candi,
        options: {
          publish: publishMock
        }
      });

      const result: string = await experiment('C');

      expect(result).toBe('Ctrl+C');
    });

    it('should publish results', async () => {
      const experiment = scientist.experimentAsync({
        name: 'async differ2',
        control: ctrl,
        candidate: candi,
        options: {
          publish: publishMock
        }
      });

      await experiment('C');

      expect(publishMock.mock.calls.length).toBe(1);
      const results = publishMock.mock.calls[0][0];
      expect(results.experimentName).toBe('async differ2');
      expect(results.experimentArguments).toEqual(['C']);
      expect(results.controlResult).toBe('Ctrl+C');
      expect(results.candidateResult).toBe('C');
      expect(results.controlError).toBeUndefined();
      expect(results.candidateError).toBeUndefined();
    });
  });

  describe('when candidate rejects', () => {
    const publishMock: jest.Mock<
      void,
      [scientist.Results<[], string>]
    > = jest.fn<void, [scientist.Results<[], string>]>();

    afterEach(() => {
      publishMock.mockClear();
    });

    async function ctrl(): Promise<string> {
      await sleep(125);
      return 'Everything is under control';
    }

    async function candi(): Promise<string> {
      return Promise.reject(new Error("Candy I can't let you go"));
    }

    it('should await result of control', async () => {
      const experiment = scientist.experimentAsync({
        name: 'async throw1',
        control: ctrl,
        candidate: candi,
        options: {
          publish: publishMock
        }
      });

      const result: string = await experiment();

      expect(result).toBe('Everything is under control');
    });

    it('should publish results', async () => {
      const experiment = scientist.experimentAsync({
        name: 'async throw2',
        control: ctrl,
        candidate: candi,
        options: {
          publish: publishMock
        }
      });

      await experiment();

      expect(publishMock.mock.calls.length).toBe(1);
      const results = publishMock.mock.calls[0][0];
      expect(results.experimentName).toBe('async throw2');
      expect(results.experimentArguments).toEqual([]);
      expect(results.controlResult).toBe('Everything is under control');
      expect(results.candidateResult).toBeUndefined();
      expect(results.controlError).toBeUndefined();
      expect(results.candidateError).toBeDefined();
      expect(results.candidateError.message).toBe("Candy I can't let you go");
    });
  });

  describe('when control rejects', () => {
    const publishMock: jest.Mock<
      void,
      [scientist.Results<[], string>]
    > = jest.fn<void, [scientist.Results<[], string>]>();

    afterEach(() => {
      publishMock.mockClear();
    });

    async function ctrl(): Promise<string> {
      throw new Error('Kaos!');
    }

    async function candi(): Promise<string> {
      await sleep(125);
      return 'Kane';
    }

    it('should reject', () => {
      const experiment = scientist.experimentAsync({
        name: 'async cthrow1',
        control: ctrl,
        candidate: candi,
        options: {
          publish: publishMock
        }
      });

      return expect(experiment()).rejects.toMatchObject({ message: 'Kaos!' });
    });

    it('should publish results', async () => {
      const experiment = scientist.experimentAsync({
        name: 'async cthrow2',
        control: ctrl,
        candidate: candi,
        options: {
          publish: publishMock
        }
      });

      try {
        await experiment();
      } catch {
        // swallow error
      }

      expect(publishMock.mock.calls.length).toBe(1);
      const results = publishMock.mock.calls[0][0];
      expect(results.experimentName).toBe('async cthrow2');
      expect(results.experimentArguments).toEqual([]);
      expect(results.controlResult).toBeUndefined();
      expect(results.candidateResult).toBe('Kane');
      expect(results.controlError).toBeDefined();
      expect(results.controlError.message).toBe('Kaos!');
      expect(results.candidateError).toBeUndefined();
    });
  });

  describe('when enabled option is specified', () => {
    const publishMock: jest.Mock<
      void,
      [scientist.Results<[string], string>]
    > = jest.fn<void, [scientist.Results<[string], string>]>();

    const candidateMock: jest.Mock<Promise<string>, [string]> = jest.fn<
      Promise<string>,
      [string]
    >();

    afterEach(() => {
      publishMock.mockClear();
      candidateMock.mockClear();
    });

    describe('when enabled returns false', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      function enabled(_: string): boolean {
        return false;
      }

      describe('when control resolves', () => {
        async function ctrl(s: string): Promise<string> {
          await sleep(125);
          return `Ctrl+${s}`;
        }

        it('should not run candidate', async () => {
          const experiment = scientist.experimentAsync({
            name: 'async disabled1',
            control: ctrl,
            candidate: candidateMock,
            options: {
              publish: publishMock,
              enabled
            }
          });

          await experiment('C');

          expect(candidateMock.mock.calls.length).toBe(0);
        });

        it('should await result of control', async () => {
          const experiment = scientist.experimentAsync({
            name: 'async disabled2',
            control: ctrl,
            candidate: candidateMock,
            options: {
              publish: publishMock,
              enabled
            }
          });

          const result: string = await experiment('C');

          expect(result).toBe('Ctrl+C');
        });

        it('should not publish results', async () => {
          const experiment = scientist.experimentAsync({
            name: 'async disabled3',
            control: ctrl,
            candidate: candidateMock,
            options: {
              publish: publishMock,
              enabled
            }
          });

          await experiment('C');

          expect(publishMock.mock.calls.length).toBe(0);
        });
      });

      describe('when control rejects', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async function ctrl(_: string): Promise<string> {
          throw new Error('Kaos!');
        }

        it('should reject', () => {
          const experiment = scientist.experimentAsync({
            name: 'async cthrow1',
            control: ctrl,
            candidate: candidateMock,
            options: {
              publish: publishMock,
              enabled
            }
          });

          return expect(experiment('C')).rejects.toMatchObject({
            message: 'Kaos!'
          });
        });

        it('should not run candidate', async () => {
          const experiment = scientist.experimentAsync({
            name: 'async disabledthrow2',
            control: ctrl,
            candidate: candidateMock,
            options: {
              publish: publishMock,
              enabled
            }
          });

          try {
            await experiment('C');
          } catch {
            // swallow error
          }

          expect(candidateMock.mock.calls.length).toBe(0);
        });

        it('should not publish results', async () => {
          const experiment = scientist.experimentAsync({
            name: 'async disabledthrow3',
            control: ctrl,
            candidate: candidateMock,
            options: {
              publish: publishMock,
              enabled
            }
          });

          try {
            await experiment('C');
          } catch {
            // swallow error
          }

          expect(publishMock.mock.calls.length).toBe(0);
        });
      });
    });
  });

  describe('when functions are slow', () => {
    const publishMock: jest.Mock<
      void,
      [scientist.Results<[], string>]
    > = jest.fn<void, [scientist.Results<[], string>]>();

    afterEach(() => {
      publishMock.mockClear();
    });

    const msPerFunction = 1000;

    async function ctrl(): Promise<string> {
      await sleep(msPerFunction);
      return 'Control';
    }

    async function candi(): Promise<string> {
      await sleep(msPerFunction);
      return 'Candidate';
    }

    it('should run functions in parallel', async () => {
      const nsPerMs = 1000000;
      const allowedOverhead = 125;

      const experiment = scientist.experimentAsync({
        name: 'async parallel1',
        control: ctrl,
        candidate: candi,
        options: {
          publish: publishMock
        }
      });

      const start = process.hrtime.bigint();
      await experiment();
      const end = process.hrtime.bigint();

      const elapsedMs = Number((end - start) / BigInt(nsPerMs));

      expect(elapsedMs).toBeLessThan(msPerFunction + allowedOverhead);
    });
  });
});
