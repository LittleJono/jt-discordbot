import _ from 'lodash';
import fs from 'fs';

const logLevel = _.get(process.env, 'LOG_LEVEL', 'info');
const levels = ['error', 'info', 'debug'];
const levelsAfterTrimming = _.dropRightWhile(levels, (x) => x !== logLevel);

const logStream = fs.createWriteStream('botLogs.txt', { flags: 'a' });

logStream.on('error', (reallyReallyBadError) => {
  console.log(`yeah the logger died which is probably bad: ${reallyReallyBadError}`);
});

const defaultLoggers = {
  error: _.noop,
  info: _.noop,
  debug: _.noop,
};

export interface EnabledLoggers {
  [levels: string]: (arg0: string) => void;
}

export const constructLogMessage = (loggerName: string, input: string): string => {
  const currentTime = new Date(Date.now()).toISOString();
  return `| ${loggerName} | ${currentTime} |: ${input}\n\n`;
};

export const extractRawLogMessage = (input: string | Error): string => {
  if (typeof input === 'string') {
    return input;
  }
  if (input.stack) {
    return input.stack;
  }
  return input.message;
};

export const writeLogToFile = (logMessage: string): void => {
  logStream.write(logMessage);
};

export const writeLogToConsole = (logMessage: string): void => {
  console.log(logMessage);
};

export const createNewLogger = (loggerName: string) => (input: string | Error): void => {
  const rawLogMessage = extractRawLogMessage(input);
  const logMessage = constructLogMessage(loggerName, rawLogMessage);
  writeLogToConsole(logMessage);
  writeLogToFile(logMessage);
};

export const getEnabledLoggers = (enabledLevels: string[]): EnabledLoggers => enabledLevels.reduce(
  (loggerObject, loggerToEnable) => ({ ...loggerObject, [loggerToEnable]: createNewLogger(loggerToEnable) }),
  {},
);

const enabledLoggers = getEnabledLoggers(levelsAfterTrimming);

export const log = { ...defaultLoggers, ...enabledLoggers };
