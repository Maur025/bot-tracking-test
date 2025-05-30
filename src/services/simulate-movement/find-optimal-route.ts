import { Position } from 'geojson';
import { aStarAlgorithm } from './a-star-algorithm';
import { AvailableNode } from '@models/data/available-node';
import { buildPathByLastNode } from './build-path-by-last-node';
import { intersectionNodeCache } from '@cache/intersection-node-cache';
import { around } from 'geokdbush';

interface Request {
	startPosition: Position;
	goalPosition: Position;
}

export const findOptimalRoute = async ({
	startPosition,
	goalPosition,
}: Request): Promise<Position[]> => {
	const startNode = getNodeNearby(startPosition);

	const goalNode = getNodeNearby(goalPosition);

	if (!startNode || !goalNode) return [];

	const resultingNode: Partial<AvailableNode> | null = aStarAlgorithm({
		startNode: startNode,
		goalNode: { ...goalNode },
	});

	return buildPathByLastNode({ lastNode: resultingNode });
};

const getNodeNearby = (
	position: Position
): Partial<AvailableNode> | undefined => {
	const indexOfStartNodes = around(
		intersectionNodeCache.getIndexedNodes(),
		position[0],
		position[1],
		1
	);

	let index = 0;

	for (const node of intersectionNodeCache.getNodes().values()) {
		if (index === indexOfStartNodes[0]) {
			return { ...node };
		}

		index++;
	}
};
