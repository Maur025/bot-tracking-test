import { devicePublisher } from 'kafka-main/publisher/device-publisher';
import { deviceService } from './database/device-service';
import { generateBotDevice } from './generate-bot-device';
import { IDevice } from '@models/schema/device-schema';

const DEVICE_QUANTITY = 10;

export const initializeBotDevice = async (): Promise<void> => {
	await generateBotDevice(DEVICE_QUANTITY);

	const registerDeviceQuantity: number = await deviceService.count();

	const deviceList: IDevice[] =
		DEVICE_QUANTITY < registerDeviceQuantity
			? await (
					await deviceService.findAllPag(
						{},
						{ page: 1, limit: DEVICE_QUANTITY }
					)
			  ).docs
			: await deviceService.findAll();

	for (const device of deviceList) {
		await devicePublisher({
			...device.toObject(),
		});
	}
};
