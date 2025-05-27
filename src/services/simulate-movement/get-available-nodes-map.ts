import { AvailableNode } from '@models/data/available-node';
import { IGraphWayIntersection } from '@models/schema/graph-way-intersection';

interface Request {
	intermediateNodes: IGraphWayIntersection[];
	startNode: AvailableNode;
	goalNode: AvailableNode;
}

export const getAvailableNodesMap = ({
	intermediateNodes,
	startNode,
	goalNode,
}: Request): Map<string, AvailableNode> => {
	const availableNodes: Map<string, AvailableNode> = new Map();

	availableNodes.set(startNode?.nodeId, startNode);
	availableNodes.set(goalNode?.nodeId, goalNode);

	for (const node of intermediateNodes) {
		if (availableNodes.has(node.nodeId)) {
			continue;
		}

		availableNodes.set(node.nodeId, {
			...node,
			coord: { type: 'Point', coordinates: node.coord?.coordinates },
		});
	}

	return availableNodes;
};
