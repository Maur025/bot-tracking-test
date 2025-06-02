import { Position } from 'geojson';
import { findOptimalRoute } from './find-optimal-route';
import { DeviceBotCache } from '@models/data/device-bot-cache';
import { generateValidPositionToMove } from './generate-valid-position-to-move';

interface Request {
	bot: DeviceBotCache;
}

export const getRouteToTravel = async ({
	bot,
}: Request): Promise<Position[]> => {
	const currentLocation: Position = [Number(bot.lon), Number(bot.lat)];

	const newGoalPosition: Position = generateValidPositionToMove(
		currentLocation,
		3000
	);

	if (
		currentLocation[0] === newGoalPosition[0] &&
		currentLocation[1] === newGoalPosition[1]
	) {
		return [];
	}

	const path: Position[] = await findOptimalRoute({
		startPosition: currentLocation,
		goalPosition: newGoalPosition,
	});

	return path;
};
