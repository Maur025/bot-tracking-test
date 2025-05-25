import { AvailableNode } from '@models/data/available-node';
import { heuristicCalculate } from './heuristic-calculate';
import { loggerDebug } from '@maur025/core-logger';

interface Request {
	startNode: AvailableNode;
	goalNode: AvailableNode;
	availableNodes: Map<string, AvailableNode>;
}

export const aStarAlgorithm = async ({
	startNode,
	goalNode,
	availableNodes,
}: Request): Promise<AvailableNode | null> => {
	// estimatedTotalCost(node)  = costFromStart(Node) + estimatedCostToGoal(Node)

	let openNodeList: AvailableNode[] = [startNode];
	const closedNodeList: Set<string> = new Set<string>();

	startNode.costFromStart = 0;
	startNode.estimatedCostToGoal = heuristicCalculate(startNode, goalNode);
	startNode.estimatedTotalCost =
		startNode.costFromStart + startNode.estimatedCostToGoal;

	while (openNodeList.length > 0) {
		openNodeList.sort(
			(nodeA, nodeB) =>
				(nodeA.estimatedTotalCost ?? 0) - (nodeB.estimatedTotalCost ?? 0)
		);

		const currentNode: AvailableNode | undefined = openNodeList.shift();

		if (!currentNode) {
			break;
		}

		if (currentNode.nodeId === goalNode.nodeId) {
			loggerDebug(`GOAL NODE FOUND! Node ID: ${goalNode.nodeId}`);
			return currentNode;
		}

		closedNodeList.add(currentNode.nodeId ?? '');

		for (const neighborId of currentNode.connections ?? []) {
			if (neighborId === currentNode.nodeId || closedNodeList.has(neighborId)) {
				continue;
			}

			const neighborNode: AvailableNode | undefined =
				availableNodes.get(neighborId);

			if (!neighborNode) {
				continue;
			}

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

				if (!openNodeList.find(node => node.nodeId === neighborId)) {
					openNodeList.push(neighborNode);
				}
			}
		}
	}

	loggerDebug('PATH NOT FOUNDED');
	return null;
};
