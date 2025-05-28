import { IGraphWayIntersection } from '@models/schema/graph-way-intersection';
import { distance as turfDistance } from '@turf/turf';
import { Position } from 'geojson';
import { getAvailableNodesMap } from './get-available-nodes-map';
import { aStarAlgorithm } from './a-star-algorithm';
import { AvailableNode } from '@models/data/available-node';
import { buildPathByLastNode } from './build-path-by-last-node';
import { graphWayIntersectionService } from '../database/graph-way-intersection-service';

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

	let startNodeFounded: IGraphWayIntersection[] =
		await graphWayIntersectionService.findNearby({ position: startPosition });

	let goalNodeFounded: IGraphWayIntersection[] =
		await graphWayIntersectionService.findNearby({ position: goalPosition });

	const intermediateNodes: IGraphWayIntersection[] =
		await graphWayIntersectionService.findNearbiesByDistance({
			position: startPosition,
			maxDistance: totalDistance * 1.25,
		});

	let startNode: AvailableNode = startNodeFounded[0].toObject();
	let goalNode: AvailableNode = goalNodeFounded[0].toObject();

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

	availableNodes.clear();
	intermediateNodes.length = 0;
	(startNodeFounded as any) = null;
	(goalNodeFounded as any) = null;

	return buildPathByLastNode({ lastNode: resultingNode });
};
