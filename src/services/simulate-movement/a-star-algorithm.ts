import { AvailableNode } from '@models/data/available-node';
import { heuristicCalculate } from './heuristic-calculate';
import { loggerDebug } from '@maur025/core-logger';
import { intersectionNodeCache } from '@cache/intersection-node-cache';

interface Request {
	startNode: Partial<AvailableNode>;
	goalNode: Partial<AvailableNode>;
}

export const aStarAlgorithm = ({
	startNode,
	goalNode,
}: Request): Partial<AvailableNode | null> => {
	// estimatedTotalCost(node)  = costFromStart(Node) + estimatedCostToGoal(Node)
	const startNodeCopy = { ...startNode };

	let openNodeList: Partial<AvailableNode>[] = [startNodeCopy];
	const openNodeSet = new Set<string>();
	openNodeSet.add(startNodeCopy.nodeId as string);

	const closedNodeList: Set<string> = new Set<string>();

	startNodeCopy.costFromStart = 0;
	startNodeCopy.estimatedCostToGoal = heuristicCalculate(
		startNodeCopy,
		goalNode
	);
	startNodeCopy.estimatedTotalCost =
		startNodeCopy.costFromStart + startNodeCopy.estimatedCostToGoal;

	while (openNodeList.length > 0) {
		openNodeList.sort(
			(nodeA, nodeB) =>
				(nodeA.estimatedTotalCost ?? 0) - (nodeB.estimatedTotalCost ?? 0)
		);

		const currentNode: Partial<AvailableNode> | undefined =
			openNodeList.shift();

		openNodeSet.delete(currentNode?.nodeId ?? '');

		if (!currentNode) {
			break;
		}

		if (currentNode.nodeId === goalNode.nodeId) {
			loggerDebug(`GOAL NODE FOUND! Node ID: ${goalNode.nodeId}`);
			openNodeSet.clear();
			closedNodeList.clear();
			openNodeList.length = 0;

			return currentNode;
		}

		closedNodeList.add(currentNode.nodeId ?? '');

		for (const neighborId of currentNode?.connections ?? []) {
			if (neighborId === currentNode.nodeId || closedNodeList.has(neighborId)) {
				continue;
			}

			const neighborNodeOriginal: Partial<AvailableNode> | undefined =
				intersectionNodeCache.getNodes().get(neighborId);

			if (!neighborNodeOriginal) {
				continue;
			}

			const neighborNode: Partial<AvailableNode> = {
				...neighborNodeOriginal,
			};

			const tentativeCostFromStart: number =
				(currentNode.costFromStart ?? 0) +
				heuristicCalculate(currentNode, neighborNode);

			if (
				neighborNode.costFromStart === undefined ||
				tentativeCostFromStart < neighborNode.costFromStart
			) {
				neighborNode.costFromStart = tentativeCostFromStart;
				neighborNode.estimatedCostToGoal = heuristicCalculate(
					neighborNode,
					goalNode
				);
				neighborNode.estimatedTotalCost =
					neighborNode.costFromStart + neighborNode.estimatedCostToGoal;

				neighborNode.parentNode = currentNode;

				if (!openNodeSet.has(neighborId)) {
					openNodeList.push(neighborNode);
					openNodeSet.add(neighborId);
				}
			}
		}
	}

	openNodeSet.clear();
	closedNodeList.clear();
	openNodeList.length = 0;

	loggerDebug('PATH NOT FOUNDED');
	return null;
};
