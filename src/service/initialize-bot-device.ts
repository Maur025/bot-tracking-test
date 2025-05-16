import { devicePublisher } from 'kafka-main/publisher/device-publisher';
import { randomNumberBetweenDigits } from 'util/random-number-between-digits';
import { DeviceService } from './device-service';

const IMEI_PREFIX = '35046350';
const DEVICE_QUANTITY = 50;

export const initializeBotDevice = async (): Promise<void> => {
	const deviceService = new DeviceService();

	const imeiList: number[] = createDevices(DEVICE_QUANTITY);

	for (const imei of imeiList) {
		await deviceService.save({
			imei: imei.toString(),
			referenceCaptureId: imei.toString(16),
			name: `device-bot-${imei.toString(16)}`,
			plaque: 'ABC 1234',
		});

		await devicePublisher({
			deviceId: imei.toString(16),
			imei: imei,
		});
	}
};

const createDevices = (quantity: number): number[] => {
	let imeiList: number[] = [];

	for (let index = 1; index <= quantity; index++) {
		const imeiStr: string = `${IMEI_PREFIX}${randomNumberBetweenDigits(1, 7)}`;
		console.log(imeiStr);
		imeiList = [...imeiList, Number(imeiStr)];
	}

	return imeiList;
};
