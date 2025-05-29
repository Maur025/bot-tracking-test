import { transitArea } from '@config/transit-area';
import { bbox, featureCollection, point, randomPosition } from '@turf/turf';
import { BBox, Position } from 'geojson';
import { intersectionNodeCache } from '@cache/intersection-node-cache';
import { around } from 'geokdbush';
import { AvailableNode } from '@models/data/available-node';

const { topRight, topLeft, bottomLeft, bottomRight } = transitArea;

export const generateValidLocation = (): Position => {
	const transitAreaPoints = featureCollection([
		point([topRight.lon, topRight.lat]),
		point([topLeft.lon, topLeft.lat]),
		point([bottomLeft.lon, bottomLeft.lat]),
		point([bottomRight.lon, bottomRight.lat]),
	]);

	const transitAreaBox: BBox = bbox(transitAreaPoints);
	const newPosition: Position = randomPosition(transitAreaBox);

	const nodeNearbiesIndexList: number[] = around(
		intersectionNodeCache.getIndexedNodes(),
		newPosition[0],
		newPosition[1],
		1
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

	return nodeToUse?.coord?.coordinates ?? [0, 0];
};
