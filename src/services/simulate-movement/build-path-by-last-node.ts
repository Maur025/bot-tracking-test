import { AvailableNode } from '@models/data/available-node';
import { Position } from 'geojson';

interface Request {
	lastNode?: AvailableNode | null;
}

export const buildPathByLastNode = async ({ lastNode }: Request) => {
	let currentNode: AvailableNode | null | undefined = lastNode;
	let path: Position[] = [];

	while (currentNode) {
		if (currentNode?.coord?.coordinates) {
			path = [...path, currentNode.coord.coordinates];
		}

		currentNode = currentNode.parentNode;
	}

	return [...path].reverse();
};
