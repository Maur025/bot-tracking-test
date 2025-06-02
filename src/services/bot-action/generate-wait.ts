export const generateWait = (
	timeToWait: number,
	unit: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days'
): Date => {
	const dateNow: Date = new Date();

	switch (unit) {
		case 'milliseconds': {
			dateNow.setMilliseconds(dateNow.getMilliseconds() + timeToWait);

			break;
		}
		case 'seconds': {
			dateNow.setSeconds(dateNow.getSeconds() + timeToWait);

			break;
		}
		case 'minutes': {
			dateNow.setMinutes(dateNow.getMinutes() + timeToWait);

			break;
		}
		case 'hours': {
			dateNow.setHours(dateNow.getHours() + timeToWait);

			break;
		}
		case 'days': {
			dateNow.setDate(dateNow.getDate() + timeToWait);

			break;
		}
	}

	return dateNow;
};
