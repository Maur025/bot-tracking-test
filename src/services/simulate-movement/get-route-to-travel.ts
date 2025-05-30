import { Position } from 'geojson';
import { generateValidLocation } from './generate-valid-location';
import { findOptimalRoute } from './find-optimal-route';
import { DeviceBotCache } from '@models/data/device-bot-cache';

interface Request {
	bot: DeviceBotCache;
}

export const getRouteToTravel = async ({
	bot,
}: Request): Promise<Position[]> => {
	const currentLocation: Position = [Number(bot.lon), Number(bot.lat)];

	const newGoalPosition: Position = generateValidLocation();

	const path: Position[] = await findOptimalRoute({
		startPosition: currentLocation,
		goalPosition: newGoalPosition,
	});

	return path;
};
