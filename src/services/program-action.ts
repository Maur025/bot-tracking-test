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
}: Request): Promise<void> => {
	if (!interval || interval <= 0) {
		loggerError(`invalid interval, skiping ...`);
		return;
	}

	const intervalInMillis: number = getMilliseconds(interval, units);

	try {
		const now = Date.now();

		if (now - lastActionDate >= intervalInMillis) {
			await action();
			lastActionDate = now;
		}
	} catch (error) {
		loggerError(`Error to execute action, ${error?.toString()}`);
	} finally {
		setTimeout(
			() =>
				programAction({
					interval,
					lastActionDate,
					action,
					units,
				}),
			intervalInMillis
		);
	}
};

const getMilliseconds = (
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
