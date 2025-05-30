import { AvailableNode } from '@models/data/available-node';
import { Position } from 'geojson';

interface Request {
	lastNode?: Partial<AvailableNode> | null;
}

export const buildPathByLastNode = async ({ lastNode }: Request) => {
	let currentNode: Partial<AvailableNode> | null | undefined = lastNode;
	let path: Position[] = [];

	while (currentNode) {
		if (currentNode?.coord?.coordinates) {
			path = [...path, currentNode.coord.coordinates];
		}

		const previusNode = currentNode.parentNode;
		currentNode.parentNode = null;

		currentNode = previusNode;
	}

	lastNode = null;

	return [...path].reverse();
};
