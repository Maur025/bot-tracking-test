import { intersectionNodeCache } from '@cache/intersection-node-cache';
import { transitArea } from '@config/transit-area';
import { loggerWarn } from '@maur025/core-logger';
import { AvailableNode } from '@models/data/available-node';
import {
	bbox,
	distance,
	featureCollection,
	point,
	randomPosition,
} from '@turf/turf';
import { BBox, Position } from 'geojson';
import { around } from 'geokdbush';

const { topRight, topLeft, bottomLeft, bottomRight } = transitArea;

export const generateValidPositionToMove = (
	position: Position,
	maxDistance: number = 1000
): Position => {
	const transitAreaPoints = featureCollection([
		point([topRight.lon, topRight.lat]),
		point([topLeft.lon, topLeft.lat]),
		point([bottomLeft.lon, bottomLeft.lat]),
		point([bottomRight.lon, bottomRight.lat]),
	]);

	const transitAreaBox: BBox = bbox(transitAreaPoints);

	let attempt: number = 15;
	let distanceToMove: number = maxDistance + 10000;
	let newRandomPosition = [0, 0];

	while (distanceToMove > maxDistance && attempt > 0) {
		newRandomPosition = randomPosition(transitAreaBox);

		distanceToMove = distance(position, newRandomPosition, { units: 'meters' });

		attempt--;
	}

	if (attempt <= 0) {
		loggerWarn(`can't found a valid position to move`);
		return position;
	}
	const nodeNearbiesIndexList: number[] = around(
		intersectionNodeCache.getIndexedNodes(),
		newRandomPosition[0],
		newRandomPosition[1]
	);

	const indexLimit: number = nodeNearbiesIndexList[0] ?? 0;
	let index: number = 0;
	let nodeToUse: Partial<AvailableNode> | null = null;

	for (const node of intersectionNodeCache.getNodes().values()) {
		if (index === indexLimit) {
			nodeToUse = node;

			break;
		}

		index++;
	}

	return nodeToUse?.coord?.coordinates ?? position;
};
