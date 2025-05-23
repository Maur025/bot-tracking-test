import redisClient from '@config/redis/create-redis-client';
import { loggerError, loggerInfo } from '@maur025/core-logger';
import { deviceService } from './database/device-service';

export const cleanDeviceBot = async (): Promise<void> => {
	if (!redisClient) {
		return;
	}

	const keys = await redisClient.keys('device-bot:*');
	if (!keys.length) {
		return;
	}

	for (const key of keys) {
		try {
			const [lon = '0', lat = '0', deviceId]: (string | null)[] =
				await redisClient.hmGet(key, ['lon', 'lat', 'id']);

			if (deviceId && lon !== '0' && lat !== '0') {
				await deviceService.update(deviceId, {
					lastPosition: {
						type: 'Point',
						coordinates: [Number(lon), Number(lat)],
					},
				});
			}
		} catch (error: Error | any) {
			loggerError(`Error processing key ${key}`, error);
		}
	}

	await redisClient.del(keys);
	loggerInfo(`[redis-primary] Device bot cache clean successfull`);
};
