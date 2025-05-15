import {
	loggerDebug,
	loggerError,
	loggerInfo,
	loggerSilly,
	loggerWarn,
} from '@maur025/core-logger';
import { LogEntry, logLevel } from 'kafkajs';

export const kafkaLogEntryHandler = (
	{ level, log }: LogEntry,
	logIdentifier: string
) => {
	switch (level) {
		case logLevel.ERROR: {
			loggerError(`[${logIdentifier}] ${log.message}`, log.error);
			break;
		}
		case logLevel.WARN: {
			loggerWarn(`[${logIdentifier}] ${log.message}`);
			break;
		}
		case logLevel.INFO: {
			loggerInfo(`[${logIdentifier}] ${log.message}`);
			break;
		}
		case logLevel.DEBUG: {
			loggerDebug(`[${logIdentifier}] ${log.message}`);
			break;
		}
		default:
			loggerSilly(`[${logIdentifier}] ${log.message}`);
	}
};
