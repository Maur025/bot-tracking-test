import { devicePublisher } from 'kafka-main/publisher/device-publisher';
import { deviceService } from './device-service';
import { generateBotDevice } from './generate-bot-device';
import { IDevice } from '@models/schema/device-schema';

const DEVICE_QUANTITY = 50;

export const initializeBotDevice = async (): Promise<void> => {
	await generateBotDevice(DEVICE_QUANTITY);

	const deviceList: IDevice[] = await deviceService.findAll();

	for (const device of deviceList) {
		await devicePublisher({
			...device.toObject(),
		});
	}
};
