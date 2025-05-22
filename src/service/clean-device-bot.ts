import redisClient from '@config/redis/create-redis-client';
import { loggerInfo } from '@maur025/core-logger';

export const cleanDeviceBot = async (): Promise<void> => {
	if (!redisClient) {
		return;
	}

	const keys = await redisClient.keys('device-bot:*');
	if (!keys.length) {
		return;
	}

	await redisClient.del(keys);
	loggerInfo(`[redis-primary] Device bot cache clean successfull`);
};
