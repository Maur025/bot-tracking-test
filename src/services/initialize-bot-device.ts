import { deviceService } from './database/device-service';
import { generateBotDevice } from './generate-bot-device';
import { IDevice } from '@models/schema/device-schema';
import redisClient from '@config/redis/create-redis-client';
import { simulateDelay } from './simulate-movement/simulate-delay';
import { getSocketBridge } from '@socket/client/socket-bridge-client';
import { loggerWarn } from '@maur025/core-logger';
import { SocketTopic } from '@src/socket-topics';
import { devicePublisher } from '@kafkaMain/publisher/device-publisher';

const { DEVICES_PUBLISHED_IN_KAFKA } = SocketTopic;
const DEVICE_QUANTITY = 10;

export const initializeBotDevice = async (): Promise<void> => {
	const keys = await redisClient.keys('bot-process:*');

	if (keys.length > 0) {
		await redisClient.del(keys);
	}

	await generateBotDevice(DEVICE_QUANTITY);

	const registerDeviceQuantity: number = await deviceService.count();

	const deviceList: IDevice[] =
		DEVICE_QUANTITY < registerDeviceQuantity
			? (
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

	let botProcessKeys = [];
	let maxRetries = 30;

	while (!botProcessKeys.length && maxRetries > 0) {
		botProcessKeys = await redisClient.keys('bot-process:*');

		await simulateDelay(2);
		maxRetries--;
	}

	if (maxRetries <= 0) {
		loggerWarn(`Bot could not intialized`);
	}

	getSocketBridge().emit(
		DEVICES_PUBLISHED_IN_KAFKA,
		'Devices published successfully'
	);
};
