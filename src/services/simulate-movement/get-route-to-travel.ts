import { Position } from 'geojson';
import { generateValidLocation } from './generate-valid-location';
import { loggerDebug } from '@maur025/core-logger';
import { findOptimalRoute } from './find-optimal-route';
import { DeviceBotCache } from '@models/data/device-bot-cache';

interface Request {
	bot: DeviceBotCache;
}

export const getRouteToTravel = async ({
	bot,
}: Request): Promise<Position[]> => {
	const currentLocation: Position = [Number(bot.lon), Number(bot.lat)];

	let path: Position[] = [];
	let attempt: number = 2;

	while (!path.length && attempt > 0) {
		const newGoalPosition: Position = await generateValidLocation();

		path = await findOptimalRoute({
			startPosition: currentLocation,
			goalPosition: newGoalPosition,
		});

		attempt--;
	}

	if (!attempt && !path.length) {
		loggerDebug('FINISH WITHOUT PATH: ROUTE IN CURRENT WAY');

		return [];
	}

	return path;
};
