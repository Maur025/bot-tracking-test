import { IGraphWayIntersection } from '@models/schema/graph-way-intersection';
import { distance as turfDistance } from '@turf/turf';
import { Position } from 'geojson';
import { graphWayIntersectionService } from 'service/database/graph-way-intersection-service';
import { getAvailableNodesMap } from './get-available-nodes-map';
import { aStarAlgorithm } from './a-star-algorithm';
import { AvailableNode } from '@models/data/available-node';
import { buildPathByLastNode } from './build-path-by-last-node';

interface Request {
	startPosition: Position;
	goalPosition: Position;
}

export const findOptimalRoute = async ({
	startPosition,
	goalPosition,
}: Request): Promise<Position[]> => {
	const totalDistance: number = turfDistance(startPosition, goalPosition, {
		units: 'meters',
	});

	const startNodeFounded: IGraphWayIntersection[] =
		await graphWayIntersectionService.findNearby({ position: startPosition });

	const goalNodeFounded: IGraphWayIntersection[] =
		await graphWayIntersectionService.findNearby({ position: goalPosition });

	const intermediateNodes: IGraphWayIntersection[] =
		await graphWayIntersectionService.findNearbiesByDistance({
			position: startPosition,
			maxDistance: totalDistance * 1.25,
		});

	const startNode: AvailableNode = startNodeFounded[0].toObject();
	const goalNode: AvailableNode = goalNodeFounded[0].toObject();

	const availableNodes: Map<string, AvailableNode> = getAvailableNodesMap({
		intermediateNodes,
		startNode,
		goalNode,
	});

	const resultingNode: AvailableNode | null = await aStarAlgorithm({
		startNode: { ...startNode },
		goalNode: { ...goalNode },
		availableNodes,
	});

	return buildPathByLastNode({ lastNode: resultingNode });
};
