import { AvailableNode } from '@models/data/available-node';
import { distance } from '@turf/turf';

export const heuristicCalculate = (
	nodeA: AvailableNode,
	nodeB: AvailableNode
): number => {
	const {
		coord: { coordinates: positionA },
	} = nodeA;

	const {
		coord: { coordinates: positionB },
	} = nodeB;

	return distance(positionA, positionB, { units: 'meters' });
};
