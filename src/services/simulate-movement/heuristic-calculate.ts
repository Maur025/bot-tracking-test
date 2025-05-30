import { AvailableNode } from '@models/data/available-node';
import { distance } from '@turf/turf';

export const heuristicCalculate = (
	nodeA: Partial<AvailableNode>,
	nodeB: Partial<AvailableNode>
): number => {
	const positionA = nodeA?.coord?.coordinates ?? [0, 0];

	const positionB = nodeB?.coord?.coordinates ?? [0, 0];

	return distance(positionA, positionB, { units: 'meters' });
};
