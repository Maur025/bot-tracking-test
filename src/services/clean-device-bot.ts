import redisClient from '@config/redis/create-redis-client';
import { loggerError, loggerInfo } from '@maur025/core-logger';
import { deviceService } from './database/device-service';

export const cleanDeviceBot = async (): Promise<void> => {
	console.log('ENTRO A LA LIMPIEZA DE DATOS');

	if (!redisClient) {
		return;
	}

	const keys = await redisClient.keys('device-bot:*');
	console.log('cantidad de keys', keys);

	if (!keys.length) {
		return;
	}
	console.log('PASO EL IF KEYS');

	for (const key of keys) {
		try {
			const [lon = '0', lat = '0', deviceId]: (string | null)[] =
				await redisClient.hmGet(key, ['lon', 'lat', 'id']);

			if (deviceId && lon !== '0' && lat !== '0') {
				console.log('TIENE LOS DATOS NECESARIOS PARA GUARDAR');

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

	console.log('FINALIZO EL UPDATE');

	await redisClient.del(keys);
	loggerInfo(`[redis-primary] Device bot cache clean successfull`);
};
