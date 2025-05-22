import { deviceEvents } from '@config/device-events';
import redisClient from '@config/redis/create-redis-client';
import { getMeiTrackPayload } from './get-mei-track-payload';
import { simulateDelay } from './simulate-delay';
import { emitDataForUdp } from 'util/emit-data-for-udp';
import { loggerDebug } from '@maur025/core-logger';

interface Request {
	deviceId: string;
}

const { IGNITION_ON } = deviceEvents;

export const simulateDeviceMovement = async ({
	deviceId,
}: Request): Promise<void> => {
	let isRunning: string | null = await redisClient.hGet(
		`device-bot:${deviceId}`,
		'running'
	);

	while (JSON.parse(isRunning ?? 'false')) {
		// SIMULATION STRUCTURE
		// 1. INPUT
		const ignition: string | null = await redisClient.hGet(
			`device-bot:${deviceId}`,
			'ignition'
		);

		if (ignition === '0') {
			// simulate ignition
			await redisClient.hSet(`device-bot:${deviceId}`, {
				ignition: 1,
				event: IGNITION_ON,
			});

			const payloadInit = await getMeiTrackPayload({ deviceId });
			emitDataForUdp(payloadInit);
			await simulateDelay(1);
		}
		// 2. UPDATE
		// 3. RENDER

		await simulateDelay(0.1);

		loggerDebug('running');
		// 4. VERIFY END OR FINISH
		isRunning = await redisClient.hGet(`device-bot:${deviceId}`, 'running');
	}
};
