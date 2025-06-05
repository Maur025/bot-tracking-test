import { loggerError } from '@maur025/core-logger';

interface Request {
	interval: number;
	lastActionDate: number;
	action: () => void | Promise<void>;
	units?: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days';
}

export const programAction = async ({
	interval,
	lastActionDate,
	action,
	units = 'seconds',
}: Request): Promise<NodeJS.Timeout | null> => {
	if (!interval || interval <= 0) {
		loggerError(`invalid interval, skiping ...`);
		return null;
	}

	const intervalInMillis: number = getMilliseconds(interval, units);
	let currentTimeout = null;
	let nextLastActionDate = lastActionDate;

	try {
		const now = Date.now();

		if (now - lastActionDate >= intervalInMillis) {
			await action();
			nextLastActionDate = now;
		}
	} catch (error) {
		loggerError(`Error to execute action, ${error?.toString()}`);
	} finally {
		currentTimeout = setTimeout(
			() =>
				programAction({
					interval,
					lastActionDate: nextLastActionDate,
					action,
					units,
				}),
			intervalInMillis
		);
	}

	return currentTimeout;
};

export const getMilliseconds = (
	time: number,
	units: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days'
) => {
	switch (units) {
		case 'seconds':
			return getMilliOfSeconds(time);
		case 'minutes':
			return getMilliOfMinutes(time);
		case 'hours':
			return getMilliOfHours(time);
		case 'days':
			return getMilliOfDays(time);
		case 'milliseconds':
			return time;
	}
};

const getMilliOfSeconds = (seconds: number): number => seconds * 1000;

const getMilliOfMinutes = (minutes: number): number =>
	60 * getMilliOfSeconds(minutes);

const getMilliOfHours = (hours: number): number =>
	60 * getMilliOfMinutes(hours);

const getMilliOfDays = (days: number): number => 24 * getMilliOfHours(days);
