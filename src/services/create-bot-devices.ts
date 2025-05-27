import { deviceService } from './database/device-service';
import { IDevice } from '@models/schema/device-schema';
import { loggerError } from '@maur025/core-logger';
import { randomNumberBetweenDigits } from '@utils/random-number-between-digits';

const IMEI_PREFIX = '35046350';

export const createBotDevices = async (quantity: number): Promise<void> => {
	for (let index = 1; index <= quantity; index++) {
		let imeiStr: string;
		let isWellCreated = false;
		let attempt: number = 0;

		while (!isWellCreated && attempt < 50) {
			attempt++;

			const generatedNumber: number = randomNumberBetweenDigits(1, 7);
			imeiStr = `${IMEI_PREFIX}${generatedNumber}`;

			const deviceWithGeneratedImei: IDevice | null =
				await deviceService.findByImei(imeiStr);

			if (!deviceWithGeneratedImei) {
				await deviceService.save({
					imei: imeiStr,
					referenceCaptureId: Number(imeiStr).toString(16),
					name: `device-bot ${generatedNumber}`,
					plaque: 'ABC 1234',
					icon: 'fa-car-side',
					lastPosition: {
						type: 'Point',
						coordinates: [0, 0],
					},
				});

				isWellCreated = true;
			}
		}

		if (!isWellCreated) {
			loggerError(`Can't create device in ${attempt} attempts`);
		}
	}
};
