import { transitArea } from '@config/transit-area';
import {
	along,
	bbox,
	featureCollection,
	length,
	lineString,
	point,
	randomPosition,
} from '@turf/turf';
import { BBox, Feature, LineString, Position } from 'geojson';
import { wayService } from 'service/database/way-service';
import { IWay } from '@models/schema/way-schema';

const { topRight, topLeft, bottomLeft, bottomRight } = transitArea;

export const generateValidLocation = async (): Promise<Position> => {
	const transitAreaPoints = featureCollection([
		point([topRight.lon, topRight.lat]),
		point([topLeft.lon, topLeft.lat]),
		point([bottomLeft.lon, bottomLeft.lat]),
		point([bottomRight.lon, bottomRight.lat]),
	]);

	const transitAreaBox: BBox = bbox(transitAreaPoints);

	let nearbyWays: IWay[] = [];

	while (!nearbyWays.length) {
		const newPosition: Position = randomPosition(transitAreaBox);

		nearbyWays = await wayService.findNearby([newPosition[0], newPosition[1]]);
	}

	const wayLine: Feature<LineString> = lineString(
		nearbyWays[0].geometry?.coordinates
	);
	const wayLength: number = length(wayLine);

	const randomDistance: number = Math.random() * wayLength;

	return along(wayLine, randomDistance).geometry?.coordinates;
};
