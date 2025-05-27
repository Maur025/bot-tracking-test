import { loggerDebug, loggerWarn } from '@maur025/core-logger';
import {
	distance as distanceTurf,
	lineString as lineStringTurf,
	length as lengthTurf,
	along as alongTurf,
} from '@turf/turf';
import { Feature, LineString, Point, Position } from 'geojson';
import { getMeiTrackPayload } from './get-mei-track-payload';
import { simulateDelay } from './simulate-delay';
import redisClient from '@config/redis/create-redis-client';
import { deviceEvents } from '@config/device-events';
import { emitDataForUdp } from '@utils/emit-data-for-udp';

interface Request {
	path: Position[];
	key: string;
}

const { REPLY_CURRENT_PASSIVE } = deviceEvents;

export const sendSimulatePathCoords = async ({
	path,
	key,
}: Request): Promise<void> => {
	if (path.length <= 1) {
		loggerWarn(`can't move on array of only coordinate`);
		return;
	}

	const goalPositionPath: Position = path[path.length - 1];

	const pathLine: Feature<LineString> = lineStringTurf([...path]);

	const pathLength: number = lengthTurf(pathLine, { units: 'meters' });
	loggerDebug(`Path length: ${pathLength} meters`);

	let remainingDistance: number = pathLength;

	loggerDebug(`Remaining distance to goal: ${remainingDistance} meters`);

	// max speed city = 5 to 15 m/s
	// masx speed highway = 20 to 30 m/s

	let speed: number = 14; // v = m/s
	let emitInterval: number = 1; // seconds
	let currentPosition: number = 0;

	await redisClient.hSet(key, 'inMovement', 'true');

	while (remainingDistance > 1) {
		let stepMeter: number = speed * emitInterval; // v=m/s ==>  m = v * s
		const speedKmh = speed * 3.6;

		currentPosition += stepMeter;

		const deviceStep: Feature<Point> = alongTurf(pathLine, currentPosition, {
			units: 'meters',
		});

		const [deviceStepLon = 0, deviceStepLat = 0] = deviceStep?.geometry
			?.coordinates ?? [0, 0];

		await redisClient.hSet(key, {
			speed: speedKmh.toFixed(2),
			lat: deviceStepLat.toString(),
			lon: deviceStepLon.toString(),
			event: REPLY_CURRENT_PASSIVE,
		});

		// const payload: string = await getMeiTrackPayload({
		// 	key,
		// });

		// emitDataForUdp(payload);
		// await simulateDelay(emitInterval);

		// remainingDistance = distanceTurf(
		// 	deviceStep.geometry?.coordinates,
		// 	goalPositionPath,
		// 	{ units: 'meters' }
		// );
	}

	// await redisClient.hSet(key, 'inMovement', 'false');
};
