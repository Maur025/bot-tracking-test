import { Position } from 'geojson';
import { generateValidLocation } from './generate-valid-location';
import { loggerDebug } from '@maur025/core-logger';
import redisClient from '@config/redis/create-redis-client';
import { findOptimalRoute } from './find-optimal-route';
import { sendSimulatePathCoords } from './send-simulate-path-coords';

interface Request {
	key: string;
}

export const simulateMovementOnRoute = async ({
	key,
}: Request): Promise<void> => {
	const [lon, lat]: (string | null)[] = await redisClient.hmGet(key, [
		'lon',
		'lat',
	]);

	if (!lat || !lon) {
		return;
	}

	const currentLocation: Position = [Number(lon), Number(lat)];

	let path: Position[] = [];
	let attempt: number = 30;

	while (!path.length && attempt > 0) {
		const newGoalPosition: Position = await generateValidLocation();
		loggerDebug(`new destination: ${newGoalPosition}`);

		path = await findOptimalRoute({
			startPosition: currentLocation,
			goalPosition: newGoalPosition,
		});

		attempt--;
	}

	if (!attempt && !path.length) {
		loggerDebug('FINISH WITHOUT PATH: ROUTE IN CURRENT WAY');

		return;
	}

	await sendSimulatePathCoords({
		key,
		path,
	});
};
