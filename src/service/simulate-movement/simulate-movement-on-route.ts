import { Point, Position } from 'geojson';
import { generateValidLocation } from './generate-valid-location';
import { loggerDebug } from '@maur025/core-logger';
import { testGraphMovement } from 'util/bot-script-test';
import redisClient from '@config/redis/create-redis-client';

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
		const newDestination: Position = await generateValidLocation();
		loggerDebug(`new destination: ${newDestination}`);

		path = await testGraphMovement(currentLocation, newDestination);

		attempt--;
	}

	if (!attempt) {
		loggerDebug('FINISH WITHOUT PATH: ROUTE IN CURRENT WAY');
	}

	loggerDebug('PATH FOUNDED');
};
