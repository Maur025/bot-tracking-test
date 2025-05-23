import { deviceEvents } from '@config/device-events';
import redisClient from '@config/redis/create-redis-client';
import { getMeiTrackPayload } from './get-mei-track-payload';
import { simulateDelay } from './simulate-delay';
import { emitDataForUdp } from 'util/emit-data-for-udp';
import { loggerDebug } from '@maur025/core-logger';
import { initDevicePosition } from './init-device-position';
import { simulateMovementOnRoute } from './simulate-movement-on-route';

interface Request {
	deviceId: string;
}

const { IGNITION_ON, REPLY_CURRENT_PASSIVE } = deviceEvents;

export const simulateDeviceMovement = async ({
	deviceId,
}: Request): Promise<void> => {
	const DEVICE_KEY = `device-bot:${deviceId}`;

	let [isRunning, lat, lon]: (string | null)[] = await redisClient.hmGet(
		DEVICE_KEY,
		['running', 'lat', 'lon']
	);

	await initDevicePosition({ key: DEVICE_KEY, lon, lat });

	while (JSON.parse(isRunning ?? 'false')) {
		// SIMULATION STRUCTURE
		// 1. INPUT
		const ignition: string | null = await redisClient.hGet(
			DEVICE_KEY,
			'ignition'
		);

		if (ignition === '0') {
			// simulate ignition
			await redisClient.hSet(DEVICE_KEY, {
				ignition: 1,
				event: IGNITION_ON,
			});

			const payloadInit = await getMeiTrackPayload({ key: DEVICE_KEY });
			emitDataForUdp(payloadInit);
			await simulateDelay(1);
		}
		// 2. UPDATE
		// 3. RENDER

		await simulateMovementOnRoute({ key: DEVICE_KEY });

		// await redisClient.hSet(DEVICE_KEY, 'event', REPLY_CURRENT_PASSIVE);
		// const payload = await getMeiTrackPayload({ deviceId });
		// emitDataForUdp(payload);
		// await simulateDelay(5);

		// PREVENT A BIT OVERLOAD
		await simulateDelay(0.1);

		loggerDebug('running');
		// 4. VERIFY END OR FINISH
		isRunning = await redisClient.hGet(`device-bot:${deviceId}`, 'running');
	}
};
