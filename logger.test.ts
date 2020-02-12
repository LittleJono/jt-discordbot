import * as logger from './logger';

describe('tests for the logger functions', () => {
  it('constructLogMessage', () => {
    jest.spyOn(global.Date, 'now').mockImplementationOnce(() => new Date('2019-05-14T11:01:58.135Z').valueOf());
    expect(logger.constructLogMessage('info', 'hello world')).toEqual(
      '| info | 2019-05-14T11:01:58.135Z |: hello world\n\n',
    );
  });

  describe('testing getting log message', () => {
    it('testing string as input', () => {
      expect(logger.extractRawLogMessage('hello world')).toEqual('hello world');
    });

    it('testing error as input with stack', () => {
      const error = new Error('also hello world');
      expect(logger.extractRawLogMessage(error)).toEqual(error.stack);
    });

    it('testing error as input without stack', () => {
      const error = new Error('also hello world');
      error.stack = undefined;
      expect(logger.extractRawLogMessage(error)).toEqual('also hello world');
    });
  });
});
